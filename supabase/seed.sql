-- ====================================================================
-- VOCASMK - Supabase Seed Data (22 Badges, 30+ Questions, Topics, Demo Users)
-- ====================================================================

-- 1. SEED BADGES
INSERT INTO public.badges (id, name, name_id, description, desc_id, icon, category, xp_reward) VALUES
('b_first_quiz', 'First Quiz', 'Langkah Pertama', 'Complete your first English quiz', 'Selesaikan kuis pertamamu', '🎯', 'quiz', 50),
('b_streak_3', '3-Day Fire', 'Api Pemula', 'Keep a 3-day learning streak', 'Pertahankan streak belajar 3 hari berturut-turut', '🔥', 'streak', 100),
('b_streak_7', '7-Day Blaze', 'Api Membara', 'Maintain a 7-day study streak', 'Pertahankan streak belajar 7 hari tanpa putus', '⚡', 'streak', 250),
('b_streak_30', 'Iron Will', 'Disiplin Baja', 'Achieve a 30-day streak', 'Konsisten belajar 30 hari berturut-turut', '🛡️', 'streak', 1000),
('b_perfect_score', 'Perfectionist', 'Skor Sempurna', 'Score 100% on any quiz', 'Dapatkan nilai 100 pada sebuah kuis', '💯', 'quiz', 150),
('b_speed_demon', 'Speed Demon', 'Kilat Menyambar', 'Answer correctly in under 3 seconds', 'Jawab soal dengan benar dalam waktu kurang dari 3 detik', '⚡', 'speed', 100),
('b_quiz_marathon', 'Quiz Marathon', 'Pelari Maraton', 'Complete 10 quizzes', 'Selesaikan 10 kuis kosakata', '🏃', 'quiz', 300),
('b_top_3_weekly', 'Podium Finisher', 'Juara Podium', 'Reach the weekly top 3 leaderboard', 'Masuk peringkat 3 besar mingguan', '🏆', 'special', 500),
('b_vocab_collector', 'Word Collector', 'Kolektor Kata', 'Save 25 words to your Word Bank', 'Simpan 25 kosakata di Bank Kataku', '📚', 'vocab', 150),
('b_vocab_100', 'Living Dictionary', 'Kamus Berjalan', 'Collect 100 words in your Word Bank', 'Kumpulkan 100 kata di Bank Kataku', '📖', 'vocab', 500),
('b_comeback_kid', 'Comeback Kid', 'Bangkit Kembali', 'Retry a failed quiz and score 100%', 'Ulangi kuis yang belum lulus hingga dapat nilai 100%', '🦅', 'special', 200),
('b_listening_pro', 'Golden Ears', 'Telinga Emas', 'Answer 5 listening questions correctly', 'Jawab 5 soal audio listening dengan benar', '🎧', 'quiz', 150),
('b_major_specialist', 'Major Specialist', 'Spesialis Jurusan', 'Complete all quizzes in your major', 'Selesaikan seluruh kuis di jurusanamu', '🎓', 'special', 400),
('b_flashcard_master', 'Flashcard Whiz', 'Raja Flashcard', 'Review 30 flashcards', 'Pelajari 30 kartu kosakata di mode flashcard', '🗂️', 'vocab', 200),
('b_live_quiz_hero', 'Live Quiz Star', 'Bintang Kuis Live', 'Participate and place in a Live Room', 'Ikuti dan raih skor di room kuis live interaktif', '🌟', 'special', 350),
('b_night_owl', 'Night Owl', 'Pejuang Malam', 'Complete a quiz between 20:00 - 23:59', 'Selesaikan kuis di malam hari (20:00 - 23:59)', '🦉', 'special', 100),
('b_early_bird', 'Early Bird', 'Semangat Pagi', 'Complete a mission before 08:00 AM', 'Selesaikan misi harian sebelum jam 08:00 pagi', '🌅', 'special', 100),
('b_scramble_ninja', 'Scramble Ninja', 'Ninja Susun Kata', 'Solve a word scramble in under 5 seconds', 'Selesaikan soal susun kata di bawah 5 detik', '🥷', 'speed', 120),
('b_class_hero', 'Class Pride', 'Kebanggaan Kelas', 'Contribute 1,000 XP for your class leaderboard', 'Sumbang 1.000 XP untuk papan peringkat kelasmu', '🏫', 'special', 300),
('b_level_10', 'Rising Star', 'Bintang Vokasi', 'Reach Level 10', 'Mencapai Level 10 (Pemburu Kata)', '⭐', 'quiz', 250),
('b_level_25', 'Vocab Warrior', 'Pendekar Bahasa', 'Reach Level 25', 'Mencapai Level 25 (Pendekar Bahasa)', '🗡️', 'special', 600),
('b_level_50', 'SMK Word Legend', 'Legenda Vokasi', 'Reach maximum Level 50', 'Mencapai puncak Level 50 (Legenda Kata SMK)', '👑', 'special', 2000)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED TOPICS
INSERT INTO public.topics (id, title, major, description, icon) VALUES
('top_tkj_net', 'Computer Networking & Hardware', 'TKJ', 'Perangkat jaringan, IP subnetting, kabel LAN, router & switch', '🌐'),
('top_rpl_dev', 'Software Development & OOP', 'RPL', 'Konsep OOP, debugging, database, git workflow', '💻'),
('top_aku_fin', 'Financial Reports & Invoicing', 'AKUNTANSI', 'Laporan neraca, utang piutang, buku besar, perpajakan', '📊'),
('top_htl_ops', 'Front Office & Guest Services', 'PERHOTELAN', 'Resepsionis, reservasi kamar, amenities, penanganan keluhan', '🏨'),
('top_oto_eng', 'Engine Troubleshooting & Tools', 'OTOMOTIF', 'Mesin bensin 4 tak, busi, kunci torsi, kaliper rem', '🔧'),
('top_pms_mkt', 'Digital Marketing & Sales', 'PEMASARAN', 'Rasio konversi, promosi digital, display produk retail', '🛍️'),
('top_kpr_nur', 'Clinical Nursing & Patient Care', 'KEPERAWATAN', 'Tanda vital, tensimeter, sterilisasi alat medis, triase', '🩺')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED QUESTIONS (Sample 6 across multiple types)
INSERT INTO public.questions (id, type, prompt, prompt_id, correct_answer, options, explanation, difficulty, topic_id, major, audio_word) VALUES
('q_tkj_1', 'multiple_choice', 'What hardware device directs data packets between different computer networks?', 'Perangkat keras apa yang mengarahkan paket data antar jaringan komputer yang berbeda?', 'Router', '["Router", "Crimping Tool", "Patch Panel", "Monitor"]'::JSONB, 'A router connects multiple networks together and routes traffic using IP addresses.', 'easy', 'top_tkj_net', 'TKJ', 'Router'),
('q_tkj_2', 'fill_blank', 'The maximum data transfer rate of a network connection is called ________.', 'Kapasitas transfer data maksimum suatu koneksi jaringan disebut ________.', 'bandwidth', NULL, 'Bandwidth measures how much data can be transferred over a network in a given amount of time.', 'medium', 'top_tkj_net', 'TKJ', 'Bandwidth'),
('q_tkj_6', 'listening', 'Listen to the audio pronunciation and choose the correct technical word:', 'Dengarkan pelafalan audio dan pilih kata teknis yang tepat:', 'Firewall', '["Firewall", "Firmware", "Fiber Optic", "File Server"]'::JSONB, 'Firewall protects a network from unauthorized incoming or outgoing traffic.', 'easy', 'top_tkj_net', 'TKJ', 'Firewall'),
('q_aku_1', 'multiple_choice', 'Which financial document summarizes a company assets, liabilities, and equity at a specific point in time?', 'Dokumen keuangan mana yang merangkum aset, liabilitas, dan ekuitas perusahaan?', 'Balance Sheet', '["Balance Sheet", "Income Statement", "Purchase Order", "Cash Receipt"]'::JSONB, 'A Balance Sheet shows assets = liabilities + equity.', 'easy', 'top_aku_fin', 'AKUNTANSI', 'Balance Sheet'),
('q_htl_1', 'multiple_choice', 'What do hotel staff call the desk where guests check in and receive keys?', 'Disebut apakah meja tempat tamu melakukan check-in?', 'Front Desk', '["Front Desk", "Housekeeping Closet", "Banquet Hall", "Boiler Room"]'::JSONB, 'The Front Desk is the primary contact point between hotel guests and staff.', 'easy', 'top_htl_ops', 'PERHOTELAN', 'Front Desk'),
('q_oto_1', 'multiple_choice', 'Which component ignites the compressed air-fuel mixture inside a gasoline engine?', 'Komponen mana yang memercikkan bunga api di ruang bakar mesin?', 'Spark Plug', '["Spark Plug", "Brake Pad", "Radiator Fan", "Exhaust Pipe"]'::JSONB, 'A Spark Plug delivers electric current to ignite fuel-air mixture.', 'easy', 'top_oto_eng', 'OTOMOTIF', 'Spark Plug')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED DAILY MISSIONS
INSERT INTO public.daily_missions (id, title, title_id, description, desc_id, goal, xp_reward, coins_reward) VALUES
('mis_1', 'Quick Thinker', 'Jawab 10 Soal Kuis', 'Answer at least 10 vocabulary quiz questions correctly', 'Jawab minimal 10 soal kuis kosakata hari ini', 10, 80, 20),
('mis_2', 'Word Explorer', 'Pelajari 5 Kosakata Baru', 'Review 5 flashcards or add words to your Word Bank', 'Buka 5 flashcard atau simpan kosakata ke Bank Kataku', 5, 60, 15),
('mis_3', 'Quiz Finisher', 'Selesaikan 1 Kuis Jurusan', 'Finish any full quiz with at least passing score', 'Selesaikan 1 kuis jurusan dengan skor minimal kelulusan', 1, 100, 30)
ON CONFLICT (id) DO NOTHING;
