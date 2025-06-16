import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      trees: {
        Row: {
          id: number
          tree_number: string
          location_id: number
          variety: string
          date_planted: string
          status: string
          created_at: string
        }
        Insert: {
          tree_number: string
          location_id: number
          variety: string
          date_planted: string
          status?: string
          created_at?: string
        }
        Update: {
          tree_number?: string
          location_id?: number
          variety?: string
          date_planted?: string
          status?: string
        }
      }
      tree_logs: {
        Row: {
          id: number
          tree_id: number
          activity: string
          health_status: string
          fertilizer_name: string
          watering_amount: number
          notes: string
          created_at: string
        }
        Insert: {
          tree_id: number
          activity: string
          health_status?: string
          fertilizer_name?: string
          watering_amount?: number
          notes?: string
          created_at?: string
        }
        Update: {
          activity?: string
          health_status?: string
          fertilizer_name?: string
          watering_amount?: number
          notes?: string
        }
      }
      batch_logs: {
        Row: {
          id: number
          plot_name: string
          activity: string
          fertilizer_name: string
          application_method: string
          notes: string
          created_at: string
        }
        Insert: {
          plot_name: string
          activity: string
          fertilizer_name?: string
          application_method?: string
          notes?: string
          created_at?: string
        }
        Update: {
          plot_name?: string
          activity?: string
          fertilizer_name?: string
          application_method?: string
          notes?: string
        }
      }
      tree_costs: {
        Row: {
          id: number
          activity: string
          cost: number
          notes: string
          created_at: string
        }
        Insert: {
          activity: string
          cost: number
          notes?: string
          created_at?: string
        }
        Update: {
          activity?: string
          cost?: number
          notes?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'farm-worker'
          full_name: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'farm-worker'
          full_name: string
          created_at?: string
        }
        Update: {
          email?: string
          role?: 'admin' | 'farm-worker'
          full_name?: string
        }
      }
      varieties: {
        Row: { id: number; name: string; created_at: string }
        Insert: { name: string; created_at?: string }
        Update: { name?: string }
      }
      fertilizers: {
        Row: { id: number; name: string; created_at: string }
        Insert: { name: string; created_at?: string }
        Update: { name?: string }
      }
      pesticides: {
        Row: { id: number; name: string; created_at: string }
        Insert: { name: string; created_at?: string }
        Update: { name?: string }
      }
      diseases: {
        Row: { id: number; name: string; created_at: string }
        Insert: { name: string; created_at?: string }
        Update: { name?: string }
      }
      activities: {
        Row: { id: number; name: string; created_at: string }
        Insert: { name: string; created_at?: string }
        Update: { name?: string }
      }
    }
  }
}