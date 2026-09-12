import { GoogleGenerativeAI } from '@google/generative-ai'

// Gemini only for chatbot + enriching recommendation notes. Never for core scoring.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY

export function isGeminiConfigured() {
  return Boolean(apiKey)
}

export async function chatReply({ history = [], userMessage, context = '' }) {
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY belum diset.')
  const genAI = new GoogleGenerativeAI(apiKey)
  // Alias stabil (terverifikasi live 2026-09-12); model pin seperti 1.5/2.5-flash 404 untuk kunci ini.
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
  const system = [
    'Kamu asisten keuangan koperasi KopAI (Bahasa Indonesia).',
    'Beri saran praktis soal cicilan, simpanan, dan usaha kecil.',
    'Jangan menjanjikan persetujuan pinjaman. Jangan meminta password/OTP.',
    context ? `Konteks anggota: ${context}` : '',
  ].join('\n')
  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: system }] },
      { role: 'model', parts: [{ text: 'Siap membantu keuangan Anda.' }] },
      ...history,
    ],
  })
  const result = await chat.sendMessage(userMessage)
  return result.response.text()
}

export async function enrichNotes(baseNotes, { score, risk }) {
  if (!apiKey) return baseNotes
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
    const prompt = `Tulis ulang 2-3 kalimat rekomendasi kredit koperasi (skor ${score}, risiko ${risk}). Basis: "${baseNotes}". Bahasa Indonesia, nada pengurus koperasi.`
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch {
    return baseNotes // free-tier limit/error -> fallback ke formula lokal
  }
}
