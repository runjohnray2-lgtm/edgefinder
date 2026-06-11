'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Lock, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code.trim() }) })
      if (res.ok) { router.push('/'); router.refresh() } else { setError('Invalid access code. Purchase a license to get yours.'); setLoading(false) }
    } catch { setError('Connection error — please try again.'); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">EdgeFinder</h1>
          <p className="text-xs text-slate-400">Prediction Market Edge Tool</p>
        </div>
      </div>
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-4 w-4 text-slate-400" />
          <h2 className="text-slate-100 font-semibold">Enter Access Code</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="XXXX-XXXX-XXXX"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 font-mono text-center text-lg tracking-widest focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
            autoFocus autoComplete="off" spellCheck={false} />
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <button type="submit" disabled={loading || !code.trim()}
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/20">
            {loading ? 'Verifying…' : 'Unlock EdgeFinder'}
          </button>
        </form>
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center mb-3">Don’t have an access code yet?</p>
          <a href="https://radiantzledlighting.gumroad.com/l/edgefinder" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 text-sm font-medium py-2.5 rounded-lg transition-colors">
            Get Access on Gumroad <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      <div className="mt-8 max-w-md w-full grid grid-cols-1 gap-2">
        {['Live arb scanner: Kalshi ↔ PredictIt','+EV finder vs Polymarket sharp prices','Paper trader with P&L tracking','Watch list: Robinhood, Gemini, IBKR'].map(f => (
          <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />{f}
          </div>
        ))}
      </div>
    </div>
  )
}