'use client'
import type { NormalizedMarket } from '@/types'
import { formatVolume, formatTimeLeft } from '@/lib/calculations'
import { Info } from 'lucide-react'

interface Props { kalshi: NormalizedMarket[]; polymarket: NormalizedMarket[]; predictit: NormalizedMarket[]; loading: boolean }

function MarketCard({ m }: { m: NormalizedMarket }) {
  return (
    <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition-colors">
      <p className="text-sm text-slate-200 font-medium leading-snug line-clamp-2 mb-2">{m.title}</p>
      <div className="flex items-center justify-between text-xs">
        <div className="flex gap-3"><span className="text-green-400 font-bold">YES {m.yesPrice}¢</span><span className="text-red-400 font-bold">NO {m.noPrice}¢</span></div>
        <div className="flex gap-2 text-slate-500">{m.volume > 0 && <span>{formatVolume(m.volume)}</span>}<span>{formatTimeLeft(m.closeTime)}</span></div>
      </div>
      {m.feeOnProfit && <div className="mt-1.5 text-xs text-amber-400/70">⚠️ 5% fee on profits</div>}
    </div>
  )
}

export default function MarketsTab({ kalshi, polymarket, predictit, loading }: Props) {
  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => (<div key={i} className="space-y-2"><div className="h-8 bg-slate-800 rounded animate-pulse" />{[1,2,3,4].map(j => <div key={j} className="h-20 bg-slate-800 rounded animate-pulse" />)}</div>))}</div>
  )
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center"><div className="text-blue-300 font-bold text-lg">{kalshi.length}</div><div className="text-xs text-blue-400/80">Kalshi markets</div><div className="text-xs text-slate-500 mt-0.5">CFTC ✅ All 50 states</div></div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center"><div className="text-yellow-300 font-bold text-lg">{predictit.length}</div><div className="text-xs text-yellow-400/80">PredictIt markets</div><div className="text-xs text-slate-500 mt-0.5">US legal ✅ Politics focus</div></div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center"><div className="text-purple-300 font-bold text-lg">{polymarket.length}</div><div className="text-xs text-purple-400/80">Polymarket markets</div><div className="text-xs text-slate-500 mt-0.5">📊 Price reference only</div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-500/40 text-blue-300"><div><span className="font-bold text-white">Kalshi</span><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/20 ml-2">Oregon legal ✅</span><p className="text-xs text-slate-500 mt-0.5">CFTC-regulated · All categories</p></div><span className="text-xs text-slate-400">{kalshi.length} markets</span></div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">{kalshi.map(m => <MarketCard key={m.id} m={m} />)}</div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-yellow-500/40 text-yellow-300"><div><span className="font-bold text-white">PredictIt</span><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-500/20 ml-2">Oregon legal ✅</span><p className="text-xs text-slate-500 mt-0.5">Political markets · 5% fee · $3,500 limit</p></div><span className="text-xs text-slate-400">{predictit.length} markets</span></div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">{predictit.map(m => <MarketCard key={m.id} m={m} />)}</div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-500/40 text-purple-300"><div><span className="font-bold text-white">Polymarket</span><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-500/20 ml-2">📊 Reference only</span><p className="text-xs text-slate-500 mt-0.5">US cannot trade · Sharp price oracle</p></div><span className="text-xs text-slate-400">{polymarket.length} markets</span></div>
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-3 mb-3 text-xs text-purple-300/80 flex items-start gap-2"><Info className="w-4 h-4 shrink-0 mt-0.5" /><span>Polymarket is blocked for US users but their API is public. We use their prices as a &quot;sharp market&quot; reference to find where Kalshi or PredictIt are mispriced.</span></div>
          <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">{polymarket.map(m => <MarketCard key={m.id} m={m} />)}</div>
        </div>
      </div>
    </div>
  )
}