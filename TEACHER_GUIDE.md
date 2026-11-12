# Panduan Penggunaan Guru - VocaSMK 👨‍🏫

Selamat datang di platform **VocaSMK**! Panduan ini dirancang untuk membantu Bapak/Ibu guru Bahasa Inggris di SMK dalam mengelola kelas, menyusun bank soal, mengimpor soal secara massal via CSV, dan memantau perkembangan siswa.

---

## 1. Masuk ke Panel Guru (Teacher Portal)

1. Pada navigasi atas aplikasi, klik tombol avatar profil Anda.
2. Pilih peran **👨‍🏫 Guru (Pak Hendra, S.Pd)**.
3. Menu bawah atau menu atas akan langsung menampilkan tab **"Kelola" (Teacher Portal)**.

---

## 2. Membuat Kelas & Membagikan Kode Akses (6 Karakter)

1. Buka tab **Manajemen Kelas**.
2. Klik tombol **"+ Buat Kelas Baru"**.
3. Isi:
   - **Nama Kelas:** contoh `X TKJ 1` atau `XI Akuntansi 2`.
   - **Tingkat:** Kelas 10, 11, atau 12.
   - **Jurusan:** Pilih jurusan siswa (contoh: TKJ, RPL, Akuntansi, Perhotelan, dll).
4. Klik **Generate Kelas**.
5. Sistem akan otomatis membuat kode unik 6 karakter (contoh: `TKJ10A`).
6. Bagikan kode tersebut kepada siswa. Siswa cukup memasukkan kode di kolom "Gabung Kelas" pada beranda mereka untuk langsung terdaftar di kelas Anda!

---

## 3. Menambahkan Soal Kosakata Manual

1. Buka tab **Bank Soal**.
2. Klik **"+ Buat Soal Manual"**.
3. Pilih tipe soal dari 7 variasi yang tersedia:
   - **Pilihan Ganda (Multiple Choice):** Masukkan pertanyaan, 4 pilihan, dan kunci jawaban.
   - **Isian Singkat (Fill in the Blank):** Siswa mengetik kosakata yang tepat.
   - **Benar / Salah (True / False):** Pertanyaan verifikasi pernyataan teknis.
   - **Audio Listening:** Siswa mendengarkan pelafalan audio sebelum menjawab.
   - **Susun Huruf (Word Scramble):** Mengasah daya ingat ejaan kata teknis.
4. Masukkan **Kunci Jawaban Benar** dan **Pembahasan/Penjelasan Soal**.
5. Klik **Simpan ke Bank Soal**.

---

## 4. Import Soal Massal via CSV / Excel (Bulk Import)

Untuk menghemat waktu, Anda dapat mengunggah puluhan soal sekaligus menggunakan format CSV.

### Format Kolom CSV:
```csv
type,prompt,prompt_id,correct_answer,option1,option2,option3,option4,explanation,difficulty,major
```

### Keterangan Kolom:
| Nama Kolom | Wajib? | Keterangan & Contoh Nilai |
| :--- | :--- | :--- |
| `type` | Ya | `multiple_choice`, `fill_blank`, `true_false`, `listening`, `word_scramble` |
| `prompt` | Ya | Kalimat soal dalam Bahasa Inggris |
| `prompt_id` | Opsional | Terjemahan atau konteks soal dalam Bahasa Indonesia |
| `correct_answer` | Ya | Kunci jawaban yang benar (contoh: `Router`, `payable`) |
| `option1` s/d `option4` | Ya (untuk PG) | Pilihan jawaban untuk tipe pilihan ganda |
| `explanation` | Ya | Pembahasan dan alasan jawaban benar |
| `difficulty` | Ya | `easy`, `medium`, atau `hard` |
| `major` | Ya | `TKJ`, `RPL`, `AKUNTANSI`, `PERHOTELAN`, `OTOMOTIF`, `PEMASARAN`, `KEPERAWATAN`, atau `UMUM` |

### Langkah Import:
1. Klik tombol **"Unduh Template CSV"** di panel bank soal untuk mendapatkan file template contoh.
2. Buka file di Microsoft Excel, Google Sheets, atau text editor, lalu isi soal Anda.
3. Simpan sebagai file `.csv` (Comma Delimited).
4. Klik **"Import CSV"** di aplikasi VocaSMK, lalu tempel isi teks CSV Anda ke kotak yang disediakan.
5. Sistem akan menampilkan **Validasi Otomatis**. Jika ada kolom yang kurang, sistem akan memberitahu nomor barisnya.
6. Klik **"Simpan Semua Soal"** untuk memasukkannya ke dalam bank soal aktif!

---

## 5. Membuat Kuis (Quiz Builder)

1. Buka tab **Quiz Builder**.
2. Klik **"+ Buat Kuis Baru"**.
3. Masukkan judul kuis, jurusan target, batas waktu per soal (misal: 20 detik), dan nilai kelulusan minimal (KKM, misal: 75).
4. Centang soal-soal yang ingin disertakan dari Bank Soal.
5. Klik **Publikasikan Kuis**. Kuis akan langsung muncul di halaman siswa yang bersangkutan.

---

## 6. Mengadakan Kuis Live Interaktif (Kahoot-Style)

1. Buka menu **"Buka Live Quiz"** di beranda atau tab kuis.
2. Pilih peran **"Guru / Host (Mulai Room)"**.
3. Pilih paket kuis yang ingin diujikan, lalu klik **"Generate Room & PIN"**.
4. Tampilkan layar komputer Anda ke proyektor kelas sehingga siswa dapat melihat 6-digit PIN room (contoh: `834192`).
5. Saat semua siswa sudah bergabung di lobby, klik **"Mulai Pertandingan Sekarang!"**.
6. Soal akan tampil serentak dengan hitung mundur. Setelah waktu habis, klik **"Tampilkan Papan Skor"** untuk melihat peringkat siswa secara langsung!

---

## 7. Analisis Nilai & Ekspor CSV

1. Buka tab **Analisis & Heatmap Lemah** untuk melihat rata-rata nilai dan persentase kesalahan per materi.
2. Gunakan grafik **Heatmap Kelemahan Siswa** untuk menentukan topik yang memerlukan materi remedial sebelum ujian kejuruan (UKK).
3. Klik tombol **"Ekspor Nilai Siswa (CSV)"** di pojok kanan atas untuk mengunduh rekapitulasi nilai seluruh siswa ke file spreadsheet Excel.
