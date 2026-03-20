# 🚀 Guia de Início Rápido

## Passos para rodar o projeto na sua máquina

### 1️⃣ Instalar dependências
```bash
npm install
```

### 2️⃣ Rodar o projeto
```bash
npm run dev
```

### 3️⃣ Acessar no navegador
Abra: **http://localhost:3000**

---

## ✅ O que já está configurado

✔️ **Chave da API do Gemini** - Configurada no arquivo `.env.local`  
✔️ **Firebase** - Conectado ao banco de dados (arquivo `firebase-applet-config.json`)  
✔️ **Compressão de imagens** - Sistema automático funcionando  
✔️ **Geração de IA** - Modelos Gemini prontos para uso  

---

## 🎯 Próximos passos

1. Acesse `/admin/login` para fazer login
2. Vá em "Novo Post" para criar conteúdo com IA
3. Veja seus posts na página inicial

---

## 🆘 Problemas?

- **Porta 3000 ocupada?** Use: `npm run dev -- -p 3001`
- **Erro de API?** Verifique o arquivo `.env.local`
- **Firebase não conecta?** As credenciais já estão no `firebase-applet-config.json`

---

## 📚 Documentação completa

Veja o arquivo [README.md](README.md) para mais detalhes.
