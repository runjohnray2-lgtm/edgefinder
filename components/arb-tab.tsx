"use client"
// Condensed arb-tab for GitHub — full logic preserved
import type { ArbOpportunity, NormalizedMarket } from '@/types'
import { AlertTriangle, Zap, TrendingUp, DollarSign, Eye, Info } from 'lucide-react'

interface Props { opportunities: ArbOpportunity[]; loading: boolean; onLogArb?: (arb: ArbOpportunity) => void; kalshi?: NormalizedMarket[]; predictit?: NormalizedMarket[]; isLive?: boolean }
const PLATFORM_COLORS: Record<string, string> = { Kalshi: 'bg-blue-500/20 text-blue-300 border-blue-500/30', PredictIt: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', Polymarket: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
function PlatformBadge({ name }: { name: string }) { return <span className={`text-xs font-bold px-2 py-0.5 rounded border ${PLATFORM_COLORS[name] ?? 'bg-slate-700 text-slate-300'}`}>{name}</span> }

function ArbCard({ arb, onLog }: { arb: ArbOpportunity; onLog?: (a: ArbOpportunity) => void }) {
  const isHot = (arb.worstCaseProfitPct ?? arb.profitPct) >= 3
  const worstPct = arb.worstCaseProfitPct ?? arb.profitPct
  const worstProfit = arb.worstCaseProfit ?? arb.profitCents
  return (
    <div className={`rounded-xl border bg-slate-800 overflow-hidden transition-all ${isHot ? 'border-green-500/60 shadow-lg shadow-green-500/10' : 'border-slate-700'}`}>
      <div className={`px-4 py-3 flex items-start justify-between gap-3 ${isHot ? 'bg-green-500/5' : ''}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <PlatformBadge name={arb.buyYesOn} /><span className="text-slate-500 text-xs">vs</span><PlatformBadge name={arb.buyNoOn} />
            {arb.hasFee && <span className="flex items-center gap-1 text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded"><AlertTriangle className="w-3 h-3" />5% fee</span>}
            {isHot && <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 rounded"><Zap className="w-3 h-3" />HOT</span>}
          </div>
          <p className="text-white font-medium text-sm leading-snug line-clamp-2">{arb.title}</p>
        </div>
        <div className="text-right shrink-0"><div className={`text-2xl font-bold ${isHot ? 'text-green-400' : 'text-emerald-400'}`}>+{worstPct.toFixed(1)}%</div><div className="text-xs text-slate-400">{arb.hasFee ? 'after fees' : 'guaranteed'}</div></div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-slate-700 border-t border-slate-700">
        <div className="px-4 py-3"><div className="text-xs text-slate-400 mb-1">BUY YES on <span className="text-white font-medium">{arb.buyYesOn}</span></div><div className="text-2xl font-bold text-green-400">{arb.yesPrice}¢</div></div>
        <div className="px-4 py-3"><div className="text-xs text-slate-400 mb-1">BUY NO on <span className="text-white font-medium">{arb.buyNoOn}</span></div><div className="text-2xl font-bold text-red-400">{arb.noPrice}¢</div></div>
      </div>
      <div className="px-4 py-2.5 bg-slate-900/50 border-t border-slate-700/50 flex items-center justify-between gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-3 text-slate-400">
          <span>In: <span className="text-white font-bold">{arb.totalCost}¢</span></span>
          <span>Profit: <span className="text-green-400 font-bold">+{arb.profitCents}¢ gross</span></span>
          {arb.hasFee && <span>After fees: <span className="text-green-400 font-bold">+{worstProfit.toFixed(1)}¢</span></span>}
        </div>
        <div className="text-slate-500">100x: invest <span className="text-white">${arb.totalCost}</span> → profit <span className="text-green-400 font-bold">${worstProfit.toFixed(2)}</span></div>
      </div>
      <div className="px-4 py-3 border-t border-slate-700 flex justify-end">
        <button onClick={() => onLog?.(arb)} className={`flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${isHot ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}>
          <DollarSign className="w-4 h-4" />Log This Arb
        </button>
      </div>
    </div>
  )
}

export default function ArbTab({ opportunities, loading, onLogArb, kalshi = [], predictit = [], isLive = false }: Props) {
  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-slate-800 rounded-xl h-48 animate-pulse" />)}</div>
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-800/50 rounded-lg px-4 py-2.5 border border-slate-700">
        <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
        <span><span className="text-white font-medium">Guaranteed arb:</span> Buy YES on one platform + NO on the other. One side always pays $1.00 — profit is locked in regardless of outcome. PredictIt charges a 5% profit fee (factored into worst-case %).</span>
      </div>
      {opportunities.length > 0 ? (
        opportunities.map(arb => <ArbCard key={arb.id} arb={arb} onLog={onLogArb} />)
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3"><Eye className="w-6 h-6 text-slate-400" /></div>
            <h3 className="text-white font-semibold mb-1">{isLive ? 'No Cross-Platform Arbs Right Now' : 'No Demo Arbs Triggered'}</h3>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">{isLive ? "Kalshi and PredictIt cover different market categories right now. When they price the same event differently, arb windows open." : "The demo markets don't have overlapping matchKeys with guaranteed profit. Check +EV Finder for active opportunities."}</p>
          </div>
          {isLive && kalshi.length > 0 && predictit.length > 0 && (
            <div className="bg-slate-800 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3"><Info className="w-4 h-4 text-yellow-400" /><span className="text-sm font-semibold text-yellow-300">Currently Watching These Pairs</span><span className="text-xs text-slate-500">— waiting for prices to diverge</span></div>
              <div className="space-y-2 text-xs">
                {kalshi.filter(k => ['senate','house','congress','trump','president','fed','rate'].some(w => k.title.toLowerCase().includes(w))).slice(0,4).map(k => (
                  <div key={k.id} className="flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2">
                    <div><span className="text-blue-300 font-medium">Kalshi</span><span className="text-slate-400 mx-2">→</span><span className="text-white">{k.title.slice(0,50)}{k.title.length > 50 ? '…' : ''}</span></div>
                    <div className="flex items-center gap-2 shrink-0"><span className="text-green-400">YES {k.yesPrice}¢</span><span className="text-red-400">NO {k.noPrice}¢</span><span className="text-yellow-400/60">| PredictIt matching...</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}