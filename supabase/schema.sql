-- ====================================================================
-- VOCASMK - Supabase / PostgreSQL Database Schema with Row Level Security (RLS)
-- Platform: Gamified English Vocabulary Learning for Indonesian SMK Students
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE vocational_major AS ENUM (
  'TKJ', 'RPL', 'AKUNTANSI', 'PERHOTELAN', 'OTOMOTIF', 'PEMASARAN', 'KEPERAWATAN', 'UMUM'
);
CREATE TYPE question_type AS ENUM (
  'multiple_choice', 'fill_blank', 'matching', 'drag_drop', 'true_false', 'listening', 'word_scramble'
);
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE word_mastery AS ENUM ('new', 'learning', 'mastered');
CREATE TYPE live_room_status AS ENUM ('waiting', 'question', 'scoreboard', 'finished');

-- 3. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  nickname TEXT,
  role user_role NOT NULL DEFAULT 'student',
  avatar TEXT DEFAULT '👨‍🎓',
  avatar_frame TEXT DEFAULT 'default',
  title TEXT DEFAULT 'Pemula Kejuruan',
  major vocational_major NOT NULL DEFAULT 'UMUM',
  school_id UUID,
  school_name TEXT DEFAULT 'SMK Negeri 1 Jakarta',
  class_id UUID,
  class_name TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  coins INTEGER NOT NULL DEFAULT 100,
  streak INTEGER NOT NULL DEFAULT 1,
  power_ups JSONB DEFAULT '{"fifty_fifty": 3, "extra_time": 2, "skip": 1}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SCHOOLS
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT,
  province TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CLASSES (Managed by teachers, joined by students via 6-char code)
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  grade VARCHAR(10) NOT NULL,
  major vocational_major NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  school_name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CLASS MEMBERS (Students enrolled in a class)
CREATE TABLE IF NOT EXISTS public.class_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- 7. TOPICS
CREATE TABLE IF NOT EXISTS public.topics (
  id VARCHAR(64) PRIMARY KEY,
  title TEXT NOT NULL,
  major vocational_major NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MATERIALS
CREATE TABLE IF NOT EXISTS public.materials (
  id VARCHAR(64) PRIMARY KEY,
  title TEXT NOT NULL,
  topic_id VARCHAR(64) REFERENCES public.topics(id) ON DELETE CASCADE,
  major vocational_major NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'vocab_list', 'guide', 'pdf', 'video'
  content TEXT,
  vocab_items JSONB DEFAULT '[]'::JSONB,
  download_url TEXT,
  video_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. QUESTIONS
CREATE TABLE IF NOT EXISTS public.questions (
  id VARCHAR(64) PRIMARY KEY,
  type question_type NOT NULL DEFAULT 'multiple_choice',
  prompt TEXT NOT NULL,
  prompt_id TEXT,
  audio_word TEXT,
  image_url TEXT,
  options JSONB, -- Array of strings for multiple choice
  correct_answer TEXT NOT NULL,
  matching_pairs JSONB, -- Array of {english, indonesian}
  drag_tokens JSONB, -- Array of tokens
  explanation TEXT NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'easy',
  topic_id VARCHAR(64) REFERENCES public.topics(id) ON DELETE SET NULL,
  topic_name TEXT,
  major vocational_major NOT NULL DEFAULT 'UMUM',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. QUIZZES
CREATE TABLE IF NOT EXISTS public.quizzes (
  id VARCHAR(64) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  topic_id VARCHAR(64) REFERENCES public.topics(id) ON DELETE SET NULL,
  major vocational_major NOT NULL DEFAULT 'UMUM',
  time_limit_seconds INTEGER NOT NULL DEFAULT 20,
  passing_score INTEGER NOT NULL DEFAULT 75,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  shuffle_options BOOLEAN NOT NULL DEFAULT TRUE,
  question_ids JSONB NOT NULL DEFAULT '[]'::JSONB,
  assigned_class_ids JSONB NOT NULL DEFAULT '[]'::JSONB,
  due_date DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. QUIZ ATTEMPTS & ANSWERS
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id VARCHAR(64) PRIMARY KEY,
  quiz_id VARCHAR(64) NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attempt_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id VARCHAR(64) NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id VARCHAR(64) NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER NOT NULL
);

-- 12. BADGES & USER BADGES
CREATE TABLE IF NOT EXISTS public.badges (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  name_id TEXT NOT NULL,
  description TEXT NOT NULL,
  desc_id TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id VARCHAR(64) NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 13. WORD BANK (Personal saved vocab)
CREATE TABLE IF NOT EXISTS public.word_bank (
  id VARCHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  phonetic TEXT,
  part_of_speech TEXT,
  indonesian TEXT NOT NULL,
  example_sentence TEXT,
  example_translation TEXT,
  major vocational_major NOT NULL DEFAULT 'UMUM',
  mastery_status word_mastery NOT NULL DEFAULT 'learning',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. DAILY MISSIONS
CREATE TABLE IF NOT EXISTS public.daily_missions (
  id VARCHAR(64) PRIMARY KEY,
  title TEXT NOT NULL,
  title_id TEXT NOT NULL,
  description TEXT NOT NULL,
  desc_id TEXT NOT NULL,
  goal INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  coins_reward INTEGER NOT NULL
);

-- 15. LIVE QUIZ ROOMS & PARTICIPANTS (Kahoot-Style)
CREATE TABLE IF NOT EXISTS public.live_rooms (
  pin VARCHAR(6) PRIMARY KEY,
  title TEXT NOT NULL,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id VARCHAR(64) NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  status live_room_status NOT NULL DEFAULT 'waiting',
  current_question_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.live_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_pin VARCHAR(6) NOT NULL REFERENCES public.live_rooms(pin) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  UNIQUE(room_pin, user_id)
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_participants ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can read profiles (for leaderboards); users can only update their own profile.
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Classes: Public viewable, but only teachers can create/update their classes.
CREATE POLICY "Classes are viewable by everyone" ON public.classes
  FOR SELECT USING (true);

CREATE POLICY "Teachers can insert classes" ON public.classes
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own classes" ON public.classes
  FOR UPDATE USING (auth.uid() = teacher_id);

-- Questions & Quizzes: Viewable by all; manageable by teachers and admins.
CREATE POLICY "Questions viewable by everyone" ON public.questions
  FOR SELECT USING (true);

CREATE POLICY "Teachers can manage questions" ON public.questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

CREATE POLICY "Quizzes viewable by everyone" ON public.quizzes
  FOR SELECT USING (true);

-- Word Bank: Strictly private per student!
CREATE POLICY "Users can only view their own word bank" ON public.word_bank
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own word bank" ON public.word_bank
  FOR ALL USING (auth.uid() = user_id);

-- Attempts: Students can see their own attempts; Teachers can see attempts for quizzes they created.
CREATE POLICY "Users view own quiz attempts" ON public.quiz_attempts
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_attempts.quiz_id AND q.created_by = auth.uid()
    )
  );

CREATE POLICY "Users insert own quiz attempts" ON public.quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
