export interface User {
  id: string
  email: string
  weight: number
  age: number
  goal_liters: number
  created_at: string
}

export interface WaterLog {
  id: string
  user_id: string
  amount_ml: number
  timestamp: string
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night'
}

export interface ReminderSettings {
  id: string
  user_id: string
  start_time: string
  end_time: string
  interval_minutes: number
  enabled: boolean
}

export interface WaterStats {
  id: string
  user_id: string
  date: string
  total_consumed: number
  goal: number
  percentage_met: number
}

export interface NotificationPrefs {
  id: string
  user_id: string
  push_enabled: boolean
  email_enabled: boolean
  phone_enabled: boolean
}

export interface FastingSession {
  id: string
  user_id: string
  start_time: string
  end_time: string | null
  notes: string | null
}
