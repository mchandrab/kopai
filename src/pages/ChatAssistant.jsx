import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { chatReply, isGeminiConfigured, isBusyError } from '../lib/gemini.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { PageHeader, rupiah } from '../components/ui.jsx'

const QUICK = ['Tips bayar cicilan tepat waktu', 'Cara mencatat kas warung harian', 'Berapa aman meminjam dari simpanan saya?']

export default function ChatAssistant() {
  const { user, profile } = useAuth()
  const [msgs, setMsgs] = useState(null)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!user) return
    supabase.from('ai_chat_history').select('*').eq('member_id', user.id)
      .order('created_at', { ascending: true }).limit(50).then(({ data }) => setMsgs(data ?? []))
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, busy])

  async function ask(text) {
    const clean = text.trim()
    if (!clean || busy) return
    setInput('')
    setBusy(true)
    try {
      await supabase.from('ai_chat_history').insert({ member_id: user.id, sender: 'user', message: clean })
      setMsgs((m) => [...(m ?? []), { sender: 'user', message: clean }])
      const context = `simpanan ${rupiah(profile?.total_savings)}, usaha ${profile?.business_type ?? '-'}.`
      const history = (msgs ?? []).slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.message }],
      }))
      let reply
      try {
        reply = await chatReply({ history, userMessage: clean, context })
      } catch (e) {
        reply = isBusyError(e)
          ? 'Server AI sedang sibuk (sudah dicoba 3x). Silakan kirim ulang pertanyaan Anda sebentar lagi. Sementara itu, tips umum: sisihkan 20% pemasukan untuk cicilan dan catat arus kas harian.'
          : 'Mode offline: kunci Gemini belum dipasang. Tips umum — sisihkan 20% pemasukan untuk cicilan, catat setiap pemasukan dan pengeluaran harian, dan dahulukan kebutuhan usaha produktif.'
      }
      await supabase.from('ai_chat_history').insert({ member_id: user.id, sender: 'ai', message: reply })
      setMsgs((m) => [...(m ?? []), { sender: 'ai', message: reply }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl flex flex-col" style={{ height: 'calc(100dvh - 220px)', minHeight: 420 }}>
      <PageHeader title="Asisten Keuangan AI" subtitle="Tanya soal cicilan, simpanan, dan kas usaha." />
      {!isGeminiConfigured() && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-2">
          Berjalan dalam mode offline (tanpa Gemini) — jawaban berupa panduan umum.
        </p>
      )}
      <div className="flex-1 card !p-3 overflow-y-auto space-y-2">
        {(msgs ?? []).length === 0 && msgs !== null && (
          <div className="text-center py-6">
            <p className="text-3xl">💬</p>
            <p className="font-semibold mt-2">Mulai percakapan</p>
            <p className="muted text-sm">Pilih saran cepat atau ketik pertanyaan Anda.</p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {QUICK.map((q) => (
                <button key={q} onClick={() => ask(q)} className="btn-outline !min-h-0 !py-2 text-xs">{q}</button>
              ))}
            </div>
          </div>
        )}
        {(msgs ?? []).map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <span className={`max-w-[85%] px-3 py-2 rounded-2xl text-[15px] leading-relaxed ${m.sender === 'user' ? 'bg-brand-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-900 rounded-bl-md'}`}>
              {m.message}
            </span>
          </div>
        ))}
        {busy && <p className="muted text-sm">Asisten sedang mengetik…</p>}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(input) }} className="mt-2 flex gap-2">
        <input className="field flex-1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tulis pertanyaan..." autoComplete="off" />
        <button disabled={busy || !input.trim()} className="btn-primary !px-5">Kirim</button>
      </form>
    </div>
  )
}
