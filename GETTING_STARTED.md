# 🚀 Getting Started - Hydra Water Tracker

Bem-vindo! Este documento vai guiar você através dos próximos passos para colocar o aplicativo em funcionamento.

---

## ✅ O que foi criado

### Frontend (100% Pronto)
- ✅ Autenticação (Sign up / Sign in)
- ✅ Dashboard com progresso diário
- ✅ Adicionar água (quick options + custom)
- ✅ Histórico com timestamps
- ✅ Página de configurações
- ✅ PWA com Service Worker
- ✅ Componentes responsivos
- ✅ Hooks customizados (useAuth, useWaterLogs)

### Backend (API Routes)
- ✅ GET `/api/water/today` - Buscar água do dia
- ✅ POST `/api/auth/logout` - Logout
- 🔄 Mais endpoints podem ser criados conforme necessário

### Banco de Dados (Schema)
- ✅ Tabelas definidas no SETUP.md
- ✅ Row Level Security (RLS) configurado
- ✅ Índices para performance
- ✅ Relacionamentos estabelecidos

### Documentação
- ✅ README.md - Visão geral
- ✅ SETUP.md - Guia de configuração completo
- ✅ PROJECT_STRUCTURE.md - Arquitetura detalhada
- ✅ Este arquivo - Próximos passos

---

## 📋 Checklist de Configuração

### Passo 1: Criar Conta Supabase (5 min)
- [ ] Vá para https://supabase.com
- [ ] Clique em "Start your project"
- [ ] Crie uma conta com email
- [ ] Crie um novo projeto (escolha região mais próxima)
- [ ] Aguarde inicializar (~2 min)

### Passo 2: Criar Tabelas (10 min)
- [ ] No Supabase, vá para **SQL Editor**
- [ ] Clique em **New Query**
- [ ] Copie o script SQL completo de `SETUP.md`
- [ ] Cole e clique em **Run**
- [ ] Aguarde completar

### Passo 3: Copiar Credenciais (2 min)
- [ ] No Supabase, vá para **Settings** > **API**
- [ ] Copie:
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`

### Passo 4: Configurar .env.local (2 min)
- [ ] Copie `.env.example` para `.env.local`
- [ ] Preencha com as credenciais do Passo 3
- [ ] Salve o arquivo (não commitar!)

### Passo 5: Rodar Localmente (3 min)
```bash
npm run dev
# Abra http://localhost:3000
```

### Passo 6: Testar Fluxo (5 min)
- [ ] Clique em **"Crie uma"** conta
- [ ] Preencha: Email, Senha, Peso (70kg), Idade (30)
- [ ] Clique em **"Criar Conta"**
- [ ] Você deve ser redirecionado para `/dashboard`
- [ ] Teste adicionar água (clique em botões)
- [ ] Verifique histórico aparece
- [ ] Clique em **Settings** para testar configurações

### Passo 7: Deploy no Vercel (10 min - Opcional)
```bash
# 1. Initialize git (se ainda não tem)
git init
git add .
git commit -m "Initial commit: Hydra Water Tracker MVP"

# 2. Push para GitHub
git push origin main

# 3. Ir para https://vercel.com
# 4. Clique em "New Project"
# 5. Conecte seu repo GitHub
# 6. Adicione environment variables (Settings)
# 7. Deploy!
```

---

## 🎯 Próximos Passos Recomendados

### Curto Prazo (Esta Semana)
1. **Testar completamente em mobile**
   - Use DevTools para simular diferentes celulares
   - Teste dark mode se implementar
   - Verifique se PWA funciona offline

2. **Customizar design (Opcional)**
   - Mudar cores em `tailwind.config.ts` se desejar
   - Adicionar logo/icon personalizado em `public/`
   - Ajustar fonts em `app/layout.tsx`

3. **Configurar domínio próprio (Vercel)**
   - Comprar domínio (ex: namecheap.com, godaddy)
   - Adicionar DNS ao Vercel
   - Configurar SSL (automático no Vercel)

### Médio Prazo (Próximas 2 Semanas)

4. **Adicionar Notificações Push** (Fase 2)
   - Gerar VAPID keys: `npm install -g web-push && web-push generate-vapid-keys`
   - Implementar subscription endpoint
   - Testar notificações no browser

5. **Criar Gráficos** (Fase 2)
   - Instalar: `npm install recharts`
   - Criar componente `ChartHistory.tsx`
   - Adicionar nova página `/analytics`

6. **Implementar Lembretes** (Fase 2)
   - Setup Railway account
   - Criar cron job
   - Integrar com Firebase Cloud Messaging (FCM)

### Longo Prazo (Próximos Meses)

7. **Modo Jejum Intermitente** (Fase 2)
   - Criar tabela `fasting_sessions`
   - Adicionar UI para rastrear jejum
   - Lembretes diferenciados durante jejum

8. **App Nativo** (Fase 3)
   - React Native (iOS/Android)
   - Flutter (alternativa)
   - Integração com wearables

9. **Social Features** (Fase 3)
   - Desafios entre amigos
   - Leaderboards
   - Compartilhamento

---

## 🔑 Variáveis de Ambiente Necessárias

### Desenvolvimento (.env.local)
```env
# Obrigatórios
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-privada

# Opcionais (para futuras features)
NEXT_PUBLIC_VAPID_KEY=sua-chave-publica-vapid
VAPID_PRIVATE_KEY=sua-chave-privada-vapid
```

### Produção (Vercel Settings)
Mesmas variáveis acima, configuradas em:
**Settings > Environment Variables**

---

## 🧪 Testing Checklist

### Autenticação
- [ ] Sign Up funciona
- [ ] Email único (não permite duplicado)
- [ ] Login funciona com credenciais corretas
- [ ] Logout funciona
- [ ] Sessão persiste no refresh
- [ ] Redirecionamento funciona após logout

### Dashboard
- [ ] Barra de progresso aparece
- [ ] Botões rápidos adicionam água
- [ ] Input custom adiciona quantidade
- [ ] Histórico mostra registros
- [ ] Delete funciona
- [ ] Stats cards mostram números corretos

### Settings
- [ ] Meta pode ser alterada
- [ ] Lembretes podem ser ativados/desativados
- [ ] Horário pode ser ajustado
- [ ] Dados salvam no banco

### PWA
- [ ] Service Worker registra
- [ ] App é instalável
- [ ] Funciona offline (se houver cache)
- [ ] Notificação aparece após permissão

### Mobile
- [ ] Interface responsiva em 375px
- [ ] Toques funcionam
- [ ] Scrolling suave
- [ ] Seguro em landscape

---

## 🚨 Troubleshooting Comum

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Build erro com TypeScript
```bash
npm run type-check
# Ver erros específicos
```

### Service Worker não registra
- Verificar `public/sw.js` existe
- DevTools > Application > Service Workers
- Clique em "Unregister" se existente
- Recarregue a página

### Supabase conexão falha
- Verifique Internet
- Confirme URL correta em `.env.local`
- Cheque se projeto está ativo no Supabase

### Email não funciona no sign up
- Supabase por padrão pede confirmação de email
- Configure em Supabase > Authentication > Email (desative para dev)

---

## 📞 Suporte

### Documentação
- [Next.js Docs](https://nextjs.org)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com)
- [Vercel Docs](https://vercel.com/docs)

### Projeto
- README.md - Visão geral
- SETUP.md - Configuração detalhada
- PROJECT_STRUCTURE.md - Arquitetura

---

## 🎉 Você está pronto!

Todos os passos acima completados significa que você tem:
1. ✅ Projeto Next.js rodando localmente
2. ✅ Supabase conectado e funcionando
3. ✅ Autenticação operacional
4. ✅ Dashboard com logging de água
5. ✅ PWA instalável
6. ✅ Pronto para deploy

**Próximo passo:** Siga o checklist acima e comece!

---

## 📝 Dúvidas Frequentes

**P: Preciso de cartão de crédito para Supabase?**  
R: Não, o plano Free funciona bem para desenvolvimento. Paga conforme cresce em produção.

**P: Posso usar outro banco de dados?**  
R: Sim, mas precisaria reescrever o código Supabase. Recomendamos manter por simplicidade.

**P: Como vou receber notificações?**  
R: Fase 2 com Railway Cron + FCM. MVP usa apenas logging.

**P: Quero mudar as cores?**  
R: Edite `tailwind.config.ts` ou as classes TailwindCSS nos componentes.

**P: Posso fazer deploy em outro lugar?**  
R: Sim! Vercel é recomendado (integrado com Next.js). Também funciona em: Netlify, Railway, Render.

---

**Desenvolvido com ❤️ para sua hidratação!**

Dúvidas? Abra uma issue ou verifique a documentação acima.

**Comece agora: `npm run dev`** 🚀
