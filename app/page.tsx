"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import MarketsTab from "@/components/markets-tab"
import ArbTab from "@/components/arb-tab"
import EVTab from "@/components/ev-tab"
import { PaperTab } from "@/components/paper-tab"
import { PerformanceTab } from "@/components/performance-tab"
import { RefreshCw, Activity, Zap, TrendingUp, Eye, Globe, AlertTriangle } from "lucide-react"
import type { MarketData, PaperTrade, ArbOpportunity } from "@/types"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

const STORAGE_KEY = "ray-prediction-market-trades"

function loadTrades(): PaperTrade[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") }
  catch { return [] }
}

function saveTrades(trades: PaperTrade[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades))
}

export default function Home() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState("arb")
  const [trades, setTrades] = useState<PaperTrade[]>([])
  const [prefillTrades, setPrefillTrades] = useState<PaperTrade[] | undefined>(undefined)

  useEffect(() => { setTrades(loadTrades()) }, [])

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch("/api/markets", { cache: "no-store" })
      const json: MarketData = await res.json()
      setData(json)
      setLastUpdated(new Date(json.lastUpdated))
    } catch { /* silent */ } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  function handleAddTrades(newTrades: PaperTrade[]) {
    const next = [...newTrades, ...trades]
    setTrades(next); saveTrades(next)
  }

  function handleSetOutcome(id: string, outcome: "WIN" | "LOSS") {
    const next = trades.map(t => {
      if (t.id !== id) return t
      const pnl = outcome === "WIN" ? t.contracts - t.totalInvested : -t.totalInvested
      return { ...t, outcome, pnl }
    })
    setTrades(next); saveTrades(next)
  }

  function handleDelete(id: string) {
    const next = trades.filter(t => t.id !== id)
    setTrades(next); saveTrades(next)
  }

  function handleLogArb(arb: ArbOpportunity) {
    const ts = Date.now()
    const contracts = 10
    const worstPct = arb.worstCaseProfitPct ?? arb.profitPct

    const yesLeg: PaperTrade = {
      id: `${ts}-yes`,
      createdAt: new Date().toISOString(),
      platform: arb.buyYesOn,
      market: arb.title,
      position: "YES",
      contracts,
      entryPrice: arb.yesPrice,
      totalInvested: (contracts * arb.yesPrice) / 100,
      outcome: "PENDING",
      pnl: 0,
      notes: `ARB LEG 1/2 · NO on ${arb.buyNoOn} @ ${arb.noPrice}¢ · Guaranteed +${worstPct.toFixed(1)}% after fees`
    }
    const noLeg: PaperTrade = {
      id: `${ts}-no`,
      createdAt: new Date().toISOString(),
      platform: arb.buyNoOn,
      market: arb.title,
      position: "NO",
      contracts,
      entryPrice: arb.noPrice,
      totalInvested: (contracts * arb.noPrice) / 100,
      outcome: "PENDING",
      pnl: 0,
      notes: `ARB LEG 2/2 · YES on ${arb.buyYesOn} @ ${arb.yesPrice}¢ · Guaranteed +${worstPct.toFixed(1)}% after fees`
    }

    setPrefillTrades([yesLeg, noLeg])
    handleAddTrades([yesLeg, noLeg])
    setActiveTab("paper")
  }

  const bestArb = data?.arbOpportunities[0]?.worstCaseProfitPct ?? data?.arbOpportunities[0]?.profitPct ?? 0
  const arbCount = data?.arbOpportunities.length ?? 0
  const evCount = data?.evOpportunities.length ?? 0
  const paperPnL = trades.filter(t => t.outcome !== "PENDING").reduce((s, t) => s + t.pnl, 0)
  const pendingCount = trades.filter(t => t.outcome === "PENDING").length
  const kalshiCount = data?.platformCounts?.kalshi ?? 0
  const predictitCount = data?.platformCounts?.predictit ?? 0

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-100 text-lg hidden sm:block">EdgeFinder</span>
              <span className="text-xs text-slate-500 hidden md:block">Kalshi × PredictIt × Polymarket</span>
            </div>
            {data && (
              <Badge className={cn(
                "text-xs gap-1",
                data.isLive
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
              )}>
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  data.isLive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                )} />
                {data.isLive ? "LIVE" : "DEMO"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-slate-500 hidden md:block">
                {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </span>
            )}
            <Button
              size="sm" variant="ghost"
              className="text-slate-400 hover:text-slate-200 gap-1 h-7 px-2"
              onClick={() => fetchData(true)} disabled={refreshing}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              <span className="text-xs hidden sm:block">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Demo Notice */}
        {data && !data.isLive && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-300 flex items-start gap-2">
            <Activity className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <strong>Demo Mode Active</strong> — Showing realistic demo data.
              Sign up on <strong>Kalshi</strong> and <strong>PredictIt</strong> to get real live data and real arb opportunities.
              The math and strategies shown are real — use this to practice!
            </div>
          </div>
        )}

        {/* Platform Overview Bar */}
        {data && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg py-2 px-3">
              <div className="text-blue-300 font-bold">{kalshiCount}</div>
              <div className="text-xs text-blue-400/70">Kalshi markets</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg py-2 px-3">
              <div className="text-yellow-300 font-bold">{predictitCount}</div>
              <div className="text-xs text-yellow-400/70">PredictIt markets</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg py-2 px-3">
              <div className="text-purple-300 font-bold">{data.polymarket.length}</div>
              <div className="text-xs text-purple-400/70">Polymarket (ref)</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Real Arbs</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400">{loading ? "—" : arbCount}</div>
            <div className="text-xs text-slate-600 mt-1">Kalshi ↔ PredictIt</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-slate-400">Best Arb</span>
            </div>
            <div className="text-3xl font-bold text-amber-400">
              {loading ? "—" : bestArb > 0 ? `+${bestArb.toFixed(1)}%` : "—"}
            </div>
            <div className="text-xs text-slate-600 mt-1">after all fees</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-violet-400" />
              <span className="text-xs text-slate-400">+EV Spots</span>
            </div>
            <div className="text-3xl font-bold text-violet-400">{loading ? "—" : evCount}</div>
            <div className="text-xs text-slate-600 mt-1">vs Poly reference</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-slate-400">Paper P&L</span>
            </div>
            <div className={cn("text-3xl font-bold", paperPnL >= 0 ? "text-blue-400" : "text-red-400")}>
              {paperPnL >= 0 ? "+" : ""}${paperPnL.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-900 border border-slate-800 h-10 p-1 w-full flex flex-wrap gap-0.5">
            <TabsTrigger value="arb" className="flex-1 text-xs gap-1 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400">
              <Zap className="h-3 w-3" />
              <span className="hidden sm:block">Arb Scanner</span>
              <span className="sm:hidden">Arb</span>
              {!loading && arbCount > 0 && (
                <Badge className="ml-0.5 bg-emerald-500/30 text-emerald-300 border-0 text-xs px-1 hover:bg-emerald-500/30">{arbCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ev" className="flex-1 text-xs gap-1 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400">
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:block">+EV Finder</span>
              <span className="sm:hidden">EV</span>
              {!loading && evCount > 0 && (
                <Badge className="ml-0.5 bg-violet-500/30 text-violet-300 border-0 text-xs px-1 hover:bg-violet-500/30">{evCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="markets" className="flex-1 text-xs gap-1 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400">
              <Globe className="h-3 w-3" />
              <span className="hidden sm:block">Live Markets</span>
              <span className="sm:hidden">Markets</span>
            </TabsTrigger>
            <TabsTrigger value="paper" className="flex-1 text-xs gap-1 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400">
              <Activity className="h-3 w-3" />
              <span className="hidden sm:block">Paper Trader</span>
              <span className="sm:hidden">Paper</span>
              {pendingCount > 0 && (
                <Badge className="ml-0.5 bg-amber-500/30 text-amber-300 border-0 text-xs px-1 hover:bg-amber-500/30">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="perf" className="flex-1 text-xs gap-1 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400">
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:block">Performance</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="robinhood" className="flex-1 text-xs gap-1 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400">
              <Eye className="h-3 w-3" />
              <span className="hidden sm:block">Watch List</span>
              <span className="sm:hidden">Watch</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="arb" className="mt-0">
            <ArbTab opportunities={data?.arbOpportunities ?? []} loading={loading} onLogArb={handleLogArb} />
          </TabsContent>

          <TabsContent value="ev" className="mt-0">
            <EVTab opportunities={data?.evOpportunities ?? []} loading={loading} />
          </TabsContent>

          <TabsContent value="markets" className="mt-0">
            <MarketsTab
              kalshi={data?.kalshi ?? []}
              polymarket={data?.polymarket ?? []}
              predictit={data?.predictit ?? []}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="paper" className="mt-0">
            <PaperTab
              trades={trades}
              onAddTrades={handleAddTrades}
              onSetOutcome={handleSetOutcome}
              onDelete={handleDelete}
              prefillTrades={prefillTrades}
              onPrefillConsumed={() => setPrefillTrades(undefined)}
            />
          </TabsContent>

          <TabsContent value="perf" className="mt-0">
            <PerformanceTab trades={trades} />
          </TabsContent>

          <TabsContent value="robinhood" className="mt-0">
            <div className="space-y-4">
              {/* Platform watch cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Robinhood */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-emerald-300 font-bold">Robinhood Prediction Markets</h3>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">WATCHING</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">
                    Runs on KalshiEX backend. 24M+ retail users = pricing inefficiencies.
                    When new markets launch, there&apos;s often a 1-6 hour arb window vs Kalshi.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-start gap-2"><span className="text-emerald-400">→</span><span>Open Robinhood → Prediction Markets tab → note YES prices</span></div>
                    <div className="flex items-start gap-2"><span className="text-emerald-400">→</span><span>Compare to Kalshi prices in the Arb Scanner above</span></div>
                    <div className="flex items-start gap-2"><span className="text-emerald-400">→</span><span>YES + NO across platforms &lt; 100¢ = guaranteed arb</span></div>
                    <div className="flex items-start gap-2"><span className="text-emerald-400">→</span><span>Log both legs in Paper Trader to track your edge</span></div>
                  </div>
                </div>

                {/* Gemini */}
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-cyan-300 font-bold">Gemini Predictions</h3>
                    <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">LAUNCHED DEC 2025</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">
                    CFTC-licensed (Gemini Titan LLC). All 50 states, no fees during launch period.
                    Very new = mispriced markets vs Kalshi and PredictIt.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-start gap-2"><span className="text-cyan-400">→</span><span>Available at gemini.com/predictions</span></div>
                    <div className="flex items-start gap-2"><span className="text-cyan-400">→</span><span>Currently no trading fees (promotional period)</span></div>
                    <div className="flex items-start gap-2"><span className="text-cyan-400">→</span><span>API integration coming once they open public endpoints</span></div>
                    <div className="flex items-start gap-2"><span className="text-cyan-400">→</span><span>Manual arb vs Kalshi possible right now with their app</span></div>
                  </div>
                </div>

                {/* ForecastEx */}
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-orange-400" />
                    <h3 className="text-orange-300 font-bold">ForecastEx (via IBKR)</h3>
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">CFTC REGULATED</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">
                    IBKR-backed exchange. Focuses on economic, political, climate events.
                    Access via Interactive Brokers account. Earns 3.14% APY on collateral.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-start gap-2"><span className="text-orange-400">→</span><span>Accessible at interactivebrokers.com/predictionmarkets</span></div>
                    <div className="flex items-start gap-2"><span className="text-orange-400">→</span><span>Economic events like Fed rate decisions, CPI, GDP</span></div>
                    <div className="flex items-start gap-2"><span className="text-orange-400">→</span><span>These overlap with Kalshi econ markets — arb potential!</span></div>
                  </div>
                </div>

                {/* Crypto.com OG */}
                <div className="rounded-xl border border-slate-600/50 bg-slate-800/50 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-slate-300 font-bold">Crypto.com OG</h3>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">LEGAL BATTLE</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">
                    CFTC-regulated, but Nevada judge ruled their contracts may not qualify as swaps.
                    Currently appealing. Available in most states but Oregon may be affected.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-start gap-2"><span className="text-yellow-400">⚠️</span><span>Monitor regulatory outcome before trading real money</span></div>
                    <div className="flex items-start gap-2"><span className="text-yellow-400">⚠️</span><span>App is live but legal status in Oregon is unclear</span></div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-300">
                <strong>🔭 The Big Picture:</strong> The prediction market space is exploding — Kalshi + PredictIt are live and arb-able right now.
                Gemini (all 50 states, no fees) is brand new and almost certainly mispriced vs Kalshi.
                When their API goes public, this tool adds it automatically. <strong>First-mover advantage is real here.</strong>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
