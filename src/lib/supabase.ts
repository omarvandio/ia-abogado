import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          created_at: string;
          updated_at: string;
          message_count: number;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title?: string;
          created_at?: string;
          updated_at?: string;
          message_count?: number;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          created_at?: string;
          updated_at?: string;
          message_count?: number;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant';
          content: string;
          structured_response: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'assistant';
          content: string;
          structured_response?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          structured_response?: any | null;
          created_at?: string;
        };
      };
      lawyers: {
        Row: {
          id: string;
          full_name: string;
          license_number: string;
          specialties: string[];
          years_experience: number;
          bio: string;
          hourly_rate_min: number;
          hourly_rate_max: number;
          rating: number;
          total_consultations: number;
          available: boolean;
          created_at: string;
        };
      };
      consultations: {
        Row: {
          id: string;
          user_id: string;
          lawyer_id: string;
          chat_session_id: string | null;
          status: 'pending' | 'accepted' | 'completed' | 'cancelled';
          agreed_rate: number | null;
          notes: string;
          scheduled_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
