import type { NormalizedMarket, ArbOpportunity, EVOpportunity, PaperTrade } from '@/types'

function effectivePayout(platform: string, entryPriceCents: number): number {
  if (platform === 'PredictIt') {
    const feeRate = 0.05
    const profitCents = 100 - entryPriceCents
    return 100 - profitCents * feeRate
  }
  return 100
}

export function findArb(m1: NormalizedMarket, m2: NormalizedMarket): ArbOpportunity | null {
  const candidates: ArbOpportunity[] = []
  const dirA = evalArb(m1, m2, 'A'); if (dirA) candidates.push(dirA)
  const dirB = evalArb(m2, m1, 'B'); if (dirB) candidates.push(dirB)
  if (candidates.length === 0) return null
  return candidates.sort((a, b) => b.worstCaseProfitPct! - a.worstCaseProfitPct!)[0]
}

function evalArb(yesMarket: NormalizedMarket, noMarket: NormalizedMarket, dir: string): ArbOpportunity | null {
  const yesCost = yesMarket.yesPrice; const noCost = noMarket.noPrice; const totalCost = yesCost + noCost
  const payoutIfYes = effectivePayout(yesMarket.platform, yesCost); const profitIfYes = payoutIfYes - totalCost
  const payoutIfNo = effectivePayout(noMarket.platform, noCost); const profitIfNo = payoutIfNo - totalCost
  const worstCaseProfit = Math.min(profitIfYes, profitIfNo)
  if (worstCaseProfit <= 0) return null
  const hasFee = yesMarket.platform === 'PredictIt' || noMarket.platform === 'PredictIt'
  return {
    id: `arb-${dir}-${yesMarket.id}-${noMarket.id}`, title: yesMarket.title || noMarket.title,
    market1: yesMarket, market2: noMarket, buyYesOn: yesMarket.platform, yesPrice: yesCost,
    buyNoOn: noMarket.platform, noPrice: noCost, totalCost, profitCents: 100 - totalCost,
    profitPct: ((100 - totalCost) / totalCost) * 100, worstCaseProfit: Math.round(worstCaseProfit * 10) / 10,
    worstCaseProfitPct: Math.round((worstCaseProfit / totalCost) * 1000) / 10, hasFee
  }
}

export function findEV(ours: NormalizedMarket, reference: NormalizedMarket): EVOpportunity[] {
  const EVS: EVOpportunity[] = []; const MIN_EDGE = 3
  const ourYes = ours.yesPrice; const refYes = reference.yesPrice; const edgeYes = refYes - ourYes
  if (edgeYes >= MIN_EDGE) EVS.push({ id: `ev-yes-${ours.id}`, market: ours, referenceMarket: reference, impliedProb: ourYes, referenceProb: refYes, edgeCents: edgeYes, evPct: (edgeYes / ourYes) * 100, recommendation: 'BUY YES' })
  const ourNo = ours.noPrice; const refNo = reference.noPrice; const edgeNo = refNo - ourNo
  if (edgeNo >= MIN_EDGE) EVS.push({ id: `ev-no-${ours.id}`, market: ours, referenceMarket: reference, impliedProb: ourNo, referenceProb: refNo, edgeCents: edgeNo, evPct: (edgeNo / ourNo) * 100, recommendation: 'BUY NO' })
  return EVS
}

export function calcPnL(trade: PaperTrade): number {
  if (trade.outcome === 'PENDING') return 0
  if (trade.outcome === 'WIN') { const gross = trade.contracts - trade.totalInvested; return trade.platform === 'PredictIt' ? gross - gross * 0.05 : gross }
  return -trade.totalInvested
}

export function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}

export function formatTimeLeft(closeTime: string): string {
  const diff = new Date(closeTime).getTime() - Date.now()
  if (diff < 0) return 'Closed'
  const h = Math.floor(diff / 3600000); const d = Math.floor(h / 24)
  if (d > 30) return `${Math.floor(d / 30)}mo`
  if (d > 0) return `${d}d`
  return `${h}h`
}