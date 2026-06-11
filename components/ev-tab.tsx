'use client'
import type { EVOpportunity } from '@/types'
import { TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react'

interface Props { opportunities: EVOpportunity[]; loading: boolean }
const PLATFORM_COLORS: Record<string, string> = { Kalshi: 'bg-blue-500/20 text-blue-300 border-blue-500/30', PredictIt: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', Polymarket: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }

function getMatchConfidence(ourTitle: string, refTitle: string): 'high' | 'medium' | 'low' {
  const a = ourTitle.toLowerCase(); const b = refTitle.toLowerCase()
  const stopWords = new Set(['will','the','a','an','to','of','in','at','for','is','are','does','do','has','have','be','been','by','on','or','and','not','that','this','with','from','before','after','any'])
  const aWords = a.replace(/[^a-z0-9 ]/g,'').split(' ').filter(w => w.length > 3 && !stopWords.has(w))
  const bWords = new Set(b.replace(/[^a-z0-9 ]/g,'').split(' ').filter(w => w.length > 3 && !stopWords.has(w)))
  const overlap = aWords.filter(w => bWords.has(w)).length
  if (overlap >= 5) return 'high'; if (overlap >= 3) return 'medium'; return 'low'
}

export default function EVTab({ opportunities, loading }: Props) {
  if (loading) return <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-800 rounded-xl animate-pulse" />)}</div>
  if (opportunities.length === 0) return (
    <div className="text-center py-16 text-slate-400">
      <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
      <p className="text-lg font-medium">No +EV spots detected</p>
      <p className="text-sm mt-1">Kalshi and PredictIt prices look sharp vs Polymarket reference.</p>
      <p className="text-xs mt-3 text-slate-500">Add a Kalshi API key in .env.local to unlock sports & finance markets.</p>
    </div>
  )
  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-400 bg-slate-800/50 rounded-lg px-4 py-2.5 border border-slate-700 flex items-start gap-2">
        <Target className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <span><span className="text-white font-medium">+EV = positive expected value.</span> Polymarket acts as the &quot;sharp&quot; reference price. When Kalshi or PredictIt prices diverge by ≥3¢, there&apos;s a mathematical edge. <span className="text-yellow-300">⚠️ Always verify the matched questions ask the same thing before trading.</span></span>
      </div>
      {opportunities.map(ev => {
        const isBuyYes = ev.recommendation === 'BUY YES'
        const color = isBuyYes ? 'text-green-400' : 'text-red-400'
        const bg = isBuyYes ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30'
        const Icon = isBuyYes ? TrendingUp : TrendingDown
        const isStrong = ev.evPct >= 10
        const matchConf = ev.referenceMarket ? getMatchConfidence(ev.market.title, ev.referenceMarket.title) : 'medium'
        const confColor = matchConf === 'high' ? 'text-green-400' : matchConf === 'medium' ? 'text-yellow-400' : 'text-red-400'
        const confLabel = matchConf === 'high' ? '✓ Strong match' : matchConf === 'medium' ? '~ Partial match' : '⚠ Weak match'
        return (
          <div key={ev.id} className={`rounded-xl border ${bg} bg-slate-800 overflow-hidden`}>
            <div className="px-4 py-3 flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${PLATFORM_COLORS[ev.market.platform] ?? 'bg-slate-700'}`}>{ev.market.platform}</span>
                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border ${bg}`}><Icon className="w-3 h-3" />{ev.recommendation}</span>
                  {isStrong && <span className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded font-medium">⚡ Strong Signal</span>}
                </div>
                <p className="text-white font-medium text-sm line-clamp-2">{ev.market.title}</p>
              </div>
              <div className="text-right shrink-0"><div className={`text-2xl font-bold ${color}`}>+{ev.evPct.toFixed(1)}%</div><div className="text-xs text-slate-400">EV edge</div></div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-700 border-t border-slate-700 text-center py-2.5">
              <div><div className="text-xs text-slate-500 mb-0.5">This price</div><div className={`font-bold ${color}`}>{ev.impliedProb}¢</div></div>
              <div><div className="text-xs text-slate-500 mb-0.5">Sharp (Poly)</div><div className="font-bold text-white">{ev.referenceProb}¢</div></div>
              <div><div className="text-xs text-slate-500 mb-0.5">Edge</div><div className={`font-bold ${color}`}>+{ev.edgeCents}¢</div></div>
            </div>
            {ev.referenceMarket && (
              <div className="px-4 py-2.5 border-t border-slate-700 bg-slate-900/50">
                <div className="flex items-start gap-1.5">
                  <span className={`text-xs font-medium shrink-0 mt-0.5 ${confColor}`}>{confLabel}</span>
                  <span className="text-xs text-slate-400">vs Poly: &quot;{ev.referenceMarket.title.slice(0, 75)}{ev.referenceMarket.title.length > 75 ? '…' : ''}&quot;</span>
                </div>
                {matchConf === 'low' && <div className="flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3 text-red-400 shrink-0" /><span className="text-xs text-red-400">Questions may not match — verify before trading</span></div>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}