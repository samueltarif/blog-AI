<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 📝 Blog com IA - Gerador de Artigos e Imagens

Sistema completo de blog com geração automática de conteúdo usando Inteligência Artificial do Google Gemini.

View your app in AI Studio: https://ai.studio/apps/bc71dd2b-5648-4469-90ae-a7bce67ae014

## 🚀 Funcionalidades

- ✨ Geração automática de artigos com IA (Gemini 3.1 Pro)
- 🎨 Criação de capas personalizadas com IA (Gemini 2.5 Flash Image)
- 🗜️ Compressão inteligente de imagens em Base64
- 🔥 Firebase Firestore para armazenamento
- 📱 Interface responsiva e moderna
- 🔐 Sistema de autenticação para admin
- ⚡ Fila de processamento de posts

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Google AI Studio (para chave da API)
- Navegador moderno

## 🛠️ Instalação e Configuração

### 1. Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

### 2. Configuração da API do Gemini

O arquivo `.env.local` já está configurado com a chave da API. Se precisar alterá-la:

1. Acesse [Google AI Studio](https://aistudio.google.com/apikey)
2. Gere uma nova chave API (gratuita)
3. Edite o arquivo `.env.local` e substitua a chave

### 3. Firebase

O Firebase já está totalmente configurado! O arquivo `firebase-applet-config.json` contém todas as credenciais necessárias. Você vai se conectar automaticamente ao mesmo banco de dados.

### 4. Rodar o Projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

## 📁 Estrutura do Projeto

```
├── app/
│   ├── admin/          # Painel administrativo
│   ├── api/            # Rotas da API
│   └── post/           # Páginas de posts
├── components/         # Componentes React
├── lib/
│   ├── firebase.ts     # Configuração Firebase
│   ├── image-utils.ts  # Compressão de imagens
│   └── webhook-utils.ts # Integração com IA
└── .env.local          # Variáveis de ambiente
```

## 🎯 Como Usar

### Criar um Novo Post

1. Acesse `/admin/login`
2. Faça login com suas credenciais
3. Vá em "Novo Post" (`/admin/posts/new`)
4. Preencha o título e descrição
5. Clique em "Gerar com IA"
6. A IA vai criar o artigo completo e a capa automaticamente

### Visualizar Posts

- Página inicial: Lista todos os posts publicados
- Clique em um post para ver o conteúdo completo

## 🔧 Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Firebase** - Banco de dados e autenticação
- **Google Gemini AI** - Geração de conteúdo
- **Tailwind CSS** - Estilização
- **React Hook Form** - Formulários
- **Zod** - Validação de dados

## 🤖 Modelos de IA

- **gemini-3.1-pro-preview** - Geração de textos longos e artigos
- **gemini-2.5-flash-image** - Criação de imagens/capas

## 📝 Notas Importantes

- As imagens são comprimidas automaticamente para otimizar o armazenamento
- O Firebase está em modo de desenvolvimento (sem custos)
- A chave da API do Gemini tem limite gratuito de requisições

## 🐛 Solução de Problemas

### Erro de API Key
Verifique se o arquivo `.env.local` existe e contém a chave correta.

### Erro de Firebase
As credenciais já estão configuradas no `firebase-applet-config.json`. Não é necessário criar um novo projeto.

### Porta 3000 em uso
Execute: `npm run dev -- -p 3001` para usar outra porta.

## 📄 Licença

Este projeto foi criado no AI Studio e está pronto para uso.
