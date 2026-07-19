# 💧 Hydra - Water Tracker & Reminder

Um aplicativo web moderno para rastreamento de hidratação diária com lembretes personalizados, análises de progresso e suporte offline via PWA.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## ✨ Funcionalidades

### 🚀 MVP - Pronto para Usar

- ✅ **Autenticação Segura**: Email/Senha com Supabase Auth
- ✅ **Dashboard Intuitivo**: Interface mobile-first estilo Duolingo
- ✅ **Logging de Água**: Botões rápidos (250ml, 500ml, 750ml, 1L) + entrada customizável
- ✅ **Barra de Progresso**: Visualização clara da meta diária
- ✅ **Histórico do Dia**: Registros com timestamp e emoji de período
- ✅ **Meta Personalizada**: Cálculo automático (peso × 30ml) + ajuste manual
- ✅ **Configurações**: Gerenciar meta, ativar/desativar lembretes
- ✅ **PWA**: Funciona offline, instalável como app
- ✅ **Responsivo**: Otimizado para celular, tablet e desktop

### 🔄 Próximas Melhorias (Planejadas)

- Gráficos de histórico (7/30/90 dias)
- Análises e insights de hidratação
- Modo jejum intermitente
- Lembretes automáticos via Railway
- Sincronização offline
- Exportação de dados (PDF/CSV)

---

## 🛠 Tech Stack

| Camada | Tecnologia | Descrição |
|--------|-----------|-----------|
| **Frontend** | Next.js 16 + React 19 | Framework moderno com App Router |
| **Estilo** | TailwindCSS 3 | Utility-first CSS |
| **Backend** | Next.js API Routes | Serverless functions no Vercel |
| **Database** | Supabase (PostgreSQL) | Banco de dados + autenticação |
| **Auth** | Supabase Auth | JWT tokens + RLS |
| **PWA** | Service Worker | Offline + notificações push |
| **Icons** | Lucide React | Ícones SVG modernos |
| **Deployment** | Vercel | Hosting + CI/CD automático |

---

## 🚀 Quick Start

### 1. Clonar & Instalar

```bash
# Clonar repositório
git clone <seu-repo> beberagua
cd beberagua

# Instalar dependências
npm install
```

### 2. Configurar Supabase

Siga as instruções em [SETUP.md](./SETUP.md) para:
- Criar um projeto Supabase
- Executar o script SQL de tabelas
- Copiar credenciais para `.env.local`

### 3. Rodar Localmente

```bash
npm run dev
```

Acesse **http://localhost:3000** 🎉

### 4. Deploy no Vercel

```bash
npm run build  # Verificar build
git push       # Push para GitHub
# Vercel faz deploy automaticamente
```

---

## 📁 Estrutura do Projeto

Ver documentação completa em [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

```
beberagua/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home (redirecionamento)
│   ├── auth/page.tsx      # Login/Sign-up
│   ├── dashboard/page.tsx # Dashboard principal
│   ├── settings/page.tsx  # Configurações
│   ├── layout.tsx         # Layout global
│   └── api/               # Endpoints
├── components/            # Componentes React
├── lib/                   # Lógica compartilhada
│   ├── hooks/            # Custom React hooks
│   ├── supabase.ts       # Cliente Supabase
│   └── types.ts          # Tipos TypeScript
├── public/               # Assets (manifest.json, sw.js, icons)
├── SETUP.md              # Guia de setup
└── PROJECT_STRUCTURE.md  # Documentação detalhada
```

---

## 🔐 Segurança

✅ **Implementado:**
- Row Level Security (RLS) no Supabase
- JWT tokens gerenciados automaticamente
- HTTPS obrigatório em produção
- Sem armazenamento de senhas em texto

---

## 📊 Banco de Dados

6 tabelas principais com RLS habilitado:
- **users** - Perfis de usuários
- **water_logs** - Registros de hidratação
- **reminder_settings** - Configurações de lembretes
- **water_stats** - Estatísticas diárias
- **notification_prefs** - Preferências de notificação
- **fasting_sessions** - Rastreamento de jejum

---

## 🌐 API Endpoints

```
GET    /api/water/today              # Água do dia
POST   /api/auth/logout              # Logout

Futuros:
POST   /api/water/log                # Adicionar água
GET    /api/water/history            # Histórico completo
GET    /api/water/stats              # Análises
```

---

## 🎨 Design

Interface inspirada no **Duolingo**:
- Cores vibrantes (azul primário #2563eb)
- Mobile-first responsivo
- Microinteractions agradáveis
- Feedback visual claro

---

## 📱 PWA Features

- ✅ Instalável como app nativo
- ✅ Funciona offline com cache
- ✅ Suporte a notificações push
- ✅ Sincronização automática
- ✅ Atalhos no menu (Add to Home Screen)

---

## 🧪 Scripts Disponíveis

```bash
npm run dev           # Desenvolvimento (localhost:3000)
npm run build         # Build para produção
npm start             # Rodar app em produção
npm run lint          # Verificar código (ESLint)
npm run type-check    # Verificar tipos TypeScript
```

---

## 📚 Documentação

- **[SETUP.md](./SETUP.md)** - Configuração passo-a-passo
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Arquitetura e organização
- **[Next.js Docs](https://nextjs.org/docs)** - Framework
- **[Supabase Docs](https://supabase.com/docs)** - Database & Auth

---

## 🚀 Roadmap

```
MVP (Atual)
├─ Autenticação + Dashboard
├─ Logging de água
└─ PWA offline

Fase 2
├─ Gráficos e análises
├─ Lembretes automáticos
└─ Modo jejum

Fase 3
├─ App nativo (React Native)
├─ Integrações com wearables
└─ Social features
```

---

## 🐛 Troubleshooting

### Build falha?
```bash
npm run build --verbose
```

### Service Worker não ativa?
DevTools > Application > Service Workers > Unregister > Recarregar

### Erros de autenticação?
- Verifique Supabase está online
- Confirme credenciais em `.env.local`
- Limpe cookies/localStorage

---

## 📄 Licença

MIT © 2024

---

## 💡 Status

| Funcionalidade | Status | Notas |
|---|---|---|
| MVP | ✅ Pronto | Dashboard + Auth funcionando |
| PWA | ✅ Pronto | Offline + Service Worker |
| Gráficos | 🔄 Planejado | Fase 2 |
| Notificações | 🔄 Planejado | Railway Cron |
| App Nativo | 🔄 Planejado | Fase 3 |

---

**Desenvolvido com ❤️ para sua hidratação!**

Comece agora: `npm run dev`
