import { NextResponse } from 'next/server'
import { createSign, constants } from 'crypto'
import type { NormalizedMarket, MarketData } from '@/types'
import { demoKalshiMarkets, demoPolymarkets, demoPredictItMarkets } from '@/lib/demo-data'
import { findArb, findEV } from '@/lib/calculations'

function kalshiAuthHeaders(method: string, pathNoQuery: string): Record<string, string> | null {
  const keyId = process.env.KALSHI_API_KEY_ID
  const keyB64 = process.env.KALSHI_PRIVATE_KEY_B64
  if (!keyId || !keyB64) return null
  try {
    const privateKeyPem = Buffer.from(keyB64, 'base64').toString('utf8')
    const ts = Date.now().toString()
    const msg = ts + method.toUpperCase() + pathNoQuery
    const signer = createSign('RSA-SHA256')
    signer.update(msg)
    const sig = signer.sign({ key: privateKeyPem, padding: constants.RSA_PKCS1_PSS_PADDING, saltLength: constants.RSA_PSS_SALTLEN_DIGEST })
    return { 'KALSHI-ACCESS-KEY': keyId, 'KALSHI-ACCESS-SIGNATURE': sig.toString('base64'), 'KALSHI-ACCESS-TIMESTAMP': ts, 'Content-Type': 'application/json' }
  } catch { return null }
}

async function fetchKalshi(): Promise<NormalizedMarket[]> {
  try {
    const res = await fetch('https://api.elections.kalshi.com/trade-api/v2/events?limit=100&with_nested_markets=true', { headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json() as { events?: Record<string, unknown>[] }
    const markets: NormalizedMarket[] = []
    for (const event of (data.events ?? [])) {
      const ms = event.markets as Record<string, unknown>[] | undefined
      for (const m of (ms ?? [])) {
        if (m.status !== 'active') continue
        const yes = Math.round(Number(m.yes_ask_dollars ?? m.yes_bid_dollars ?? 0.5) * 100)
        markets.push({ id: String(m.ticker ?? ''), platform: 'Kalshi', title: String(event.title ?? m.title ?? ''), yesPrice: yes, noPrice: 100 - yes, volume: Number(m.volume ?? 0), closeTime: String(m.close_time ?? m.expiration_time ?? event.close_time ?? new Date().toISOString()), externalId: String(m.ticker ?? '') })
      }
    }
    return markets.slice(0, 60)
  } catch { return [] }
}

async function fetchKalshiAuth(): Promise<NormalizedMarket[]> {
  const headers = kalshiAuthHeaders('GET', '/trade-api/v2/events')
  if (!headers) return []
  try {
    const res = await fetch('https://api.elections.kalshi.com/trade-api/v2/events?limit=200&with_nested_markets=true', { headers, next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json() as { events?: Record<string, unknown>[] }
    const markets: NormalizedMarket[] = []
    for (const event of (data.events ?? [])) {
      const ms = event.markets as Record<string, unknown>[] | undefined
      for (const m of (ms ?? [])) {
        if (m.status !== 'active') continue
        const yes = Math.round(Number(m.yes_ask_dollars ?? m.yes_bid_dollars ?? 0.5) * 100)
        const subtitle = m.subtitle ? ` — ${String(m.subtitle)}` : ''
        markets.push({ id: String(m.ticker ?? ''), platform: 'Kalshi', title: String(event.title ?? '') + subtitle, yesPrice: yes, noPrice: 100 - yes, volume: Number(m.volume ?? m.liquidity_dollars ?? 0), closeTime: String(m.close_time ?? m.expiration_time ?? event.close_time ?? new Date().toISOString()), externalId: String(m.ticker ?? '') })
      }
    }
    return markets.slice(0, 200)
  } catch { return [] }
}

async function fetchPolymarket(): Promise<NormalizedMarket[]> {
  try {
    const responses = await Promise.all([0, 100, 200, 300].map(offset =>
      fetch(`https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=100&offset=${offset}`, { next: { revalidate: 60 } })
    ))
    const pages = await Promise.all(responses.map(r => r.ok ? r.json() as Promise<Record<string, unknown>[]> : Promise.resolve([])))
    const data = (pages as Record<string, unknown>[][]).flat()
    if (data.length === 0) return []
    return data.map((m) => {
      let yesPrice = 50
      try { const prices = JSON.parse(String(m.outcomePrices ?? '[]')) as string[]; yesPrice = Math.round(parseFloat(prices[0] ?? '0.5') * 100) } catch { }
      return { id: String(m.id ?? ''), platform: 'Polymarket' as const, title: String(m.question ?? ''), yesPrice, noPrice: 100 - yesPrice, volume: parseFloat(String(m.volume ?? '0')), closeTime: String(m.endDateIso ?? m.endDate ?? new Date().toISOString()), externalId: String(m.id ?? '') }
    }).filter(m => m.id && m.title)
  } catch { return [] }
}

async function fetchPredictIt(): Promise<NormalizedMarket[]> {
  try {
    const res = await fetch('https://www.predictit.org/api/marketdata/all/', { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json() as { markets?: Record<string, unknown>[] }
    if (!data.markets) return []
    const markets: NormalizedMarket[] = []
    for (const m of data.markets) {
      const contracts = m.contracts as Record<string, unknown>[] | undefined
      if (!contracts || contracts.length !== 1) continue
      const c = contracts[0]
      if (c.status !== 'Open') continue
      const yesCost = Math.round(Number(c.bestBuyYesCost ?? 0.5) * 100)
      const noCost = Math.round(Number(c.bestBuyNoCost ?? 0.5) * 100)
      if (yesCost <= 0 || noCost <= 0) continue
      markets.push({ id: `pi-${m.id}`, platform: 'PredictIt', title: String(m.name ?? m.shortName ?? ''), yesPrice: yesCost, noPrice: noCost, volume: 0, closeTime: String(c.dateEnd && c.dateEnd !== 'NA' ? c.dateEnd : new Date(Date.now() + 90 * 86400000).toISOString()), externalId: `pi-${m.id}-${c.id}`, feeOnProfit: 0.05 })
    }
    return markets.slice(0, 80)
  } catch { return [] }
}

const STOP_WORDS = new Set(['will','the','a','an','to','of','in','at','for','is','are','does','do','has','have','be','been','by','on','or','and','not','that','this','with','from','its','any','all','after','before','over','under','than','into','out','up','down','as','would','could','should','may','can','what','when','where','who','which','how','why','there','their','they','was','were','had','get','got','make','take','give','come','go','let','both','each','more','most','also','only','just','even','still','yet','already','ever','never','always','often','about','above','against','through','during','within','without','including','following','2024','2025','2026','2027','2028','2029','2030','2031','2032','2033','2040','2045','2050','2060','2100','announce','remain','leave','office','sentence','commute','pardon','pass','vote','sign','stay','become','elect','lose','hold','start','launch','complete','finish','reach','achieve','june','july','august','sept','october','november','december','january','february','march','april','labor','super','next','season','before','through','end'])

function normalizeTitle(t: string): string { return t.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim() }
function significantWords(title: string): string[] { return normalizeTitle(title).split(' ').filter(w => w.length > 3 && !STOP_WORDS.has(w)) }
function titleOverlap(a: string, b: string): number { const aW = significantWords(a); const bW = new Set(significantWords(b)); return aW.filter(w => bW.has(w)).length }

function matchMarkets(kalshiList: NormalizedMarket[], polyList: NormalizedMarket[], predictItList: NormalizedMarket[]) {
  const arbs: NonNullable<ReturnType<typeof findArb>>[] = []
  const evs: ReturnType<typeof findEV>[0][] = []
  const seenArbKeys = new Set<string>()
  const seenEVKeys = new Set<string>()
  const tradeablePlatforms = [...kalshiList, ...predictItList]

  for (const km of kalshiList) {
    for (const pm of predictItList) {
      let matched = false
      if (km.matchKey && pm.matchKey && km.matchKey === pm.matchKey) { matched = true } else { const overlap = titleOverlap(km.title, pm.title); if (overlap >= 4) matched = true }
      if (!matched) continue
      const arb = findArb(km, pm)
      if (arb) { const dedupKey = [km.id, pm.id].sort().join('|'); if (!seenArbKeys.has(dedupKey)) { seenArbKeys.add(dedupKey); arbs.push(arb) } }
    }
  }

  for (const tradeable of tradeablePlatforms) {
    if (tradeable.platform === 'Polymarket') continue
    if (seenEVKeys.has(tradeable.id)) continue
    for (const ref of polyList) {
      let matched = false
      if (tradeable.matchKey && ref.matchKey && tradeable.matchKey === ref.matchKey) { matched = true } else { const overlap = titleOverlap(tradeable.title, ref.title); if (overlap >= 3) matched = true }
      if (!matched) continue
      const ev = findEV(tradeable, ref)
      if (ev.length > 0) { seenEVKeys.add(tradeable.id); evs.push(...ev) }
      break
    }
  }

  arbs.sort((a, b) => (b.worstCaseProfitPct ?? 0) - (a.worstCaseProfitPct ?? 0))
  evs.sort((a, b) => Math.abs(b.evPct) - Math.abs(a.evPct))
  return { arbs, evs }
}

export async function GET() {
  const hasKalshiAuth = !!(process.env.KALSHI_API_KEY_ID && process.env.KALSHI_PRIVATE_KEY_B64)
  const [kalshiPublic, kalshiAuth, polyRaw, predictItRaw] = await Promise.all([fetchKalshi(), fetchKalshiAuth(), fetchPolymarket(), fetchPredictIt()])
  const kalshiMergeMap = new Map<string, NormalizedMarket>()
  for (const m of [...kalshiPublic, ...kalshiAuth]) { if (!kalshiMergeMap.has(m.id)) kalshiMergeMap.set(m.id, m) }
  const kalshiRaw = Array.from(kalshiMergeMap.values())
  const hasLive = kalshiRaw.length > 0 || polyRaw.length > 0 || predictItRaw.length > 0
  const kalshi = kalshiRaw.length > 0 ? kalshiRaw : demoKalshiMarkets
  const polymarket = polyRaw.length > 0 ? polyRaw : demoPolymarkets
  const predictit = predictItRaw.length > 0 ? predictItRaw : demoPredictItMarkets
  const { arbs, evs } = matchMarkets(kalshi, polymarket, predictit)
  const data: MarketData = { kalshi, polymarket, predictit, arbOpportunities: arbs, evOpportunities: evs, isLive: hasLive, hasKalshiAuth, lastUpdated: new Date().toISOString(), platformCounts: { kalshi: kalshi.length, polymarket: polymarket.length, predictit: predictit.length } }
  return NextResponse.json(data)
}