import type { NormalizedMarket } from '@/types'

export const demoKalshiMarkets: NormalizedMarket[] = [
  { id: 'k-nba-champ', platform: 'Kalshi', title: 'New York to win 2026 NBA Championship?', yesPrice: 62, noPrice: 38, volume: 892000, closeTime: new Date(Date.now() + 15 * 86400000).toISOString(), externalId: 'NBAPLAY-NYCHAMP-26', matchKey: 'nba-2026-champ' },
  { id: 'k-ufc', platform: 'Kalshi', title: 'UFC 320: Jones to win main event?', yesPrice: 71, noPrice: 29, volume: 87000, closeTime: new Date(Date.now() + 20 * 86400000).toISOString(), externalId: 'UFC320-JONES', matchKey: 'ufc320-jones' },
  { id: 'k-mlb-nyy', platform: 'Kalshi', title: 'MLB: Yankees win tonight?', yesPrice: 58, noPrice: 42, volume: 45200, closeTime: new Date(Date.now() + 6 * 3600000).toISOString(), externalId: 'MLB-NYY-TODAY', matchKey: 'mlb-nyy-tonight' },
  { id: 'k-senate-repub', platform: 'Kalshi', title: 'Republicans win Senate majority in 2026 midterms?', yesPrice: 55, noPrice: 45, volume: 1240000, closeTime: new Date(Date.now() + 150 * 86400000).toISOString(), externalId: 'MIDTERM26-SEN-REP', matchKey: 'midterm26-senate-repub' },
  { id: 'k-house-dem', platform: 'Kalshi', title: 'Democrats win House majority in 2026 midterms?', yesPrice: 48, noPrice: 52, volume: 980000, closeTime: new Date(Date.now() + 150 * 86400000).toISOString(), externalId: 'MIDTERM26-HOUSE-DEM', matchKey: 'midterm26-house-dem' },
  { id: 'k-trump-approve', platform: 'Kalshi', title: 'Trump approval rating above 50% in 2026?', yesPrice: 31, noPrice: 69, volume: 560000, closeTime: new Date(Date.now() + 90 * 86400000).toISOString(), externalId: 'TRUMP-APPROVE-50', matchKey: 'trump-approval-50' },
  { id: 'k-fed-rate-cut', platform: 'Kalshi', title: 'Fed cuts rates at next FOMC meeting?', yesPrice: 38, noPrice: 62, volume: 720000, closeTime: new Date(Date.now() + 45 * 86400000).toISOString(), externalId: 'FED-RATE-CUT-FOMC', matchKey: 'fed-rate-cut-next' },
  { id: 'k-btc-80k', platform: 'Kalshi', title: 'Bitcoin above $80,000 by end of 2026?', yesPrice: 42, noPrice: 58, volume: 890000, closeTime: new Date(Date.now() + 200 * 86400000).toISOString(), externalId: 'BTC-80K-EOY26', matchKey: 'btc-80k-2026' },
  { id: 'k-wc-spain', platform: 'Kalshi', title: '2026 FIFA World Cup: Spain to win?', yesPrice: 22, noPrice: 78, volume: 324000, closeTime: new Date(Date.now() + 32 * 86400000).toISOString(), externalId: 'FIFA26-SPAIN-WIN', matchKey: 'wc2026-spain' },
  { id: 'k-nfl-sb', platform: 'Kalshi', title: 'Super Bowl LXI: Chiefs to win?', yesPrice: 28, noPrice: 72, volume: 543000, closeTime: new Date(Date.now() + 240 * 86400000).toISOString(), externalId: 'NFLSB61-CHIEFS', matchKey: 'sb61-chiefs' },
]

export const demoPolymarkets: NormalizedMarket[] = [
  { id: 'p-nba-champ', platform: 'Polymarket', title: 'NY Knicks 2026 NBA Champions?', yesPrice: 68, noPrice: 32, volume: 1240000, closeTime: new Date(Date.now() + 15 * 86400000).toISOString(), externalId: 'poly-knicks-champs-26', matchKey: 'nba-2026-champ' },
  { id: 'p-fed-rate', platform: 'Polymarket', title: 'Fed rate cut at next FOMC?', yesPrice: 42, noPrice: 58, volume: 540000, closeTime: new Date(Date.now() + 45 * 86400000).toISOString(), externalId: 'poly-fed-cut', matchKey: 'fed-rate-cut-next' },
  { id: 'p-btc-80k', platform: 'Polymarket', title: 'Bitcoin above $80k by end of 2026?', yesPrice: 47, noPrice: 53, volume: 1100000, closeTime: new Date(Date.now() + 200 * 86400000).toISOString(), externalId: 'poly-btc-80k', matchKey: 'btc-80k-2026' },
  { id: 'p-ufc', platform: 'Polymarket', title: 'Jon Jones wins UFC 320?', yesPrice: 75, noPrice: 25, volume: 91000, closeTime: new Date(Date.now() + 20 * 86400000).toISOString(), externalId: 'poly-ufc320-jones', matchKey: 'ufc320-jones' },
  { id: 'p-wc-spain', platform: 'Polymarket', title: 'Spain 2026 World Cup Winner?', yesPrice: 19, noPrice: 81, volume: 456000, closeTime: new Date(Date.now() + 32 * 86400000).toISOString(), externalId: 'poly-wc26-spain', matchKey: 'wc2026-spain' },
  { id: 'p-nfl-sb', platform: 'Polymarket', title: 'Chiefs to win Super Bowl LXI?', yesPrice: 31, noPrice: 69, volume: 678000, closeTime: new Date(Date.now() + 240 * 86400000).toISOString(), externalId: 'poly-sb61-chiefs', matchKey: 'sb61-chiefs' },
]

export const demoPredictItMarkets: NormalizedMarket[] = [
  { id: 'pi-senate-repub', platform: 'PredictIt', title: 'Will Republicans control the Senate after 2026 midterms?', yesPrice: 60, noPrice: 42, volume: 890000, closeTime: new Date(Date.now() + 150 * 86400000).toISOString(), externalId: 'pi-7812', matchKey: 'midterm26-senate-repub', feeOnProfit: 0.05 },
  { id: 'pi-house-dem', platform: 'PredictIt', title: 'Will Democrats win a House majority in the 2026 midterms?', yesPrice: 44, noPrice: 58, volume: 720000, closeTime: new Date(Date.now() + 150 * 86400000).toISOString(), externalId: 'pi-7813', matchKey: 'midterm26-house-dem', feeOnProfit: 0.05 },
  { id: 'pi-trump-approve', platform: 'PredictIt', title: "Will Trump's approval rating exceed 50% by end of 2026?", yesPrice: 27, noPrice: 74, volume: 440000, closeTime: new Date(Date.now() + 90 * 86400000).toISOString(), externalId: 'pi-7650', matchKey: 'trump-approval-50', feeOnProfit: 0.05 },
  { id: 'pi-fed-rate', platform: 'PredictIt', title: 'Will the Federal Reserve cut rates at its next meeting?', yesPrice: 35, noPrice: 66, volume: 320000, closeTime: new Date(Date.now() + 45 * 86400000).toISOString(), externalId: 'pi-7740', matchKey: 'fed-rate-cut-next', feeOnProfit: 0.05 },
  { id: 'pi-schumer-leader', platform: 'PredictIt', title: 'Schumer remains Senate Democratic leader through 119th Congress?', yesPrice: 89, noPrice: 13, volume: 85000, closeTime: new Date(Date.now() + 60 * 86400000).toISOString(), externalId: 'pi-7654', feeOnProfit: 0.05 },
  { id: 'pi-johnson-speaker', platform: 'PredictIt', title: 'Johnson remains House Speaker through 119th Congress?', yesPrice: 87, noPrice: 15, volume: 94000, closeTime: new Date(Date.now() + 60 * 86400000).toISOString(), externalId: 'pi-7651', feeOnProfit: 0.05 },
]