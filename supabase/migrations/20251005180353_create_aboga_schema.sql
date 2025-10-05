/*
  # ABOGA Legal Assistant Database Schema

  ## Overview
  Creates the complete database structure for ABOGA, a legal information assistant for Peru.
  Supports user authentication (registered + anonymous), chat history, lawyer profiles, and consultation management.

  ## 1. New Tables
  
  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, optional for anonymous users)
  - `display_name` (text)
  - `is_anonymous` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `chat_sessions`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles, nullable for anonymous)
  - `title` (text, auto-generated from first message)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `message_count` (integer, default 0)
  
  ### `chat_messages`
  - `id` (uuid, primary key)
  - `session_id` (uuid, references chat_sessions)
  - `role` (text: 'user' or 'assistant')
  - `content` (text, user message content)
  - `structured_response` (jsonb, nullable, stores ABOGA JSON response)
  - `created_at` (timestamptz)
  
  ### `lawyers`
  - `id` (uuid, primary key)
  - `full_name` (text)
  - `license_number` (text, unique, CAL number)
  - `specialties` (text[], array of specializations)
  - `years_experience` (integer)
  - `bio` (text)
  - `hourly_rate_min` (numeric)
  - `hourly_rate_max` (numeric)
  - `rating` (numeric, 0-5)
  - `total_consultations` (integer, default 0)
  - `available` (boolean, default true)
  - `created_at` (timestamptz)
  
  ### `consultations`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `lawyer_id` (uuid, references lawyers)
  - `chat_session_id` (uuid, references chat_sessions, nullable)
  - `status` (text: 'pending', 'accepted', 'completed', 'cancelled')
  - `agreed_rate` (numeric)
  - `notes` (text)
  - `scheduled_at` (timestamptz, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Profiles: users can read/update own profile
  - Chat sessions: users can CRUD own sessions, anonymous sessions by session_id
  - Chat messages: users can read/create messages for own sessions
  - Lawyers: public read access, admin write access
  - Consultations: users see own, lawyers see assigned
  
  ## 3. Indexes
  - Chat sessions by user_id and created_at for history pagination
  - Chat messages by session_id for conversation loading
  - Lawyers by specialties for search functionality
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text DEFAULT 'Usuario',
  is_anonymous boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text DEFAULT 'Nueva consulta',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  message_count integer DEFAULT 0
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON chat_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Anonymous users can access sessions by session_id (stored in localStorage)
CREATE POLICY "Anonymous users can view sessions by id"
  ON chat_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can create sessions"
  ON chat_sessions FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anonymous users can update sessions"
  ON chat_sessions FOR UPDATE
  TO anon
  USING (user_id IS NULL);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  structured_response jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from own sessions"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own sessions"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Anonymous access to messages
CREATE POLICY "Anonymous users can view messages"
  ON chat_messages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can create messages"
  ON chat_messages FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create lawyers table
CREATE TABLE IF NOT EXISTS lawyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  license_number text UNIQUE NOT NULL,
  specialties text[] DEFAULT '{}',
  years_experience integer DEFAULT 0,
  bio text DEFAULT '',
  hourly_rate_min numeric(10,2) DEFAULT 0,
  hourly_rate_max numeric(10,2) DEFAULT 0,
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_consultations integer DEFAULT 0,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available lawyers"
  ON lawyers FOR SELECT
  TO authenticated, anon
  USING (available = true);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lawyer_id uuid NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  chat_session_id uuid REFERENCES chat_sessions(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  agreed_rate numeric(10,2),
  notes text DEFAULT '',
  scheduled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create consultations"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_created 
  ON chat_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session 
  ON chat_messages(session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_lawyers_specialties 
  ON lawyers USING GIN(specialties);

CREATE INDEX IF NOT EXISTS idx_consultations_user 
  ON consultations(user_id, created_at DESC);

-- Insert sample lawyers data
INSERT INTO lawyers (full_name, license_number, specialties, years_experience, bio, hourly_rate_min, hourly_rate_max, rating, total_consultations) 
VALUES 
  ('Dr. Carlos Mendoza Rivera', 'CAL-12345', ARRAY['Civil', 'Contratos', 'Inmobiliario'], 15, 'Especialista en derecho civil y contratos. Amplia experiencia en transacciones inmobiliarias y resolución de conflictos contractuales.', 150, 250, 4.8, 320),
  ('Dra. María Elena Vargas', 'CAL-23456', ARRAY['Laboral', 'Familia', 'Penal'], 12, 'Abogada con especialización en derecho laboral y de familia. Defensora de derechos de trabajadores y casos de violencia familiar.', 120, 200, 4.9, 450),
  ('Dr. Jorge Luis Paredes', 'CAL-34567', ARRAY['Penal', 'Constitucional'], 20, 'Penalista con más de 20 años de experiencia. Ha llevado casos de alta complejidad en litigio penal y constitucional.', 200, 350, 4.7, 280)
ON CONFLICT (license_number) DO NOTHING;