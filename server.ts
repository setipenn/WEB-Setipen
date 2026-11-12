import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Gemini AI Helper
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Multi-turn Chat Endpoint (Kak Voca - SMK English Mentor)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, major = 'Umum', model = 'gemini-3.8-flash' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY tidak dikonfigurasi. Pastikan API key terpasang di Secrets panel.',
      });
    }

    const systemInstruction = `Kamu adalah "Kak Voca", mentor belajar Bahasa Inggris interaktif, ramah, dan memotivasi khusus untuk siswa SMK (Sekolah Menengah Kejuruan) di Indonesia jurusan ${major}.
Gaya komunikasimu:
- Santai, gaul, suportif, dan mudah dimengerti (Bahasa Indonesia campur English praktis).
- Selalu hubungkan contoh kosakata dengan dunia kerja nyata SMK sesuai jurusan (contoh TKJ: network troubleshooting, server rack; Akuntansi: balance sheet, invoice; Perhotelan: front desk greeting, housekeeping; Otomotif: engine diagnostics, wrench; Bisnis: pitching, customer complaint; Keperawatan: vital signs, triage).
- Berikan pelafalan (fonetik sederhana), arti, contoh kalimat, dan tips menghafal.
- Jika siswa bertanya grammar, jelaskan dengan analogi sederhana tanpa rumus membingungkan.`;

    // Format contents from message history
    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Choose target model
    const targetModel = model || 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({
      text: response.text || 'Maaf, Kak Voca sedang memikirkan jawaban...',
    });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({
      error: error.message || 'Gagal memproses percakapan AI',
    });
  }
});

// 2. Multimodal Image Analysis for Vocab (Vocational Object Scanner)
app.post('/api/gemini/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', major = 'Umum' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY tidak ditemukan di environment.',
      });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'Data gambar wajib disertakan.' });
    }

    // Clean base64 data if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');

    const promptText = `Analisis foto ini untuk pembelajaran kosakata Bahasa Inggris siswa SMK jurusan ${major}.
Identifikasi 3 sampai 6 objek atau aktivitas teknis/kejuruan utama yang terlihat.
Untuk setiap objek berikan:
1. Nama Bahasa Inggris (English Term)
2. Cara Pengucapan Fonetik Sederhana (Pronunciation)
3. Arti Bahasa Indonesia
4. Kelas Kata (Part of Speech: Noun / Verb / Adjective)
5. Contoh Kalimat Kerja di Tempat Magang/Industri (Example Sentence) dengan terjemahannya.
6. Tips Singkat Kejuruan (Vocational Context).

Keluarkan hasil dalam format JSON terstruktur dengan kunci "items": Array of { "english": string, "phonetic": string, "indonesian": string, "partOfSpeech": string, "sentence": string, "sentenceTranslation": string, "workplaceTip": string } dan "overallSummary": string.`;

    // Uses gemini-4-argon as specified in feature instructions
    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = { overallSummary: rawText, items: [] };
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Image Analysis Error:', error);
    // If argon fails or is unavailable on free key, fallback to flash
    try {
      const ai = getGeminiClient();
      if (ai && req.body.imageBase64) {
        const cleanBase64 = req.body.imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: req.body.mimeType || 'image/jpeg',
                  data: cleanBase64,
                },
              },
              {
                text: 'Analisis gambar ini dan berikan kosakata bahasa inggris teknis SMK dalam format JSON dengan array items: [{english, phonetic, indonesian, partOfSpeech, sentence, sentenceTranslation, workplaceTip}].',
              },
            ],
          },
          config: { responseMimeType: 'application/json' },
        });
        return res.json(JSON.parse(fallbackResponse.text || '{}'));
      }
    } catch (fallbackErr) {
      console.error('Fallback image analysis error:', fallbackErr);
    }
    res.status(500).json({ error: error.message || 'Gagal menganalisis gambar' });
  }
});

// 3. Deep Thinking / Deep Reasoning for Grammar & ESP Nuances
app.post('/api/gemini/deep-explain', async (req, res) => {
  try {
    const { query, context = '', major = 'TKJ/RPL' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY tidak dikonfigurasi.' });
    }

    const prompt = `Sebagai pakar linguistik bahasa Inggris terapan untuk pendidikan vokasi (English for Specific Purposes - ESP) jurusan SMK ${major}, berikan penjelasan mendalam, komparatif, dan terstruktur untuk:
Pertanyaan/Topik: "${query}"
Konteks Tambahan: "${context}"

Strukturkan penjelasan:
1. Konsep Inti & Etimologi Teknis
2. Perbedaan Nuansa / Common Mistakes yang sering dilakukan siswa SMK
3. Contoh Penggunaan Riil di Dokumen Kerja / SOP Industri
4. Latihan Singkat & Jawaban untuk Menguji Pemahaman`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-carbon',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error('Deep Explain Error:', error);
    // Fallback to gemini-3.8-flash if carbon is inaccessible
    try {
      const ai = getGeminiClient();
      if (ai) {
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Jelaskan secara mendalam untuk siswa SMK: ${req.body.query}`,
        });
        return res.json({ explanation: fallbackRes.text });
      }
    } catch {
      // ignore
    }
    res.status(500).json({ error: error.message || 'Gagal memproses penjelasan mendalam' });
  }
});

// Serve frontend with Vite in dev, static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VocaSMK Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
