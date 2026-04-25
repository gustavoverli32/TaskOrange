# 🍊 Task Orange — Lembretes

App de lembretes e tarefas diárias. PWA que funciona no celular como app nativo.

---

## 🚀 Como colocar no ar (passo a passo para iniciantes)

### Passo 1 — Instalar o Node.js no seu computador

1. Acesse: https://nodejs.org
2. Clique no botão verde **"LTS"** (versão recomendada)
3. Baixe e instale normalmente (Next, Next, Finish)
4. Para confirmar, abra o **Terminal** (Mac) ou **Prompt de Comando** (Windows) e digite:
   ```
   node --version
   ```
   Se aparecer algo tipo `v20.x.x`, deu certo!

### Passo 2 — Criar conta no GitHub

1. Acesse: https://github.com
2. Crie uma conta gratuita (se ainda não tem)

### Passo 3 — Subir o projeto para o GitHub

1. Acesse: https://github.com/new
2. Em **"Repository name"**, digite: `task-orange`
3. Deixe como **Public**
4. Clique em **"Create repository"**
5. No seu computador, extraia o arquivo ZIP deste projeto
6. Abra o **Terminal** (Mac) ou **Prompt de Comando** (Windows)
7. Navegue até a pasta do projeto:
   ```
   cd caminho/da/pasta/task-orange
   ```
8. Execute estes comandos um por vez:
   ```
   git init
   git add .
   git commit -m "primeiro commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/task-orange.git
   git push -u origin main
   ```
   (Troque `SEU-USUARIO` pelo seu nome de usuário do GitHub)

### Passo 4 — Publicar na Vercel (GRÁTIS)

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"** → **"Continue with GitHub"**
3. Autorize a Vercel a acessar seu GitHub
4. Clique em **"Add New..." → "Project"**
5. Encontre o repositório `task-orange` e clique **"Import"**
6. NÃO MUDE NADA nas configurações, apenas clique **"Deploy"**
7. Aguarde 1-2 minutos...
8. 🎉 **Pronto!** A Vercel vai te dar um link tipo: `task-orange.vercel.app`

### Passo 5 — Instalar no celular como app

1. Abra o link da Vercel no **Safari** (iPhone) ou **Chrome** (Android)
2. **iPhone**: toque no ícone de compartilhar (⬆️) → "Adicionar à Tela de Início"
3. **Android**: toque nos 3 pontinhos (⋮) → "Instalar aplicativo"
4. O app aparece na sua tela inicial como qualquer outro app!

---

## 🛠 Rodar localmente (para testar antes de publicar)

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

---

## 📁 Estrutura do projeto

```
task-orange/
├── index.html          ← Página HTML principal
├── package.json        ← Dependências do projeto
├── vite.config.js      ← Configuração do Vite + PWA
├── public/
│   ├── icon-192.png    ← Ícone do app (pequeno)
│   └── icon-512.png    ← Ícone do app (grande)
└── src/
    ├── main.jsx        ← Ponto de entrada React
    └── App.jsx         ← Todo o código do app
```
