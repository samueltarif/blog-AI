'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { handleFirestoreError, OperationType } from '@/lib/firebase-utils';
import { compressImage } from '@/lib/image-utils';
import { dispatchWebhooks } from '@/lib/webhook-utils';
import { GoogleGenAI, Type } from '@google/genai';
import { Sparkles, FileText, Check, Loader2, ArrowRight, Save, Calendar } from 'lucide-react';

const getAi = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  console.log('[AI] NEXT_PUBLIC_GEMINI_API_KEY presente:', !!apiKey, '| primeiros chars:', apiKey?.slice(0, 8));
  return new GoogleGenAI({ apiKey: apiKey || 'dummy' });
};

// Log executado no momento que o módulo carrega (aparece mesmo sem interação)
console.log('[PAGE LOAD] NewPostPage carregado');
console.log('[PAGE LOAD] GEMINI KEY presente:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
console.log('[PAGE LOAD] GEMINI KEY valor:', process.env.NEXT_PUBLIC_GEMINI_API_KEY?.slice(0, 10) || 'UNDEFINED/VAZIO');

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [mode, setMode] = useState<'select' | 'manual' | 'ai-context' | 'ai-brief' | 'ai-generating' | 'preview'>('select');
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published'>('draft');
  const [scheduledAt, setScheduledAt] = useState('');
  
  const [aiContext, setAiContext] = useState('');
  const [aiTone, setAiTone] = useState('Professional');
  const [aiImageSize, setAiImageSize] = useState('1K');
  const [aiBrief, setAiBrief] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerateBrief = async () => {
    if (!aiContext) return;
    setIsProcessing(true);
    setAiBrief(null);
    setMode('ai-brief');
    
    console.log('[BRIEF] Iniciando geração de rascunho...');
    console.log('[BRIEF] Contexto:', aiContext);
    console.log('[BRIEF] Tom:', aiTone);

    try {
      console.log('[BRIEF] Chamando Gemini gemini-3-flash-preview...');
      const response = await getAi().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a research brief for a blog post based on this idea: "${aiContext}". Tone: ${aiTone}.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              proposedTitle: { type: Type.STRING },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              targetAudience: { type: Type.STRING },
              suggestedExcerpt: { type: Type.STRING }
            }
          }
        }
      });
      console.log('[BRIEF] Resposta bruta do Gemini:', response);
      console.log('[BRIEF] response.text:', response.text);
      const brief = JSON.parse(response.text || '{}');
      console.log('[BRIEF] Brief parseado:', brief);
      setAiBrief(brief);
      setTitle(brief.proposedTitle || '');
      setExcerpt(brief.suggestedExcerpt || '');
    } catch (error: any) {
      console.error('[BRIEF] ERRO ao gerar rascunho:', error);
      console.error('[BRIEF] Mensagem:', error?.message);
      console.error('[BRIEF] Status:', error?.status);
      console.error('[BRIEF] Stack:', error?.stack);
      alert('Falha ao gerar rascunho. Tente novamente.');
      setMode('ai-context');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateContent = async () => {
    setIsProcessing(true);
    setMode('ai-generating');
    setBody('');
    setCoverImageUrl('');
    
    console.log('[CONTENT] Iniciando geração de conteúdo completo...');
    console.log('[CONTENT] Brief:', JSON.stringify(aiBrief));
    console.log('[CONTENT] Título atual:', title);

    try {
      console.log('[CONTENT] Chamando Gemini gemini-3.1-pro-preview para texto...');
      const textResponse = await getAi().models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Escreva um post completo de blog em formato Markdown baseado neste rascunho: ${JSON.stringify(aiBrief)}. Tom: ${aiTone}.`,
        config: {
          systemInstruction: 'Você é um redator de blog profissional. Escreva um post completo e bem estruturado. Limite o tamanho a cerca de 1500 palavras para evitar limites de token.'
        }
      });
      console.log('[CONTENT] Resposta de texto recebida. Tamanho:', textResponse.text?.length);
      setBody(textResponse.text || '');

      try {
        console.log('[CONTENT] Chamando Gemini gemini-2.5-flash-image para imagem...');
        const imageResponse = await getAi().models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: `A highly detailed, professional blog cover image for a post titled: "${title}". Tone: ${aiTone}.` }] },
          config: { imageConfig: { aspectRatio: '16:9' } }
        });
        console.log('[CONTENT] Resposta de imagem recebida:', imageResponse);
        console.log('[CONTENT] Candidates:', imageResponse.candidates?.length);
        
        for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
          console.log('[CONTENT] Part type:', part.text ? 'text' : part.inlineData ? 'inlineData' : 'outro');
          if (part.inlineData) {
            console.log('[CONTENT] inlineData mimeType:', part.inlineData.mimeType, '| tamanho base64:', part.inlineData.data?.length);
            const base64 = `data:image/png;base64,${part.inlineData.data}`;
            const compressed = await compressImage(base64, 800, 0.7);
            console.log('[CONTENT] Imagem comprimida. Tamanho final:', compressed.length);
            setCoverImageUrl(compressed);
            break;
          }
        }
      } catch (imgError: any) {
        console.error('[CONTENT] ERRO na geração da imagem:', imgError);
        console.error('[CONTENT] Mensagem:', imgError?.message);
        console.error('[CONTENT] Status:', imgError?.status);
      }
      
      setMode('preview');
      console.log('[CONTENT] Geração concluída com sucesso.');
    } catch (error: any) {
      console.error('[CONTENT] ERRO ao gerar conteúdo:', error);
      console.error('[CONTENT] Mensagem:', error?.message);
      console.error('[CONTENT] Status:', error?.status);
      console.error('[CONTENT] Stack:', error?.stack);
      alert('Falha ao gerar o conteúdo. O limite de tokens pode ter sido excedido. Tente novamente com um tópico mais específico.');
      setMode('ai-brief');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async (publishStatus: 'draft' | 'scheduled' | 'published') => {
    if (!user) {
      console.error('[SAVE] Usuário não autenticado!');
      return;
    }
    setIsProcessing(true);
    console.log('[SAVE] Salvando post com status:', publishStatus);
    try {
      const now = new Date().toISOString();
      const postData = {
        title, body, excerpt, coverImageUrl,
        status: publishStatus,
        publishedAt: publishStatus === 'published' ? now : null,
        scheduledAt: publishStatus === 'scheduled' ? new Date(scheduledAt).toISOString() : null,
        aiGenerated: mode === 'preview',
        createdAt: now, updatedAt: now, authorId: user.uid
      };
      console.log('[SAVE] Dados do post:', { ...postData, body: postData.body?.slice(0, 100) + '...', coverImageUrl: postData.coverImageUrl?.slice(0, 50) + '...' });
      const docRef = await addDoc(collection(db, 'posts'), postData);
      console.log('[SAVE] Post salvo com ID:', docRef.id);
      
      if (publishStatus === 'published') {
        console.log('[SAVE] Disparando webhooks...');
        await dispatchWebhooks({ id: docRef.id, ...postData });
      }
      
      router.push('/admin/posts');
    } catch (error: any) {
      console.error('[SAVE] ERRO ao salvar post:', error);
      console.error('[SAVE] Mensagem:', error?.message);
      console.error('[SAVE] Code:', error?.code);
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-8"><h1 className="text-3xl font-display font-bold text-zinc-900 mb-2">Criar Novo Post</h1></header>
      
      {mode === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => setMode('ai-context')} className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Sparkles className="w-8 h-8 text-indigo-600" /></div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Assistente de IA</h2>
            <p className="text-zinc-500 text-center">Deixe a IA pesquisar e escrever o post para você com base em uma ideia simples.</p>
          </button>
          <button onClick={() => setMode('manual')} className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 transition-all group">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><FileText className="w-8 h-8 text-zinc-600" /></div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Entrada Manual</h2>
            <p className="text-zinc-500 text-center">Escreva seu post do zero usando nosso editor.</p>
          </button>
        </div>
      )}

      {mode === 'ai-context' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
          <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Sobre o que deve ser o post?</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Ideia do Tópico ou Contexto</label>
              <textarea value={aiContext} onChange={(e) => setAiContext(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px]" placeholder="Ex: Os benefícios da inteligência artificial na educação..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Tom</label>
              <select value={aiTone} onChange={(e) => setAiTone(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Profissional">Profissional</option>
                <option value="Conversacional">Conversacional</option>
                <option value="Educacional">Educacional</option>
              </select>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={handleGenerateBrief} disabled={isProcessing || !aiContext} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 transition-all">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Gerar Rascunho</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'ai-brief' && !aiBrief && (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-zinc-200 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
          <h2 className="text-2xl font-display font-bold text-zinc-900 mb-2">Gerando o rascunho...</h2>
          <p className="text-zinc-500">A IA está pesquisando e estruturando as ideias para o seu post.</p>
        </div>
      )}

      {mode === 'ai-brief' && aiBrief && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Revisar Rascunho da Pesquisa</h2>
          <div className="space-y-6">
            <div><h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">Título Proposto</h3><p className="text-lg font-medium text-zinc-900">{aiBrief.proposedTitle}</p></div>
            <div><h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">Pontos Principais</h3><ul className="list-disc pl-5 space-y-2 text-zinc-700">{aiBrief.keyPoints?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}</ul></div>
            <div className="flex justify-end gap-4 pt-4">
              <button onClick={() => setMode('ai-context')} className="px-6 py-3 rounded-xl font-medium text-zinc-600 hover:bg-zinc-100 transition-colors">Voltar</button>
              <button onClick={handleGenerateContent} disabled={isProcessing} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 transition-all">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Gerar Post Completo e Imagem</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'ai-generating' && (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-zinc-200 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
          <h2 className="text-2xl font-display font-bold text-zinc-900 mb-2">A IA está escrevendo seu post...</h2>
          <p className="text-zinc-500">Isso pode levar um minuto enquanto geramos o conteúdo e uma imagem de capa personalizada.</p>
        </div>
      )}

      {(mode === 'preview' || mode === 'manual') && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 space-y-6">
            <div><label className="block text-sm font-medium text-zinc-700 mb-2">Título</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-2">Resumo</label><textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-2">Corpo (Markdown)</label><textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-96 font-mono text-sm" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-2">URL da Imagem de Capa (ou Base64)</label><input type="text" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            {coverImageUrl && <div className="aspect-video w-full rounded-xl overflow-hidden"><img src={coverImageUrl} alt="Capa" className="w-full h-full object-cover" /></div>}
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <select value={status} onChange={(e: any) => setStatus(e.target.value)} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="draft">Rascunho</option><option value="scheduled">Agendado</option><option value="published">Publicado</option>
              </select>
              {status === 'scheduled' && <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />}
            </div>
            <button onClick={() => handleSave(status)} disabled={isProcessing || !title || !body} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 transition-all">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Salvar Post</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
