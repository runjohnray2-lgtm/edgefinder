"use client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Activity, CheckCircle } from "lucide-react"
import type { PaperTrade } from "@/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface PerformanceTabProps { trades: PaperTrade[] }
interface ChartPoint { date: string; cumPnL: number }

export function PerformanceTab({ trades }: PerformanceTabProps) {
  const settled = trades.filter(t => t.outcome !== "PENDING")
  const wins = settled.filter(t => t.outcome === "WIN"); const losses = settled.filter(t => t.outcome === "LOSS")
  const totalPnL = settled.reduce((sum, t) => sum + t.pnl, 0)
  const totalInvested = settled.reduce((sum, t) => sum + t.totalInvested, 0)
  const roi = totalInvested > 0 ? ((totalPnL / totalInvested) * 100) : 0
  const winRate = settled.length > 0 ? ((wins.length / settled.length) * 100) : 0
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0
  const chartData: ChartPoint[] = []
  let running = 0
  const sortedSettled = [...settled].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  for (const t of sortedSettled) { running += t.pnl; chartData.push({ date: format(new Date(t.createdAt), "MM/dd"), cumPnL: parseFloat(running.toFixed(2)) }) }
  if (trades.length === 0) return (
    <div className="text-center py-16 text-slate-500"><Activity className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="font-medium text-slate-400">No performance data yet</p><p className="text-xs mt-1">Log paper trades in the Paper Trader tab to see your performance here</p></div>
  )
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center"><div className={cn("text-2xl font-bold", totalPnL >= 0 ? "text-emerald-400" : "text-red-400")}>{totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}</div><div className="text-xs text-slate-400 mt-1">Total P&L</div></div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center"><div className={cn("text-2xl font-bold", roi >= 0 ? "text-emerald-400" : "text-red-400")}>{roi >= 0 ? "+" : ""}{roi.toFixed(1)}%</div><div className="text-xs text-slate-400 mt-1">ROI</div></div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center"><div className="text-2xl font-bold text-violet-400">{winRate.toFixed(0)}%</div><div className="text-xs text-slate-400 mt-1">Win Rate ({wins.length}W / {losses.length}L)</div></div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center"><div className="text-2xl font-bold text-slate-200">{settled.length}</div><div className="text-xs text-slate-400 mt-1">Settled Trades</div></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-emerald-400" /><span className="text-emerald-400 font-semibold text-sm">Avg Win</span></div><div className="text-2xl font-bold text-emerald-400">+${avgWin.toFixed(2)}</div><div className="text-xs text-slate-400 mt-1">{wins.length} winning trades</div></div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><TrendingDown className="h-4 w-4 text-red-400" /><span className="text-red-400 font-semibold text-sm">Avg Loss</span></div><div className="text-2xl font-bold text-red-400">${avgLoss.toFixed(2)}</div><div className="text-xs text-slate-400 mt-1">{losses.length} losing trades</div></div>
      </div>
      {chartData.length > 1 && (
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4"><Activity className="h-4 w-4 text-violet-400" /><span className="text-slate-300 font-semibold text-sm">Cumulative P&L</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={totalPnL >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3} /><stop offset="95%" stopColor={totalPnL >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#e2e8f0" }} formatter={(v: number) => [`$${v.toFixed(2)}`, "Cum. P&L"]} />
              <Area type="monotone" dataKey="cumPnL" stroke={totalPnL >= 0 ? "#10b981" : "#ef4444"} fill="url(#pnlGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {trades.filter(t => t.outcome === "PENDING").length > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>You have <strong>{trades.filter(t => t.outcome === "PENDING").length}</strong> pending trade(s). Go to Paper Trader to mark them as wins or losses after events resolve.</span>
        </div>
      )}
    </div>
  )
}