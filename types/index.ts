export interface NormalizedMarket {
  id: string
  platform: 'Kalshi' | 'Polymarket' | 'PredictIt'
  title: string
  yesPrice: number
  noPrice: number
  volume: number
  closeTime: string
  externalId: string
  matchKey?: string
  feeOnProfit?: number
}

export interface ArbOpportunity {
  id: string
  title: string
  market1: NormalizedMarket
  market2: NormalizedMarket
  buyYesOn: string
  yesPrice: number
  buyNoOn: string
  noPrice: number
  totalCost: number
  profitCents: number
  profitPct: number
  worstCaseProfit?: number
  worstCaseProfitPct?: number
  hasFee?: boolean
}

export interface EVOpportunity {
  id: string
  market: NormalizedMarket
  impliedProb: number
  referenceProb: number
  edgeCents: number
  evPct: number
  recommendation: 'BUY YES' | 'BUY NO'
  referenceMarket?: NormalizedMarket
}

export interface PaperTrade {
  id: string
  createdAt: string
  platform: string
  market: string
  position: 'YES' | 'NO'
  contracts: number
  entryPrice: number
  totalInvested: number
  outcome: 'WIN' | 'LOSS' | 'PENDING'
  pnl: number
  notes: string
}

export interface MarketData {
  kalshi: NormalizedMarket[]
  polymarket: NormalizedMarket[]
  predictit: NormalizedMarket[]
  arbOpportunities: ArbOpportunity[]
  evOpportunities: EVOpportunity[]
  isLive: boolean
  hasKalshiAuth: boolean
  lastUpdated: string
  platformCounts: {
    kalshi: number
    polymarket: number
    predictit: number
  }
}
