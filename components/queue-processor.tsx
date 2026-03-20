'use client';
import { useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { compressImage } from '@/lib/image-utils';
import { dispatchWebhooks } from '@/lib/webhook-utils';
import { GoogleGenAI, Type } from '@google/genai';

const getAi = () => new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'dummy' });

export default function QueueProcessor() {
  useEffect(() => {
    const processQueue = async () => {
      try {
        const now = new Date().toISOString();
        
        // Process pending queue items
        const q = query(collection(db, 'topic_queue'), where('status', '==', 'pending'), where('scheduledAt', '<=', now));
        const snapshot = await getDocs(q);
        
        for (const queueDoc of snapshot.docs) {
          const item = queueDoc.data();
          await updateDoc(doc(db, 'topic_queue', queueDoc.id), { status: 'processing' });
          
          try {
            // Generate Brief
            const briefResponse = await getAi().models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: `Crie um rascunho de pesquisa para um post de blog baseado nesta ideia: "${item.topic}". Contexto: ${item.context || 'Nenhum'}. Tom: ${item.tone}.`,
              config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    proposedTitle: { type: Type.STRING },
                    suggestedExcerpt: { type: Type.STRING }
                  }
                }
              }
            });
            const brief = JSON.parse(briefResponse.text || '{}');
            
            // Generate Content
            const textResponse = await getAi().models.generateContent({
              model: 'gemini-3.1-pro-preview',
              contents: `Escreva um post completo de blog em formato Markdown baseado neste rascunho: ${JSON.stringify(brief)}. Tom: ${item.tone}.`,
              config: {
                systemInstruction: 'Você é um redator de blog profissional. Escreva um post completo e bem estruturado. Limite o tamanho a cerca de 1500 palavras para evitar limites de token.'
              }
            });
            
            // Generate Image
            let coverImageUrl = '';
            try {
              const imageResponse = await getAi().models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: `A highly detailed, professional blog cover image for a post titled: "${brief.proposedTitle}". Tone: ${item.tone}.` }] },
                config: { imageConfig: { aspectRatio: '16:9' } }
              });
              for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                  const base64 = `data:image/png;base64,${part.inlineData.data}`;
                  coverImageUrl = await compressImage(base64, 800, 0.7);
                  break;
                }
              }
            } catch (imgErr) {
              console.error('Image generation failed', imgErr);
            }
            
            // Save Post
            const postData = {
              title: brief.proposedTitle || item.topic,
              body: textResponse.text || '',
              excerpt: brief.suggestedExcerpt || '',
              coverImageUrl,
              status: 'published',
              publishedAt: now,
              aiGenerated: true,
              createdAt: now,
              updatedAt: now,
              authorId: item.authorId
            };
            const docRef = await addDoc(collection(db, 'posts'), postData);
            
            // Dispatch Webhooks
            await dispatchWebhooks({ id: docRef.id, ...postData });
            
            await updateDoc(doc(db, 'topic_queue', queueDoc.id), { status: 'completed' });
          } catch (err) {
            console.error('Failed to process queue item', err);
            await updateDoc(doc(db, 'topic_queue', queueDoc.id), { status: 'failed' });
          }
        }

        // Publish scheduled posts
        const scheduledQ = query(collection(db, 'posts'), where('status', '==', 'scheduled'), where('scheduledAt', '<=', now));
        const scheduledSnapshot = await getDocs(scheduledQ);
        for (const postDoc of scheduledSnapshot.docs) {
          await updateDoc(doc(db, 'posts', postDoc.id), { status: 'published', publishedAt: now });
          
          // Dispatch webhooks for newly published scheduled posts
          const postData = postDoc.data();
          await dispatchWebhooks({ id: postDoc.id, ...postData, status: 'published', publishedAt: now });
        }
        
      } catch (error) {
        console.error('Queue processor error', error);
      }
    };

    const interval = setInterval(processQueue, 60000); // Run every minute
    processQueue(); // Run immediately on mount
    
    return () => clearInterval(interval);
  }, []);

  return null; // Invisible background component
}
