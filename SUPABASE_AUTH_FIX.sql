-- ============================================================================
-- SUPABASE AUTHENTICATION FIX
-- Execute isto no Supabase SQL Editor para corrigir autenticação
-- ============================================================================

-- 1. LIMPAR DADOS ANTIGOS (Opcional - comentar se quiser manter)
-- DELETE FROM auth.users;
-- DELETE FROM users;

-- 2. GARANTIR QUE AS TABELAS EXISTEM E ESTÃO CORRETAS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  weight INTEGER NOT NULL DEFAULT 70,
  age INTEGER NOT NULL DEFAULT 30,
  goal_liters DECIMAL(4,2) NOT NULL DEFAULT 2.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. HABILITAR RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLICIES (se não existirem)
DROP POLICY IF EXISTS "Users can see own profile" ON users;
CREATE POLICY "Users can see own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
DROP INDEX IF EXISTS idx_users_email;
CREATE INDEX idx_users_email ON users(email);

DROP INDEX IF EXISTS idx_users_created_at;
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- VERIFICAÇÃO - Execute após rodar acima
-- ============================================================================

-- Ver se RLS está habilitado
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'water_logs');

-- Ver políticas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- Ver usuários auth
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
LIMIT 10;

-- Ver usuários no banco
SELECT id, email, weight, goal_liters, created_at
FROM users
LIMIT 10;

-- ============================================================================
-- SCRIPT COMPLETO DE CRIAÇÃO (se precisar resetar tudo)
-- ============================================================================
/*

-- RESETAR TUDO
DROP TABLE IF EXISTS fasting_sessions;
DROP TABLE IF EXISTS notification_prefs;
DROP TABLE IF EXISTS water_stats;
DROP TABLE IF EXISTS water_logs;
DROP TABLE IF EXISTS reminder_settings;
DROP TABLE IF EXISTS users;

-- CRIAR TABELAS
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  weight INTEGER NOT NULL DEFAULT 70,
  age INTEGER NOT NULL DEFAULT 30,
  goal_liters DECIMAL(4,2) NOT NULL DEFAULT 2.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE water_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_consumed INTEGER DEFAULT 0,
  goal INTEGER NOT NULL,
  percentage_met DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  phone_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fasting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HABILITAR RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;

-- CRIAR POLICIES
CREATE POLICY "Users can see own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can see own logs" ON water_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see own reminders" ON reminder_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see own stats" ON water_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see own notification prefs" ON notification_prefs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can see own fasting sessions" ON fasting_sessions FOR ALL USING (auth.uid() = user_id);

-- CRIAR ÍNDICES
CREATE INDEX idx_water_logs_user_timestamp ON water_logs(user_id, timestamp);
CREATE INDEX idx_water_stats_user_date ON water_stats(user_id, date);
CREATE INDEX idx_fasting_sessions_user ON fasting_sessions(user_id);
CREATE INDEX idx_users_email ON users(email);

*/
