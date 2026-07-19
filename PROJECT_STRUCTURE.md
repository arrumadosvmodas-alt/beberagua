# 📁 Estrutura do Projeto Hydra

```
beberagua/
├── app/                              # App Router do Next.js
│   ├── page.tsx                      # Home (redireciona para auth/dashboard)
│   ├── layout.tsx                    # Layout global + PWA metadata
│   ├── globals.css                   # Estilos globais (TailwindCSS)
│   ├── register-sw.tsx               # Registrador do Service Worker
│   │
│   ├── auth/
│   │   └── page.tsx                  # Login/Sign-up
│   │
│   ├── dashboard/
│   │   └── page.tsx                  # Dashboard principal (MVP)
│   │
│   ├── settings/
│   │   └── page.tsx                  # Configurações de meta e lembretes
│   │
│   └── api/                          # API Routes (Next.js Serverless)
│       ├── auth/
│       │   └── logout/route.ts       # Logout endpoint
│       │
│       ├── water/
│       │   └── today/route.ts        # Logs de água do dia
│       │
│       └── [future]/
│           ├── notifications/        # Notificações push
│           ├── analytics/            # Dados de análise
│           └── reminders/            # Gerenciar lembretes
│
├── components/                       # Componentes React reutilizáveis
│   ├── WaterProgressBar.tsx          # Barra de progresso da meta
│   ├── WaterQuickAdd.tsx             # Botões de atalho para adicionar água
│   ├── WaterHistory.tsx              # Histórico diário com timestamp
│   └── [future]/
│       ├── Chart.tsx                 # Gráfico de tendências
│       ├── ReminderSetup.tsx         # Setup de lembretes
│       └── FastingTracker.tsx        # Rastreamento de jejum
│
├── lib/                              # Utilidades e lógica compartilhada
│   ├── supabase.ts                   # Cliente Supabase
│   ├── types.ts                      # Interfaces TypeScript
│   │
│   └── hooks/                        # Custom React Hooks
│       ├── useAuth.ts                # Autenticação (sign up, sign in, sign out)
│       ├── useWaterLogs.ts           # Gerenciar logs de água
│       └── [future]/
│           ├── useReminders.ts       # Configurar lembretes
│           ├── useAnalytics.ts       # Buscar dados de análise
│           └── useFasting.ts         # Rastrear jejum
│
├── public/                           # Assets estáticos
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service Worker
│   ├── icon-192.png                  # App icon (192x192)
│   ├── icon-512.png                  # App icon (512x512)
│   ├── icon-180.png                  # Apple icon
│   └── [future]/
│       ├── icon-maskable.png         # Maskable icon para PWA
│       └── screenshots/              # Screenshots para PWA
│
├── .env.example                      # Template de variáveis de ambiente
├── .env.local                        # Variáveis de ambiente (não committar)
├── .gitignore                        # Arquivos para ignorar no git
│
├── next.config.ts                    # Configuração do Next.js + PWA
├── tailwind.config.ts                # Configuração do TailwindCSS
├── tsconfig.json                     # Configuração do TypeScript
├── eslint.config.mjs                 # Configuração do ESLint
├── package.json                      # Dependências e scripts
├── package-lock.json                 # Lock file do npm
│
├── SETUP.md                          # Guia de configuração inicial
├── PROJECT_STRUCTURE.md              # Este arquivo
├── API_ENDPOINTS.md                  # Documentação de endpoints (future)
└── RAILWAY_SETUP.md                  # Setup do Railway Cron (future)
```

---

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Navegador)              │
│  App Router (Next.js 14) + React Components         │
└────────────────┬────────────────────────────────────┘
                 │
                 ├─→ Service Worker (SW.js)
                 │   ├─ Notificações Push
                 │   ├─ Sincronização Offline
                 │   └─ Cache Management
                 │
                 └─→ API Routes (/api/*)
                     ├─ /api/auth/logout
                     └─ /api/water/today
                            │
                            ▼
        ┌───────────────────────────────────┐
        │   Supabase (PostgreSQL + Auth)    │
        ├───────────────────────────────────┤
        │ Tables:                           │
        │ - users                           │
        │ - water_logs                      │
        │ - reminder_settings               │
        │ - water_stats                     │
        │ - notification_prefs              │
        │ - fasting_sessions                │
        └───────────────────────────────────┘
```

---

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "next": "15.x",                 // Framework React/Server
    "react": "19.x",                // UI library
    "@supabase/supabase-js": "2.x", // Cliente Supabase
    "lucide-react": "latest",       // Ícones SVG
    "recharts": "2.x",              // Gráficos (future)
    "next-pwa": "5.x",              // PWA support
    "class-variance-authority": "0.7.x", // CSS utilities
    "clsx": "2.x"                   // Conditional classes
  },
  "devDependencies": {
    "typescript": "5.x",
    "@types/react": "19.x",
    "tailwindcss": "3.x",
    "eslint": "8.x",
    "@tailwindcss/postcss": "latest"
  }
}
```

---

## 🌳 Página por Página

### 1. **Home (`/`)**
- Redireciona para `/auth` se não autenticado
- Redireciona para `/dashboard` se autenticado

### 2. **Auth (`/auth`)**
- Sign Up: Email, Senha, Peso, Idade
- Sign In: Email, Senha
- Calcula meta automática (peso × 30ml)

### 3. **Dashboard (`/dashboard`)**
- Barra de progresso diária
- Quick add buttons (250ml, 500ml, 750ml, 1L)
- Custom amount input
- Histórico com timestamp
- Stats cards (% meta, copos bebidos)
- Mensagens motivacionais

### 4. **Settings (`/settings`)**
- Ajustar meta de água
- Ativar/desativar notificações
- Horário de lembretes
- Salvar preferências

---

## 🔌 Hooks Customizados

### `useAuth()`
Gerencia autenticação do usuário
- `user`: Dados do usuário atual
- `loading`: Estado de carregamento
- `error`: Mensagem de erro
- `signUp()`: Criar conta
- `signIn()`: Fazer login
- `signOut()`: Logout

### `useWaterLogs(userId)`
Gerencia logs de água diários
- `logs`: Array de logs do dia
- `todayTotal`: Total de ml ingeridos
- `loading`: Estado de carregamento
- `addWaterLog()`: Adicionar novo log
- `deleteWaterLog()`: Remover log
- `refetch()`: Atualizar dados

---

## 🚀 Scripts Disponíveis

```bash
npm run dev           # Rodar em desenvolvimento (localhost:3000)
npm run build         # Build para produção
npm start             # Rodar app em produção
npm run lint          # Verificar código (ESLint)
npm run type-check    # Verificar tipos (TypeScript)
```

---

## 🎨 Estilos & Componentes

### TailwindCSS
- Configuração: `tailwind.config.ts`
- Cores principais: Blue (2563eb) e Indigo (5a67d8)
- Breakpoints responsive: mobile-first

### Componentes Reutilizáveis
Todos em `components/` com:
- TypeScript interfaces para props
- Sem dependências externas (exceto lucide-react para ícones)
- Variações de estado (loading, error, etc.)

---

## 🔐 Segurança - Checklist

- [x] RLS ativado no Supabase
- [x] JWT tokens gerenciados automaticamente
- [x] HTTPS obrigatório (Vercel/produção)
- [x] Sem exposição de credenciais
- [ ] Rate limiting em endpoints públicos (future)
- [ ] CORS configurado (future)
- [ ] Validação de entrada (future)

---

## 📈 Roadmap Completo

```
MVP (Atual)
├─ Auth básica
├─ Logging de água
├─ Dashboard simples
└─ PWA + Offline

Fase 2
├─ Gráficos (Chart.js/Recharts)
├─ Lembretes via Railway
├─ Análises avançadas
└─ Modo jejum

Fase 3
├─ App Nativo (React Native)
├─ Integração com wearables
├─ IA para recomendações
└─ Social features
```

---

## 💡 Dicas de Desenvolvimento

1. **Adicionar nova página:**
   ```bash
   # Criar app/nova-pagina/page.tsx
   ```

2. **Adicionar novo endpoint:**
   ```bash
   # Criar app/api/novo-endpoint/route.ts
   ```

3. **Adicionar novo hook:**
   ```bash
   # Criar lib/hooks/useNovoHook.ts
   ```

4. **Adicionar novo componente:**
   ```bash
   # Criar components/NovoComponente.tsx
   ```

5. **Testar localmente:**
   ```bash
   npm run dev
   # Acessar http://localhost:3000
   ```

---

**Estrutura pronta para escalar! 🚀**
