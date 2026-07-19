# 💧 Hydra - Water Tracker & Reminder Setup Guide

## Visão Geral
Hydra é um aplicativo web moderno para rastreamento de hidratação diária com lembretes personalizados, análises e suporte offline via PWA.

**Stack:** Next.js 14 + TypeScript + TailwindCSS + Supabase + Railway

---

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Conta Supabase (https://supabase.com)
- Conta Vercel (opcional, para deployment)
- Conta Railway (opcional, para scheduler de notificações)

---

## 🚀 Instalação Rápida

### 1. Clone ou Abra o Projeto
```bash
cd beberagua
npm install
```

### 2. Configure o Supabase

#### Criar um Projeto Supabase
1. Vá para https://supabase.com e crie uma conta
2. Crie um novo projeto
3. Aguarde inicializar

#### Criar as Tabelas do Banco de Dados
Vá para **SQL Editor** no Supabase e execute este script:

```sql
-- Criar tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  weight INTEGER NOT NULL,
  age INTEGER NOT NULL,
  goal_liters DECIMAL(4,2) NOT NULL DEFAULT 2.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de logs de água
CREATE TABLE water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de configurações de lembretes
CREATE TABLE reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  start_time TIME DEFAULT '08:00:00',
  end_time TIME DEFAULT '22:00:00',
  interval_minutes INTEGER DEFAULT 60,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de estatísticas
CREATE TABLE water_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_consumed INTEGER DEFAULT 0,
  goal INTEGER NOT NULL,
  percentage_met DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de preferências de notificações
CREATE TABLE notification_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  phone_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de sessões de jejum
CREATE TABLE fasting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
-- Usuários só veem seus próprios dados
CREATE POLICY "Users can see own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can see own logs"
  ON water_logs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can see own reminders"
  ON reminder_settings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can see own stats"
  ON water_stats FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can see own notification prefs"
  ON notification_prefs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can see own fasting sessions"
  ON fasting_sessions FOR ALL
  USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX idx_water_logs_user_timestamp ON water_logs(user_id, timestamp);
CREATE INDEX idx_water_stats_user_date ON water_stats(user_id, date);
CREATE INDEX idx_fasting_sessions_user ON fasting_sessions(user_id);
```

### 3. Configure as Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

Edite `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

Para encontrar suas chaves:
1. Vá em Project Settings > API no Supabase
2. Copie `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
3. Copie `anon` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Copie `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

### 4. Configure Autenticação no Supabase

1. Vá em **Authentication** > **Providers**
2. Ative **Email** (já ativa por padrão)
3. Configure:
   - Email confirmations: Disable (para desenvolvimento)
   - Double confirm: Disable (opcional)

### 5. Rode o Projeto Localmente

```bash
npm run dev
```

Acesse http://localhost:3000

---

## 📝 Funcionalidades Principais

### ✅ MVP - Fase 1 (Pronto)
- [x] Autenticação com email/senha
- [x] Dashboard com progresso diário
- [x] Adicionar água (quick options + custom)
- [x] Histórico do dia
- [x] Meta customizável
- [x] Configurações básicas
- [x] PWA (offline + notificações)
- [x] Interface responsiva mobile-first

### 🔄 Fase 2 (Próximas Melhorias)
- [ ] Gráficos de histórico (7/30/90 dias)
- [ ] Análises e insights
- [ ] Modo jejum intermitente
- [ ] Integração com saúde/atividade
- [ ] Exportação de dados (PDF/CSV)
- [ ] Lembretes em tempo real via Railway
- [ ] Sincronização offline

### 🚀 Fase 3 (Futuro)
- [ ] App nativo (React Native/Flutter)
- [ ] Integração com wearables
- [ ] IA para recomendações personalizadas
- [ ] Social features (desafios, grupos)

---

## 🔔 Configurar Notificações Push

### Gerar chaves VAPID
```bash
npm install -g web-push

# Gerar novo par de chaves
web-push generate-vapid-keys

# Copiar as chaves para .env.local
NEXT_PUBLIC_VAPID_KEY=<public-key>
VAPID_PRIVATE_KEY=<private-key>
```

### Ativar no Aplicativo
As notificações serão solicitadas automaticamente. Quando o usuário permitir:
- O app registra o subscription no Supabase
- Railway pode enviar notificações via FCM/APNS
- Service Worker recebe e exibe notificações

---

## 📱 Deploy no Vercel

### Preparar para Deploy
```bash
# Verificar build
npm run build

# Se tudo passar, fazer push para GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

### Deploy
1. Vá em https://vercel.com
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Adicione as variáveis de ambiente (Settings > Environment Variables)
5. Clique em "Deploy"

---

## 🎨 Personalizacão de Design

O app usa TailwindCSS com cores azuis/indigo. Para customizar:

### Cores Principais
- Primária: `#2563eb` (blue-600)
- Background: `from-blue-50 to-indigo-100`
- Acentos: Verdes para sucesso, vermelhos para alertas

### Modificar Cores
Edite `tailwind.config.ts` ou mude as classes nos componentes.

---

## 🔐 Segurança

✅ Implementado:
- RLS (Row Level Security) no Supabase
- JWT tokens automáticos
- HTTPS obrigatório em produção
- Sem armazenamento de senhas (via Supabase Auth)

🔒 Checklist Pré-Produção:
- [ ] Verificar variáveis de ambiente em produção
- [ ] Ativar confirmação de email
- [ ] Configurar taxa de rate limiting
- [ ] Testar CORS em endpoints públicos
- [ ] Fazer backup dos dados
- [ ] Configurar alertas de segurança

---

## 📊 Monitoramento & Analytics

Sugestões de ferramentas:
- **Vercel Analytics**: Para performance
- **Sentry**: Para erro tracking
- **Google Analytics**: Para uso do app
- **Supabase Monitoring**: Para DB health

---

## 🐛 Troubleshooting

### Erro de Autenticação
- Verifique se Supabase está online
- Confirme as credenciais em `.env.local`
- Limpe cookies/localStorage do navegador

### Service Worker não ativa
- Abra DevTools > Application > Service Workers
- Clique em "Unregister" e recarregue

### Notificações não funcionam
- Verifique permissões no navegador
- Confirme VAPID keys em .env.local
- Teste no modo incógnito

### Erro de build
```bash
npm run build --verbose
# para ver logs detalhados
```

---

## 📚 Recursos Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS](https://tailwindcss.com)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

---

## 📧 Contato & Feedback

Para relatar bugs ou sugerir melhorias:
1. Abra uma issue no GitHub
2. Envie feedback via formulário no app (future feature)

---

**Desenvolvido com 💚 para sua hidratação!**
