# 🔐 Guia Completo de Setup da Autenticação

Siga este guia passo-a-passo para configurar a autenticação corretamente.

---

## ⚠️ PROBLEMA COMUM

Se o login não funciona, é provavelmente porque o Supabase está exigindo **confirmação de email**. 

### ✅ SOLUÇÃO: Desabilitar Confirmação de Email

1. **Vá no Painel Supabase**
2. **Authentication** > **Providers**
3. Procure por **Email**
4. Clique em **Edit email settings**
5. Em **Confirm email**: Selecione **Disable** (para desenvolvimento)
6. Clique em **Save**

Isso permite login imediato sem confirmar email.

---

## 🚀 Setup Completo da Autenticação

### Passo 1: Acessar Painel Supabase

1. Vá para https://app.supabase.com
2. Clique no seu projeto
3. Você deve ver o dashboard

### Passo 2: Verificar Configurações de Email

1. Vá em **Authentication** (menu esquerdo)
2. Clique em **Providers**
3. Procure por **Email / Password**
4. Clique em **Edit**

**Configure assim:**

```
✅ Email Enabled: ON
✅ Confirm email: Disable (desenvolvimento)
✅ Double confirm: Disable
✅ Secure email change: OFF (desenvolvimento)
```

5. Clique **Save**

### Passo 3: Configurar URLs de Redirect

1. Em **Authentication**, vá em **URL Configuration**
2. Em **Redirect URLs**, adicione:
   - `http://localhost:3000/` (desenvolvimento)
   - `http://localhost:3000/auth` (desenvolvimento)
   - `https://seudominio.com/` (produção, depois)

3. Clique **Save**

### Passo 4: Executar Script SQL

1. Vá em **SQL Editor**
2. Clique em **New Query**
3. **Copie TODO o conteúdo** de `SUPABASE_AUTH_FIX.sql`
4. **Cole** no editor
5. Clique em **Run**

Aguarde completar (leva uns segundos).

### Passo 5: Verificar Configuração

Execute esta query:

```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'users';
```

Deve retornar:
```
tablename | rowsecurity
users     | t
```

Se retornar `f`, significa que RLS não está ativado.

---

## 🧪 Testar a Autenticação

### 1. Abrir o App

```bash
npm run dev
```

Acesse: http://localhost:3000

### 2. Criar Conta de Teste

- Email: `teste@example.com`
- Senha: `Senha123!`
- Peso: `70`
- Idade: `30`

Clique em **"Crie uma"** então **"Criar Conta"**

### 3. Você Deve Ver:

✅ Página carrega rápido  
✅ Sem erros vermelhos no console  
✅ Redireciona para `/dashboard`  
✅ Dashboard mostra progresso

### 4. Se Não Funcionar

Abra **DevTools (F12)** > **Console** e procure por:

**Erro tipo 1 - "Email needs to be confirmed"**
```
❌ Solução: Desabilitar confirmação de email (Passo 2 acima)
```

**Erro tipo 2 - "Invalid API Key"**
```
❌ Solução: Verificar credenciais em .env.local
```

**Erro tipo 3 - "Unable to connect to Supabase"**
```
❌ Solução: Internet ou Supabase offline (verificar status.supabase.com)
```

---

## 🔧 Troubleshooting - Cenários Comuns

### Cenário 1: Login criado mas não entra no dashboard

**Sintomas:**
- Sign-up funciona ✓
- Clica em "Entrar" ✓
- Volta para página de login ✗

**Causa:** Profile não foi criado na tabela `users`

**Solução:**

1. Vá em Supabase > **Table Editor**
2. Clique em **users**
3. Veja se seu usuário está lá

Se **não estiver**, execute:

```sql
-- Verificar usuários auth sem profile
SELECT au.id, au.email
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM users);

-- Se houver algum, criar profile manualmente
-- Copie o ID do usuario (au.id) de cima
INSERT INTO users (id, email, weight, age, goal_liters)
VALUES ('COPIAR-ID-AQUI', 'seu@email.com', 70, 30, 2.1);
```

### Cenário 2: RLS bloqueando inserção

**Sintomas:**
```
Error: new row violates row-level security policy
```

**Solução:**

Desabilitar RLS temporariamente:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs DISABLE ROW LEVEL SECURITY;
```

Depois testar. Se funcionar, o problema é RLS.

Depois habilitar novamente:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
```

### Cenário 3: Email requer confirmação

**Sintomas:**
```
Error: Email not confirmed
```

**Solução:**

1. Supabase > **Authentication** > **Providers** > **Email**
2. Em **Confirm email**: Selecione **Disable**
3. Salve
4. Tente login novamente

---

## 📊 Verificações Finais

Checklist de configuração:

```
Supabase Panel:
  ☐ Email provider habilitado
  ☐ Confirmação de email desabilitada
  ☐ Redirect URLs configuradas
  ☐ RLS ativado em usuarios
  ☐ Tabela usuarios existe

.env.local:
  ☐ NEXT_PUBLIC_SUPABASE_URL preenchido
  ☐ NEXT_PUBLIC_SUPABASE_ANON_KEY preenchido
  ☐ SUPABASE_SERVICE_ROLE_KEY preenchido

App:
  ☐ npm run dev rodando sem erros
  ☐ Console sem mensagens vermelhas
  ☐ Página de login carrega
  ☐ Sign-up funciona
  ☐ Login funciona
  ☐ Dashboard aparece
```

Se todos ☐ marcados = **Sucesso!** 🎉

---

## 🆘 Se Nada Funcionar

### Opção 1: Debug Page

Abra: http://localhost:3000/debug

Veja os testes. Se algum falhar, anote:
- Qual teste falhou
- Qual foi o erro
- Screenshot

### Opção 2: Console Browser

Abra DevTools (F12) > Console

Procure por linhas tipo:
```
[Auth] Starting sign up for: teste@example.com
[Auth] User created: uuid-aqui
[Auth] Profile created successfully
[Auth] Signed in: teste@example.com
```

Se aparecer erro antes disso, anote qual.

### Opção 3: SQL Check

Execute no Supabase SQL Editor:

```sql
-- Ver usuários auth
SELECT id, email, email_confirmed_at
FROM auth.users
LIMIT 5;

-- Ver usuários criados
SELECT id, email, weight, goal_liters
FROM users
LIMIT 5;
```

Se faltarem usuários em um ou outro, o problema aparece aí.

---

## 🎯 Workflow Esperado

Quando você faz login/signup, deve acontecer:

```
1. User clica "Criar Conta"
   ↓
2. App valida email/senha/peso/idade
   ↓
3. Cria user em auth.users (Supabase Auth)
   ↓ (aguarda 1s)
4. Cria profile em users (tabela)
   ↓ (aguarda 500ms)
5. Redireciona para /dashboard
   ↓
6. Dashboard carrega com progresso
```

Se falhar em qualquer etapa, o error aparece.

---

## 📋 Quick Checklist

**Se está falhando:**

1. ☐ Desabilitar confirmação de email (Supabase)
2. ☐ Executar SQL fix script
3. ☐ Reiniciar app (Ctrl+C, npm run dev)
4. ☐ Limpar browser cache (Ctrl+Shift+Delete)
5. ☐ Criar conta NOVA (não reutilizar email)
6. ☐ Verificar console (F12 > Console)

**Se ainda não funciona:**

1. ☐ Abrir debug page (http://localhost:3000/debug)
2. ☐ Copiar erro que aparece
3. ☐ Executar SQL check (ver usuarios auth vs users table)
4. ☐ Procurar erro em AUTH_TROUBLESHOOTING.md

---

## ✅ Quando Vai Funcionar

Você saberá que está funcionando quando:

1. ✅ Consegue criar conta
2. ✅ Consegue fazer login
3. ✅ Dashboard carrega sem redirecionar
4. ✅ Consegue adicionar água
5. ✅ Histórico mostra registros

Se todo esse fluxo funciona = **Autenticação OK!** 🎉

---

**Desenvolvido com ❤️ para sua hidratação!**

Dúvidas? Volte aqui!
