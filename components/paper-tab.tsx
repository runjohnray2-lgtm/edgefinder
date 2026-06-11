"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, ClipboardList } from "lucide-react"
import type { PaperTrade } from "@/types"
import { cn } from "@/lib/utils"

interface PaperTabProps { trades: PaperTrade[]; onAddTrades: (t: PaperTrade[]) => void; onSetOutcome: (id: string, o: "WIN"|"LOSS") => void; onDelete: (id: string) => void; prefillTrades?: PaperTrade[]; onPrefillConsumed?: () => void }

export function PaperTab({ trades, onAddTrades, onSetOutcome, onDelete, prefillTrades, onPrefillConsumed }: PaperTabProps) {
  const [open, setOpen] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const [form, setForm] = useState({ platform: "Kalshi", market: "", position: "YES" as "YES"|"NO", contracts: "10", entryPrice: "50", notes: "" })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (prefillTrades && prefillTrades.length > 0) {
      setJustAdded(prefillTrades.map(t => t.id).join(","))
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setJustAdded(null), 4000)
      onPrefillConsumed?.()
    }
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [prefillTrades, onPrefillConsumed])

  const totalPnL = trades.filter(t => t.outcome !== "PENDING").reduce((s, t) => s + t.pnl, 0)
  const winCount = trades.filter(t => t.outcome === "WIN").length
  const lossCount = trades.filter(t => t.outcome === "LOSS").length
  const winRate = winCount + lossCount > 0 ? ((winCount / (winCount + lossCount)) * 100).toFixed(0) : "—"

  function addTrade() {
    const contracts = parseInt(form.contracts) || 1
    const entryPrice = parseInt(form.entryPrice) || 50
    const trade: PaperTrade = { id: Date.now().toString(), createdAt: new Date().toISOString(), platform: form.platform, market: form.market, position: form.position, contracts, entryPrice, totalInvested: (contracts * entryPrice) / 100, outcome: "PENDING", pnl: 0, notes: form.notes }
    onAddTrades([trade]); setOpen(false); setForm({ platform: "Kalshi", market: "", position: "YES", contracts: "10", entryPrice: "50", notes: "" })
  }

  return (
    <div className="space-y-4">
      {justAdded && <Alert className="border-emerald-500/40 bg-emerald-500/10 animate-in fade-in duration-300"><ClipboardList className="h-4 w-4 text-emerald-400" /><AlertDescription className="text-emerald-300 text-sm">✅ <strong>Both arb legs logged!</strong> Mark them WIN or LOSS after the event resolves.</AlertDescription></Alert>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center"><div className={cn("text-2xl font-bold", totalPnL >= 0 ? "text-emerald-400" : "text-red-400")}>{totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}</div><div className="text-xs text-slate-400 mt-0.5">Paper P&L</div></div>
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center"><div className="text-2xl font-bold text-slate-200">{winRate}%</div><div className="text-xs text-slate-400 mt-0.5">Win Rate</div></div>
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center"><div className="text-2xl font-bold text-emerald-400">{winCount}</div><div className="text-xs text-slate-400 mt-0.5">Wins</div></div>
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center"><div className="text-2xl font-bold text-red-400">{lossCount}</div><div className="text-xs text-slate-400 mt-0.5">Losses</div></div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{trades.length === 0 ? "Log practice bets here or click 'Log This Arb' in the Arb Scanner tab" : `${trades.length} trades logged · ${trades.filter(t => t.outcome === "PENDING").length} pending`}</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1"><Plus className="h-4 w-4" />Log Trade</Button></DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-slate-200">
            <DialogHeader><DialogTitle className="text-slate-100">Log Paper Trade</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-slate-400 text-xs">Platform</Label><Select value={form.platform} onValueChange={v => setForm(f => ({...f, platform: v}))}><SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 mt-1"><SelectValue /></SelectTrigger><SelectContent className="bg-slate-800 border-slate-700"><SelectItem value="Kalshi">Kalshi</SelectItem><SelectItem value="PredictIt">PredictIt</SelectItem><SelectItem value="Robinhood">Robinhood</SelectItem></SelectContent></Select></div>
                <div><Label className="text-slate-400 text-xs">Position</Label><Select value={form.position} onValueChange={v => setForm(f => ({...f, position: v as "YES"|"NO"}))}><SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 mt-1"><SelectValue /></SelectTrigger><SelectContent className="bg-slate-800 border-slate-700"><SelectItem value="YES">YES</SelectItem><SelectItem value="NO">NO</SelectItem></SelectContent></Select></div>
              </div>
              <div><Label className="text-slate-400 text-xs">Market / Event</Label><Input className="bg-slate-800 border-slate-700 text-slate-200 mt-1" placeholder="e.g. NBA Finals Game 4: NY to win?" value={form.market} onChange={e => setForm(f => ({...f, market: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-slate-400 text-xs">Contracts (#)</Label><Input type="number" className="bg-slate-800 border-slate-700 text-slate-200 mt-1" value={form.contracts} onChange={e => setForm(f => ({...f, contracts: e.target.value}))} /></div>
                <div><Label className="text-slate-400 text-xs">Entry Price (¢)</Label><Input type="number" min="1" max="99" className="bg-slate-800 border-slate-700 text-slate-200 mt-1" value={form.entryPrice} onChange={e => setForm(f => ({...f, entryPrice: e.target.value}))} /></div>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-2 text-xs text-slate-400 border border-slate-700/50">Total invested: <span className="text-slate-200 font-semibold">${((parseInt(form.contracts)||0)*(parseInt(form.entryPrice)||0)/100).toFixed(2)}</span> · Win payout: <span className="text-emerald-400 font-semibold">${(parseInt(form.contracts)||0).toFixed(2)}</span></div>
              <div><Label className="text-slate-400 text-xs">Notes (optional)</Label><Input className="bg-slate-800 border-slate-700 text-slate-200 mt-1" placeholder="e.g. Arb with Polymarket" value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} /></div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" onClick={addTrade} disabled={!form.market}>Add Trade</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {trades.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border border-slate-700/50 rounded-xl"><ClipboardList className="h-8 w-8 mx-auto mb-3 opacity-30" /><p className="font-medium">No trades logged yet</p><p className="text-xs mt-1">Click <strong className="text-slate-400">Log This Arb</strong> in the Arb Scanner tab, or use the button above</p></div>
      ) : (
        <div className="rounded-xl border border-slate-700/50 overflow-hidden">
          <Table>
            <TableHeader><TableRow className="border-slate-700/50 hover:bg-transparent"><TableHead className="text-slate-400 text-xs">Market</TableHead><TableHead className="text-slate-400 text-xs">Side</TableHead><TableHead className="text-slate-400 text-xs">Price</TableHead><TableHead className="text-slate-400 text-xs">Invested</TableHead><TableHead className="text-slate-400 text-xs">P&L</TableHead><TableHead className="text-slate-400 text-xs">Status</TableHead><TableHead className="text-slate-400 text-xs w-28">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {trades.map(trade => {
                const isNew = justAdded?.includes(trade.id)
                return (
                  <TableRow key={trade.id} className={cn("border-slate-700/30 hover:bg-slate-800/30 transition-colors", isNew && "bg-emerald-500/10 border-l-2 border-l-emerald-500")}>
                    <TableCell className="text-slate-300 text-xs max-w-[180px]"><div className="truncate">{trade.market}</div><div className="text-slate-500 text-xs">{trade.platform}</div>{trade.notes && <div className="text-slate-500 text-xs truncate italic">{trade.notes}</div>}</TableCell>
                    <TableCell><Badge className={cn("text-xs", trade.position === "YES" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20" : "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/20")}>{trade.position}</Badge></TableCell>
                    <TableCell className="text-slate-300 text-xs">{trade.entryPrice}¢ × {trade.contracts}</TableCell>
                    <TableCell className="text-slate-300 text-xs">${trade.totalInvested.toFixed(2)}</TableCell>
                    <TableCell className={cn("text-xs font-bold", trade.outcome === "WIN" ? "text-emerald-400" : trade.outcome === "LOSS" ? "text-red-400" : "text-slate-400")}>{trade.outcome === "PENDING" ? "—" : `${trade.pnl >= 0 ? "+" : ""}$${trade.pnl.toFixed(2)}`}</TableCell>
                    <TableCell>{trade.outcome === "PENDING" ? <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs hover:bg-amber-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge> : trade.outcome === "WIN" ? <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs hover:bg-emerald-500/20"><CheckCircle className="h-3 w-3 mr-1" />Win</Badge> : <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs hover:bg-red-500/20"><XCircle className="h-3 w-3 mr-1" />Loss</Badge>}</TableCell>
                    <TableCell><div className="flex items-center gap-1">{trade.outcome === "PENDING" && <><Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" onClick={() => onSetOutcome(trade.id, "WIN")} title="Mark WIN"><TrendingUp className="h-3 w-3" /></Button><Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => onSetOutcome(trade.id, "LOSS")} title="Mark LOSS"><TrendingDown className="h-3 w-3" /></Button></>}<Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => onDelete(trade.id)} title="Delete"><Trash className="h-3 w-3" /></Button></div></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}