# 🔐 Troubleshooting de Autenticação

Seu app está retornando para login após entrar? Siga este guia para diagnosticar.

---

## 🚀 Passo 1: Usar a Página de Debug

Abra: **http://localhost:3000/debug**

Esta página vai:
1. ✅ Testar conexão com Supabase
2. ✅ Verificar se há sessão ativa
3. ✅ Listar usuários no banco
4. ✅ Deixar você testar sign-up

**Procure por:**
- ✓ Verde = funcionando
- ✗ Vermelho = erro

---

## 🔍 Verificações Comuns

### 1. Verificar Credenciais do Supabase

Abra `.env.local` e confirme:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Se não tiver:
1. Vá em Supabase > Settings > API
2. Copie **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
3. Copie **anon public** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Copie **service_role** (SUPABASE_SERVICE_ROLE_KEY)
5. Cole em `.env.local`
6. **Reinicie** `npm run dev`

### 2. Verificar Autenticação no Supabase

No Supabase (painel web):

1. Vá em **Authentication** > **Users**
2. Veja se seu usuário de teste está lá
3. Se estiver, clique nele e veja o email confirmado

**Problema:** Se não estiver confirmado:
- Vá em **Authentication** > **Policies**
- Configure **Confirm email** para "Disable" (desenvolvimento)

### 3. Verificar Tabela de Usuários

No Supabase:

1. Vá em **SQL Editor**
2. Execute:
```sql
SELECT id, email, weight, goal_liters FROM users LIMIT 10;
```

3. Se vazio, significa que o profile não foi criado
4. Se houver, o email deve bater com o auth user

---

## 🛠️ Possíveis Problemas & Soluções

### Problema 1: "Usuário não encontrado"

**Sintomas:** Login falha ou vai para auth mesmo após login

**Causa:** Profile não foi criado na tabela `users`

**Solução:**
```sql
-- Verificar se há usuários auth sem profile
SELECT au.id, au.email 
FROM auth.users au 
WHERE au.id NOT IN (SELECT id FROM users);

-- Se houver, create o profile manualmente
INSERT INTO users (id, email, weight, age, goal_liters)
VALUES ('seu-user-id', 'email@exemplo.com', 70, 30, 2.1);
```

### Problema 2: "Sessão não persiste"

**Sintomas:** Login funciona, mas página recarrega e volta para auth

**Causa:** JWT token não está sendo salvo/verificado corretamente

**Solução:**
1. Abra DevTools (F12)
2. Vá em **Application** > **Cookies**
3. Procure por `sb-*` cookies (deve ter vários)
4. Se não houver, o problema é na autenticação
5. Vá em **Console** e procure por erros vermelhos

### Problema 3: "Erro de RLS (Row Level Security)"

**Sintomas:** Erro que diz "new row violates row-level security policy"

**Causa:** RLS está bloqueando inserção

**Solução:**
1. Supabase > SQL Editor
2. Execute:
```sql
-- Verificar se RLS está habilitado
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public'
AND tablename = 'users';

-- Desabilitar RLS temporariamente para testes
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs DISABLE ROW LEVEL SECURITY;

-- Depois, habilitar novamente
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
```

### Problema 4: "CORS Error"

**Sintomas:** Console mostra erro CORS

**Solução:**
1. Supabase > Project Settings > API
2. Vá em **CORS Configuration**
3. Adicione seu domínio:
   - Desenvolvimento: `http://localhost:3000`
   - Produção: seu domínio

---

## 📊 Teste Manual Passo-a-Passo

### 1. Criar usuário de teste

1. Abra http://localhost:3000/debug
2. Clique em **"Test Sign-Up"**
3. Aguarde (leva uns 2-3 segundos)
4. Procure por ✓ verde se funcionou

### 2. Fazer login manual

1. Crie conta nova em http://localhost:3000/auth
   - Email: `seu@email.com`
   - Senha: `SenhaForte123!`
   - Peso: `70`
   - Idade: `30`
2. Clique em **"Criar Conta"**
3. Deveria ir para `/dashboard`

### 3. Se não funcionar

1. Abra DevTools (F12)
2. Vá em **Console**
3. Procure por erros vermelhos/amarelos
4. Screenshot do erro
5. Volte para página de debug

---

## 🔧 Verificar Logs do Servidor

Se rodando localmente:

```bash
# Terminal onde rodou npm run dev
# Procure por linhas vermelhas de erro
```

Se no Vercel:

1. Vá em Vercel > Seu projeto > Deployments
2. Clique na última deployment
3. Vá em **Logs**
4. Procure por erros

---

## 🔐 Verificar Políticas RLS

No Supabase SQL Editor:

```sql
-- Ver políticas da tabela users
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Ver políticas de water_logs
SELECT * FROM pg_policies WHERE tablename = 'water_logs';
```

Se vazio, RLS pode não estar configurado corretamente.

**Solução:** Execute novamente o script SQL completo de SETUP.md

---

## 💡 Debug Mode Melhorado

Editei o `useAuth.ts` para ter melhor logging. Agora:

1. Abra DevTools Console (F12)
2. Procure por mensagens tipo:
   - ✓ "Auth state changed: SIGNED_IN"
   - ✗ "Auth error:" (vermelho)
   - "Fetching user profile..."

Essas mensagens ajudam a saber o que está acontecendo.

---

## 📋 Checklist de Verificação

Antes de tudo:

- [ ] .env.local tem credenciais (não vazio)
- [ ] Supabase project está ativo
- [ ] Tabelas foram criadas (SQL script executado)
- [ ] RLS está habilitado
- [ ] npm run dev está rodando sem erros
- [ ] Página http://localhost:3000 carrega

Se tudo tiver ✓:

- [ ] Abrir http://localhost:3000/debug
- [ ] Todos os testes ficam verdes
- [ ] Criar conta nova funciona
- [ ] Login funciona

---

## 🆘 Se Nada Funcionar

1. **Screenshot do erro** (DevTools Console)
2. **Teste a página debug:** http://localhost:3000/debug
3. **Procure por mensagens de erro** (em vermelho)
4. **Verifique Supabase está online:** https://status.supabase.com

---

## 🚀 Solução Nuclear (Reset Completo)

Se realmente nada funcionar, comece do zero:

### 1. Resetar Supabase
```sql
-- Execute no SQL Editor do Supabase

-- 1. Deletar dados
DELETE FROM fasting_sessions;
DELETE FROM notification_prefs;
DELETE FROM water_stats;
DELETE FROM water_logs;
DELETE FROM reminder_settings;
DELETE FROM users;

-- 2. Deletar policies
DROP POLICY IF EXISTS "Users can see own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can see own logs" ON water_logs;
-- ... (deletar todas as outras)

-- 3. Desabilitar RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE water_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_prefs DISABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_sessions DISABLE ROW LEVEL SECURITY;

-- 4. Executar script SQL completo novamente (de SETUP.md)
```

### 2. Resetar Aplicação
```bash
# Terminal
npm run build
npm run dev
```

### 3. Testar
- Abrir http://localhost:3000/debug
- Se funcionar, fazer signup novo

---

## 📞 Se Ainda Não Funcionar

Verifique:
1. Supabase status: https://status.supabase.com
2. Vercel status: https://www.vercel-status.com
3. Internet está funcionando: https://google.com

Se tudo está online:
1. Abra uma issue no GitHub com:
   - Screenshot do erro
   - Output de `/debug`
   - Commits recentes

---

**Desenvolvido com ❤️**

Se conseguiu fazer funcionar: 🎉 Parabéns! Agora explore!

Se ainda está com problemas: Não desista! O suporte está aqui.
