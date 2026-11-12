export type UserRole = 'student' | 'teacher' | 'admin';

export type Major =
  | 'TKJ'
  | 'RPL'
  | 'AKUNTANSI'
  | 'PERHOTELAN'
  | 'OTOMOTIF'
  | 'PEMASARAN'
  | 'KEPERAWATAN'
  | 'UMUM';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  nickname: string;
  role: UserRole;
  avatar: string;
  avatar_frame?: string;
  title?: string;
  major: Major;
  school_id?: string;
  school_name?: string;
  class_id?: string;
  class_name?: string;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  last_active_date?: string;
  power_ups: {
    fifty_fifty: number;
    extra_time: number;
    skip: number;
  };
}

export type QuestionType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'matching'
  | 'drag_drop'
  | 'true_false'
  | 'listening'
  | 'word_scramble';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface MatchingPair {
  english: string;
  indonesian: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  prompt_id?: string;
  audio_word?: string; // Word to pronounce via TTS or audio
  image_url?: string;
  options?: string[]; // For multiple choice
  correct_answer: string; // Plain string or comma-separated or tokenized
  matching_pairs?: MatchingPair[]; // For matching question type
  drag_tokens?: string[]; // For drag & drop / sentence arrangement
  explanation: string;
  difficulty: QuestionDifficulty;
  topic_id: string;
  topic_name?: string;
  major: Major;
  created_by?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  topic_id: string;
  major: Major;
  time_limit_seconds: number;
  passing_score: number;
  max_attempts: number;
  shuffle_options: boolean;
  question_ids: string[];
  assigned_class_ids: string[];
  due_date?: string;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  xp_earned: number;
  total_questions: number;
  correct_count: number;
  completed_at: string;
  time_spent_seconds: number;
  answers: {
    question_id: string;
    user_answer: string;
    is_correct: boolean;
    time_taken: number;
  }[];
}

export interface Badge {
  id: string;
  name: string;
  name_id?: string;
  nameId?: string;
  description: string;
  desc_id?: string;
  descId?: string;
  icon: string;
  category: 'quiz' | 'streak' | 'vocab' | 'speed' | 'special';
  xp_reward: number;
  unlocked_at?: string;
}

export interface WordBankItem {
  id: string;
  user_id: string;
  word: string;
  phonetic: string;
  part_of_speech: string;
  indonesian: string;
  example_sentence: string;
  example_translation: string;
  major: Major;
  mastery_status: 'new' | 'learning' | 'mastered';
  notes?: string;
  created_at: string;
}

export interface Material {
  id: string;
  title: string;
  topic_id: string;
  major: Major;
  description: string;
  type: 'vocab_list' | 'guide' | 'pdf' | 'video';
  content?: string;
  download_url?: string;
  video_url?: string;
  vocab_items?: {
    word: string;
    phonetic: string;
    indonesian: string;
    context: string;
  }[];
}

export interface DailyMission {
  id: string;
  title: string;
  title_id?: string;
  titleId?: string;
  description: string;
  desc_id?: string;
  descId?: string;
  goal: number;
  current: number;
  xp_reward: number;
  coins_reward: number;
  completed: boolean;
  claimed: boolean;
}

export interface ClassRoom {
  id: string;
  code: string; // 6-character code e.g. "TKJ10A"
  name: string;
  grade: string;
  major: Major;
  school_name: string;
  teacher_id: string;
  teacher_name: string;
  student_ids: string[];
  created_at: string;
}

export interface LiveParticipant {
  user_id: string;
  nickname: string;
  avatar: string;
  score: number;
  streak: number;
  last_answer?: string;
  last_answer_correct?: boolean;
}

export interface LiveRoom {
  pin: string;
  title: string;
  host_id: string;
  host_name: string;
  quiz_id: string;
  status: 'waiting' | 'question' | 'scoreboard' | 'finished';
  current_question_index: number;
  question_start_time?: number;
  participants: LiveParticipant[];
}

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  nickname: string;
  avatar: string;
  avatar_frame?: string;
  title?: string;
  major: Major;
  class_name: string;
  school_name: string;
  xp: number;
  level: number;
  streak: number;
  rank: number;
  is_current_user?: boolean;
}
