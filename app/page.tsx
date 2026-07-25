"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type Asset = {
  id: string;
  ticker: string;
  name: string;
  type: string;
  currency: string;
  priceSource: string;
  priceSymbol: string;
  autoUpdate: boolean;
  fxRate: number;
  quantity: number;
  avgCost: number;
  costMode?: string;
  price: number;
  target: number;
  note: string;
  lastPriceAt?: string;
  lastPriceError?: string;
  previousPrice?: number;
  previousPriceAt?: string;
  dayOpenPrice?: number;
  dayOpenDate?: string;
  logoUrl?: string;
  createdAt?: string;
};

type WatchItem = {
  id: string;
  ticker: string;
  name: string;
  type: string;
  currency: string;
  priceSource: string;
  priceSymbol: string;
  targetPrice: number;
  targetWeight: number;
  note: string;
  price: number;
  lastPriceAt?: string;
  lastPriceError?: string;
  logoUrl?: string;
  createdAt?: string;
};

type Transaction = {
  id: string;
  assetId: string;
  assetTicker?: string;
  assetName?: string;
  assetSymbol?: string;
  date: string;
  type: string;
  quantity: number;
  price: number;
  amount?: number;
  fee?: number;
  costBasis?: number;
  realizedProfit?: number;
  resultingQuantity?: number;
  resultingAvgCost?: number;
  note: string;
};

type PortfolioSnapshot = {
  id: string;
  date: string;
  totalValue: number;
  totalCost: number;
  cash: number;
  profitLoss: number;
  assetCount: number;
};

type CashFlow = {
  id: string;
  date: string;
  type: "deposit" | "withdrawal";
  amount: number;
  note: string;
};

type BenchmarkPoint = {
  id: string;
  code: string;
  date: string;
  price: number;
  source: string;
  symbol: string;
};

type FundHolding = {
  id: string;
  fundCode: string;
  symbol: string;
  name: string;
  weight: number;
  sector: string;
  country: string;
  source?: string;
  asOf?: string;
};

type PortfolioSettings = {
  autoRefresh: boolean;
  targetAllocations: Record<string, number>;
  rebalanceAmount: number;
  dismissedAlertIds: string[];
  fundHoldings: Record<string, FundHolding[]>;
};

type PortfolioState = {
  assets: Asset[];
  watchlist: WatchItem[];
  transactions: Transaction[];
  history: PortfolioSnapshot[];
  cashFlows: CashFlow[];
  benchmarkHistory: BenchmarkPoint[];
  settings: PortfolioSettings;
};

const defaultTargetAllocations: Record<string, number> = {
  precious: 25,
  fund: 35,
  Hisse: 25,
  Kripto: 10,
  Doviz: 0,
  Nakit: 5,
  Diger: 0,
};

const defaultFundHoldings: Record<string, FundHolding[]> = {
  TMG: [
    { id: "TMG-AAPL", fundCode: "TMG", symbol: "AAPL", name: "Apple", weight: 8.88, sector: "Teknoloji", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-NVDA", fundCode: "TMG", symbol: "NVDA", name: "Nvidia", weight: 7.97, sector: "Yari iletken", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-AMZN", fundCode: "TMG", symbol: "AMZN", name: "Amazon", weight: 5.48, sector: "Tuketim", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-GOOGL", fundCode: "TMG", symbol: "GOOGL", name: "Alphabet Class A", weight: 4.94, sector: "Iletisim", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-MSFT", fundCode: "TMG", symbol: "MSFT", name: "Microsoft", weight: 4.28, sector: "Teknoloji", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-AVGO", fundCode: "TMG", symbol: "AVGO", name: "Broadcom", weight: 4.1, sector: "Yari iletken", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-GOOG", fundCode: "TMG", symbol: "GOOG", name: "Alphabet Class C", weight: 3.94, sector: "Iletisim", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-JPM", fundCode: "TMG", symbol: "JPM", name: "JPMorgan Chase", weight: 2.73, sector: "Banka", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-SMSN", fundCode: "TMG", symbol: "SMSN", name: "Samsung Electronics", weight: 2.67, sector: "Teknoloji", country: "Guney Kore", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-LLY", fundCode: "TMG", symbol: "LLY", name: "Eli Lilly", weight: 2.2, sector: "Saglik", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-ASML", fundCode: "TMG", symbol: "ASML", name: "ASML Holding", weight: 1.96, sector: "Yari iletken", country: "Hollanda", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-MA", fundCode: "TMG", symbol: "MA", name: "Mastercard", weight: 1.95, sector: "Finans", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-INTC", fundCode: "TMG", symbol: "INTC", name: "Intel", weight: 1.51, sector: "Yari iletken", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-NVDL", fundCode: "TMG", symbol: "NVDL", name: "GraniteShares 2x Long NVDA ETF", weight: 1.49, sector: "ETF", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-TREASURY", fundCode: "TMG", symbol: "TREASURY", name: "ABD Hazine Bonosu", weight: 1.42, sector: "Tahvil", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-JNJ", fundCode: "TMG", symbol: "JNJ", name: "Johnson & Johnson", weight: 1.4, sector: "Saglik", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-XOM", fundCode: "TMG", symbol: "XOM", name: "Exxon Mobil", weight: 1.31, sector: "Enerji", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-WMT", fundCode: "TMG", symbol: "WMT", name: "Walmart", weight: 1.25, sector: "Perakende", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-GS", fundCode: "TMG", symbol: "GS", name: "Goldman Sachs", weight: 1.24, sector: "Finans", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-CAT", fundCode: "TMG", symbol: "CAT", name: "Caterpillar", weight: 1.2, sector: "Sanayi", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-C", fundCode: "TMG", symbol: "C", name: "Citigroup", weight: 1.2, sector: "Banka", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-V", fundCode: "TMG", symbol: "V", name: "Visa", weight: 1.02, sector: "Finans", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-GE", fundCode: "TMG", symbol: "GE", name: "General Electric", weight: 1.01, sector: "Sanayi", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-MSFU", fundCode: "TMG", symbol: "MSFU", name: "Direxion Daily MSFT Bull 2x", weight: 1, sector: "ETF", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-NESN", fundCode: "TMG", symbol: "NESN", name: "Nestle", weight: 0.94, sector: "Tuketim", country: "Isvicre", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-SIE", fundCode: "TMG", symbol: "SIE", name: "Siemens Energy", weight: 0.9, sector: "Sanayi", country: "Almanya", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-PG", fundCode: "TMG", symbol: "PG", name: "Procter & Gamble", weight: 0.85, sector: "Tuketim", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-MRK", fundCode: "TMG", symbol: "MRK", name: "Merck", weight: 0.84, sector: "Saglik", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-MUFG", fundCode: "TMG", symbol: "MUFG", name: "Mitsubishi UFJ Financial", weight: 0.84, sector: "Banka", country: "Japonya", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-SAN", fundCode: "TMG", symbol: "SAN", name: "Banco Santander", weight: 0.83, sector: "Banka", country: "Ispanya", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-NOVN", fundCode: "TMG", symbol: "NOVN", name: "Novartis", weight: 0.72, sector: "Saglik", country: "Isvicre", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-6525", fundCode: "TMG", symbol: "6525", name: "Kokusai Electric", weight: 0.68, sector: "Yari iletken", country: "Japonya", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-MS", fundCode: "TMG", symbol: "MS", name: "Morgan Stanley", weight: 0.65, sector: "Finans", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-KO", fundCode: "TMG", symbol: "KO", name: "Coca-Cola", weight: 0.63, sector: "Icecek", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-RTX", fundCode: "TMG", symbol: "RTX", name: "RTX", weight: 0.63, sector: "Savunma", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-TXN", fundCode: "TMG", symbol: "TXN", name: "Texas Instruments", weight: 0.63, sector: "Yari iletken", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-CSCO", fundCode: "TMG", symbol: "CSCO", name: "Cisco Systems", weight: 0.6, sector: "Teknoloji", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-HSBC", fundCode: "TMG", symbol: "HSBC", name: "HSBC Holdings", weight: 0.6, sector: "Banka", country: "Birlesik Krallik", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-IBM", fundCode: "TMG", symbol: "IBM", name: "IBM", weight: 0.59, sector: "Teknoloji", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-LIN", fundCode: "TMG", symbol: "LIN", name: "Linde", weight: 0.52, sector: "Kimya", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-CVX", fundCode: "TMG", symbol: "CVX", name: "Chevron", weight: 0.51, sector: "Enerji", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-QCOM", fundCode: "TMG", symbol: "QCOM", name: "Qualcomm", weight: 0.48, sector: "Yari iletken", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-SAP", fundCode: "TMG", symbol: "SAP", name: "SAP", weight: 0.47, sector: "Teknoloji", country: "Almanya", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-PEP", fundCode: "TMG", symbol: "PEP", name: "PepsiCo", weight: 0.45, sector: "Icecek", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-AAPB", fundCode: "TMG", symbol: "AAPB", name: "GraniteShares 2x Long AAPL ETF", weight: 0.43, sector: "ETF", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-SU", fundCode: "TMG", symbol: "SU", name: "Schneider Electric", weight: 0.42, sector: "Sanayi", country: "Fransa", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-IAG", fundCode: "TMG", symbol: "IAG", name: "Is Portfoy Fon", weight: 0.41, sector: "Yatirim Fonu", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-SONY", fundCode: "TMG", symbol: "SONY", name: "Sony", weight: 0.41, sector: "Teknoloji", country: "Japonya", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-SHEL", fundCode: "TMG", symbol: "SHEL", name: "Shell", weight: 0.4, sector: "Enerji", country: "Birlesik Krallik", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-SANOFI", fundCode: "TMG", symbol: "SANOFI", name: "Sanofi", weight: 0.38, sector: "Saglik", country: "Fransa", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TMG-ISZ", fundCode: "TMG", symbol: "ISZ", name: "Is Portfoy Fon", weight: 0.36, sector: "Yatirim Fonu", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
  ],
  TGE: [
    { id: "TGE-AIGI", fundCode: "TGE", symbol: "AIGI", name: "ETFS Industrial Metals", weight: 17.01, sector: "Endustriyel metal", country: "Kuresel", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-AIGE", fundCode: "TGE", symbol: "AIGE", name: "WT Energy", weight: 13.4, sector: "Enerji emtiasi", country: "Kuresel", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-COPA", fundCode: "TGE", symbol: "COPA", name: "ETFS Copper", weight: 13.37, sector: "Bakir", country: "Kuresel", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-OILK", fundCode: "TGE", symbol: "OILK", name: "ProShares K-1 Free Crude Oil Strategy ETF", weight: 8.52, sector: "Petrol", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-PHAU", fundCode: "TGE", symbol: "PHAU", name: "ETFS Physical Gold", weight: 7.92, sector: "Altin", country: "Kuresel", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-CRUD", fundCode: "TGE", symbol: "CRUD", name: "ETFS WTI Crude Oil", weight: 7.72, sector: "Petrol", country: "Kuresel", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-NGAS", fundCode: "TGE", symbol: "NGAS", name: "WisdomTree Natural Gas Fund", weight: 7.25, sector: "Dogalgaz", country: "Kuresel", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-USD", fundCode: "TGE", symbol: "USD", name: "ABD Dolari", weight: 6.39, sector: "Doviz", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-ALUM", fundCode: "TGE", symbol: "ALUM", name: "WisdomTree Commodity Securities", weight: 5.99, sector: "Aluminyum", country: "Kuresel", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-NICK", fundCode: "TGE", symbol: "NICK", name: "WisdomTree Nickel Fund", weight: 3.02, sector: "Nikel", country: "Kuresel", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-GLD", fundCode: "TGE", symbol: "GLD", name: "SPDR Gold Shares", weight: 2.8, sector: "Altin", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-XLE", fundCode: "TGE", symbol: "XLE", name: "Energy Select Sector SPDR Fund", weight: 1.95, sector: "Enerji hisseleri", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-SLV", fundCode: "TGE", symbol: "SLV", name: "iShares Silver Trust", weight: 1.62, sector: "Gumus", country: "ABD", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-ONSU", fundCode: "TGE", symbol: "ONSU", name: "Is Portfoy Altin Fonu", weight: 1.52, sector: "Altin fonu", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-GMSTR", fundCode: "TGE", symbol: "GMSTR", name: "Gumus BYF", weight: 0.72, sector: "Gumus", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-IOO", fundCode: "TGE", symbol: "IOO", name: "Is Portfoy Fon", weight: 0.38, sector: "Yatirim Fonu", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "TGE-CAD", fundCode: "TGE", symbol: "CAD", name: "Kanada Dolari", weight: 0.01, sector: "Doviz", country: "Kanada", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
  ],
  KPH: [
    { id: "KPH-AEFES", fundCode: "KPH", symbol: "AEFES", name: "Anadolu Efes", weight: 4.91, sector: "Icecek", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-AGESA", fundCode: "KPH", symbol: "AGESA", name: "AgeSA Hayat ve Emeklilik", weight: 3.85, sector: "Sigorta", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-AKBNK", fundCode: "KPH", symbol: "AKBNK", name: "Akbank", weight: 4.71, sector: "Banka", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-AKSA", fundCode: "KPH", symbol: "AKSA", name: "Aksa Akrilik", weight: 0.68, sector: "Kimya", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-AKSGY", fundCode: "KPH", symbol: "AKSGY", name: "Akis GYO", weight: 4.46, sector: "GYO", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-ALARK", fundCode: "KPH", symbol: "ALARK", name: "Alarko Holding", weight: 1.89, sector: "Holding", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-ANHYT", fundCode: "KPH", symbol: "ANHYT", name: "Anadolu Hayat Emeklilik", weight: 5.07, sector: "Sigorta", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-ANSGR", fundCode: "KPH", symbol: "ANSGR", name: "Anadolu Sigorta", weight: 2.18, sector: "Sigorta", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-ARASE", fundCode: "KPH", symbol: "ARASE", name: "Dogu Aras Enerji", weight: 4.81, sector: "Enerji", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-AYGAZ", fundCode: "KPH", symbol: "AYGAZ", name: "Aygaz", weight: 1.35, sector: "Enerji", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-BASGZ", fundCode: "KPH", symbol: "BASGZ", name: "Baskent Dogalgaz", weight: 4.86, sector: "Enerji", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-BIMAS", fundCode: "KPH", symbol: "BIMAS", name: "Bim Birlesik Magazalar", weight: 5.13, sector: "Perakende", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-CCOLA", fundCode: "KPH", symbol: "CCOLA", name: "Coca-Cola Icecek", weight: 1.06, sector: "Icecek", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-EKGYO", fundCode: "KPH", symbol: "EKGYO", name: "Emlak Konut GYO", weight: 1.16, sector: "GYO", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-ENJSA", fundCode: "KPH", symbol: "ENJSA", name: "Enerjisa Enerji", weight: 4.08, sector: "Enerji", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-GARAN", fundCode: "KPH", symbol: "GARAN", name: "Garanti Bankasi", weight: 5.03, sector: "Banka", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-GLRMK", fundCode: "KPH", symbol: "GLRMK", name: "Gulermak Agir Sanayi", weight: 0.58, sector: "Insaat", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-ISCTR", fundCode: "KPH", symbol: "ISCTR", name: "Is Bankasi", weight: 1.78, sector: "Banka", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-KCHOL", fundCode: "KPH", symbol: "KCHOL", name: "Koc Holding", weight: 4.14, sector: "Holding", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-LKMNH", fundCode: "KPH", symbol: "LKMNH", name: "Lokman Hekim", weight: 0.42, sector: "Saglik", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-MGROS", fundCode: "KPH", symbol: "MGROS", name: "Migros Ticaret", weight: 5.5, sector: "Perakende", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-NTGAZ", fundCode: "KPH", symbol: "NTGAZ", name: "Naturelgaz", weight: 1.34, sector: "Enerji", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-SAHOL", fundCode: "KPH", symbol: "SAHOL", name: "Sabanci Holding", weight: 5.66, sector: "Holding", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-TAVHL", fundCode: "KPH", symbol: "TAVHL", name: "TAV Havalimanlari", weight: 4.5, sector: "Ulastirma", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-TCELL", fundCode: "KPH", symbol: "TCELL", name: "Turkcell", weight: 5.14, sector: "Iletisim", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-THYAO", fundCode: "KPH", symbol: "THYAO", name: "Turk Hava Yollari", weight: 3.23, sector: "Ulastirma", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-TOASO", fundCode: "KPH", symbol: "TOASO", name: "Tofas", weight: 1.72, sector: "Otomotiv", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-TRALT", fundCode: "KPH", symbol: "TRALT", name: "Turk Altin Isletmeleri", weight: 1.12, sector: "Maden", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-TURSG", fundCode: "KPH", symbol: "TURSG", name: "Turkiye Sigorta", weight: 1.08, sector: "Sigorta", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
    { id: "KPH-YKBNK", fundCode: "KPH", symbol: "YKBNK", name: "Yapi ve Kredi Bankasi", weight: 3.22, sector: "Banka", country: "Turkiye", source: "Is Portfoy resmi Haziran 2026 portfoy dokumu", asOf: "2026-06" },
  ],
  AFT: [
    { id: "AFT-NVDA", fundCode: "AFT", symbol: "NVDA", name: "Nvidia", weight: 9.4, sector: "Yari iletken", country: "ABD", source: "Baslangic katalog" },
    { id: "AFT-MSFT", fundCode: "AFT", symbol: "MSFT", name: "Microsoft", weight: 8.1, sector: "Teknoloji", country: "ABD", source: "Baslangic katalog" },
    { id: "AFT-AAPL", fundCode: "AFT", symbol: "AAPL", name: "Apple", weight: 6.4, sector: "Teknoloji", country: "ABD", source: "Baslangic katalog" },
    { id: "AFT-META", fundCode: "AFT", symbol: "META", name: "Meta Platforms", weight: 5.2, sector: "Iletisim", country: "ABD", source: "Baslangic katalog" },
    { id: "AFT-AVGO", fundCode: "AFT", symbol: "AVGO", name: "Broadcom", weight: 4.8, sector: "Yari iletken", country: "ABD", source: "Baslangic katalog" },
  ],
};

const defaultSettings: PortfolioSettings = {
  autoRefresh: true,
  targetAllocations: defaultTargetAllocations,
  rebalanceAmount: 50000,
  dismissedAlertIds: [],
  fundHoldings: defaultFundHoldings,
};

const emptyState: PortfolioState = {
  assets: [],
  watchlist: [],
  transactions: [],
  history: [],
  cashFlows: [],
  benchmarkHistory: [],
  settings: defaultSettings,
};

const knownNames: Record<string, { name: string; type?: string; source?: string; symbol?: string }> = {
  NAKIT: { name: "Nakit", type: "Nakit", source: "manual", symbol: "NAKIT" },
  CASH: { name: "Nakit", type: "Nakit", source: "manual", symbol: "NAKIT" },
  BTC: { name: "Bitcoin", type: "Kripto", source: "binance" },
  ETH: { name: "Ethereum", type: "Kripto", source: "binance" },
  LINK: { name: "Chainlink", type: "Kripto", source: "binance" },
  RNDR: { name: "Render", type: "Kripto", source: "binance", symbol: "RENDERTRY" },
  RENDER: { name: "Render", type: "Kripto", source: "binance", symbol: "RENDERTRY" },
  ONDO: { name: "ONDO", type: "Kripto", source: "binance" },
  ALGO: { name: "Algorand", type: "Kripto", source: "binance" },
  SUI: { name: "SUI", type: "Kripto", source: "binance" },
  XRP: { name: "Ripple", type: "Kripto", source: "binance" },
  NEAR: { name: "NEAR", type: "Kripto", source: "binance" },
  ALTINS1: { name: "DARPHANE ALTIN SERTIFIKASI", type: "Altin", source: "tradingview", symbol: "ALTINS1" },
  ALTIN: { name: "DARPHANE ALTIN SERTIFIKASI", type: "Altin", source: "tradingview", symbol: "ALTINS1" },
  GMSTRF: { name: "GMSTR.F", type: "Hisse", source: "yahoo", symbol: "GMSTR.IS" },
  TMG: { name: "Is Portfoy Yabanci Hisse Senedi Fonu", type: "Fon", source: "isportfoy", symbol: "TMG" },
  TGE: { name: "Is Portfoy Emtia Yabanci BYF Fon Sepeti Fonu", type: "Fon", source: "isportfoy", symbol: "TGE" },
  KPH: { name: "Is Portfoy Kar Payi Odeyen Hisse Senedi TL Fonu", type: "Fon", source: "isportfoy", symbol: "KPH" },
  AFT: { name: "Ak Portfoy Yeni Teknolojiler Yabanci Hisse Senedi Fonu", type: "Fon", source: "akportfoy", symbol: "AFT" },
};

const types = ["Hisse", "Fon", "Kripto", "Doviz", "Altin", "Nakit", "Diger"];
const menuItems = [
  { key: "distribution", label: "Portfoy Dagilimi", description: "Varlik sinifi, toplam paylar ve mevcut varlik listen." },
  { key: "performance", label: "Performans Gecmisi", description: "Portfoy degerinin zaman icindeki degisimi ve nakit akisi." },
  { key: "targets", label: "Hedef Portfoy", description: "Hedef oranlar, sapmalar ve yeni yatirim dagitim onerisi." },
  { key: "watchlist", label: "Alim Firsatlari", description: "Portfoye eklemeden once takip etmek istedigin varliklar ve hedef fiyatlar." },
  { key: "comparison", label: "Karsilastirma", description: "Portfoy getirini BIST, altin, doviz, Bitcoin ve global endekslerle karsilastir." },
  { key: "fundOverlap", label: "Fon Icerik & Ortusme", description: "Fonlarin ic varliklarini, ortak pozisyonlarini ve dolayli maruziyeti analiz et." },
  { key: "dataStatus", label: "Veri Durumu", description: "Fiyat kaynaklari, son guncelleme ve hata sagligi." },
  { key: "alerts", label: "Uyarilar", description: "Hedef sapmalari, fiyat veri sorunlari ve risk sinyalleri." },
  { key: "projection", label: "Gelecek Projeksiyonu", description: "Uzun vadeli, yil yil buyume senaryosu." },
  { key: "analytics", label: "Portfoy Analitigi", description: "Sinif dengesi, en iyi ve en zayif performanslar." },
  { key: "risk", label: "Risk & Cesitlilik Notu", description: "Yogunlasma, cesitlilik ve stratejik denge ozeti." },
] as const;
const rangeOptions = [
  { key: "7d", label: "1 Hafta", days: 7 },
  { key: "1m", label: "1 Ay", days: 31 },
  { key: "3m", label: "3 Ay", days: 93 },
  { key: "1y", label: "1 Yil", days: 366 },
  { key: "all", label: "Tum Zamanlar", days: 0 },
] as const;
const groupDefinitions = [
  { key: "precious", label: "Degerli Madenler" },
  { key: "fund", label: "Yatirim Fonlari" },
  { key: "Hisse", label: "Hisse Senetleri" },
  { key: "Kripto", label: "Kriptolar" },
  { key: "Doviz", label: "Doviz" },
  { key: "Nakit", label: "Nakit" },
  { key: "Diger", label: "Diger" },
];
const colors = ["#2f6fed", "#12805c", "#bc3d32", "#7557d6", "#c77d0e", "#0f8b8d", "#596579"];
const groupColors: Record<string, string> = {
  precious: "#d19a18",
  fund: "#3f7f8f",
  Hisse: "#193a6a",
  Kripto: "#18b884",
  Doviz: "#596579",
  Nakit: "#6b7280",
  Diger: "#7557d6",
};
const preciousCodes = new Set(["ALTINS1", "ALTIN", "GMSTRF", "GMSTR"]);
const fundCodes = new Set(["TGE", "TMG", "KPH"]);
const benchmarkDefinitions = [
  { code: "portfolio", label: "Portfoy", source: "internal", symbol: "PORTFOY", color: "#10243f" },
  { code: "bist100", label: "BIST 100", source: "yahoo", symbol: "XU100.IS", color: "#193a6a" },
  { code: "gold", label: "Altin (ALTIN.S1)", source: "tradingview", symbol: "ALTINS1", color: "#d19a18" },
  { code: "usdtry", label: "Dolar/TL", source: "yahoo", symbol: "USDTRY=X", color: "#12805c" },
  { code: "eurtry", label: "Euro/TL", source: "yahoo", symbol: "EURTRY=X", color: "#3f7f8f" },
  { code: "btctry", label: "Bitcoin/TL", source: "binance", symbol: "BTCTRY", color: "#18b884" },
  { code: "sp500", label: "S&P 500", source: "yahoo", symbol: "^GSPC", color: "#7557d6" },
];
const cryptoLogoUrls: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  RENDER: "https://assets.coingecko.com/coins/images/11636/small/rndr.png",
  RNDR: "https://assets.coingecko.com/coins/images/11636/small/rndr.png",
  ONDO: "https://assets.coingecko.com/coins/images/26580/small/ONDO.png",
  ALGO: "https://assets.coingecko.com/coins/images/4380/small/download.png",
  SUI: "https://assets.coingecko.com/coins/images/26375/small/sui-ocean-square.png",
  XRP: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  NEAR: "https://assets.coingecko.com/coins/images/10365/small/near.jpg",
};
const directAssetLogoUrls: Record<string, string> = {
  FROTO: "https://companieslogo.com/img/orig/FROTO.IS-0beb2e34.png?t=1720244491",
  ULKER: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/%C3%9Clker_logo_%282%29.svg/250px-%C3%9Clker_logo_%282%29.svg.png",
};
const assetLogoDomains: Record<string, string> = {
  ALTINS1: "darphane.gov.tr",
  ALTIN: "darphane.gov.tr",
  GMSTRF: "darphane.gov.tr",
  GMSTR: "darphane.gov.tr",
  TGE: "isportfoy.com.tr",
  TMG: "isportfoy.com.tr",
  KPH: "isportfoy.com.tr",
  TUPRS: "tupras.com.tr",
  FROTO: "fordotosan.com.tr",
  BIMAS: "bim.com.tr",
  VAKBN: "vakifbank.com.tr",
  TAVHL: "tavhavalimanlari.com.tr",
  ULKER: "ulker.com.tr",
  PGSUS: "flypgs.com",
};

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function compactCode(value: string) {
  return String(value || "").toUpperCase().replace(/^BIST:/, "").replace(/[^A-Z0-9]/g, "");
}

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

function assetInitials(asset: Asset) {
  return compactCode(asset.ticker || asset.priceSymbol || asset.name).slice(0, 2) || "PF";
}

function cryptoBaseCode(symbol: string) {
  const compact = compactCode(symbol);
  const quote = ["TRY", "USDT", "USD", "EUR"].find((suffix) => compact.endsWith(suffix));
  return quote ? compact.slice(0, -quote.length) : compact;
}

function assetLogoUrl(asset: Asset) {
  if (asset.logoUrl) return asset.logoUrl;
  const code = compactCode(asset.ticker || asset.priceSymbol || "");
  if (asset.type === "Nakit" || code === "NAKIT") return "";
  const cryptoBase = asset.type === "Kripto" || asset.priceSource === "binance" ? cryptoBaseCode(asset.priceSymbol || asset.ticker) : "";
  if (cryptoBase && cryptoLogoUrls[cryptoBase]) return cryptoLogoUrls[cryptoBase];
  if (directAssetLogoUrls[code]) return directAssetLogoUrls[code];
  const domain = assetLogoDomains[code] || assetLogoDomains[compactCode(asset.priceSymbol || "")];
  if (domain) return faviconUrl(domain);
  if (asset.priceSource === "isportfoy") return faviconUrl("isportfoy.com.tr");
  if (asset.priceSource === "tefas") return faviconUrl("tefas.gov.tr");
  return "";
}

function AssetLogo({ asset, color, small = false }: { asset: Asset; color: string; small?: boolean }) {
  const logoUrl = assetLogoUrl(asset);
  const code = compactCode(asset.ticker || asset.priceSymbol || "");
  const isCash = asset.type === "Nakit" || code === "NAKIT";
  return (
    <span className={`${small ? "asset-logo small" : "asset-logo"}${isCash ? " cash-logo" : ""}`} style={{ background: isCash ? undefined : color }}>
      {isCash ? (
        <span className="cash-stack" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      ) : (
        <span className="logo-fallback">{assetInitials(asset)}</span>
      )}
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </span>
  );
}

function TrendValue({ trend, children }: { trend: number; children: ReactNode }) {
  const direction = trend >= 0 ? "up" : "down";
  return (
    <strong className={`trend-value ${direction === "up" ? "positive" : "negative"}`}>
      <span className={`trend-triangle ${direction}`} />
      {children}
    </strong>
  );
}

function parseAmount(value: string | number) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value || "").trim().replace(/\s/g, "");
  if (!cleaned) return 0;
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function amountFieldValue(value?: number) {
  return Number.isFinite(Number(value)) && Number(value) !== 0 ? String(value) : "";
}

function money(value: number, currency = "TRY") {
  return Number(value || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "TRY" ? 2 : 4,
  });
}

function num(value: number) {
  return Number(value || 0).toLocaleString("tr-TR", { maximumFractionDigits: 6 });
}

function pct(value: number) {
  return `%${Number(value || 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`;
}

function signedPct(value: number) {
  const formatted = Number(Math.abs(value) || 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 });
  return `${value >= 0 ? "+" : "-"}%${formatted}`;
}

function signedMoney(value: number) {
  return `${value >= 0 ? "+" : ""}${money(value)}`;
}

function isPositionTransaction(type: string) {
  return type === "buy" || type === "sell";
}

function transactionAmountPlaceholder(type: string) {
  if (type === "dividend") return "Temettu tutari";
  if (type === "distribution") return "Dagitim tutari";
  if (type === "fee") return "Komisyon tutari";
  if (type === "tax") return "Vergi tutari";
  if (type === "sell") return "Satis tutari";
  if (type === "buy") return "Alis tutari";
  return "Tutar";
}

function transactionTypeLabel(type: string) {
  if (type === "buy") return "Alis";
  if (type === "sell") return "Satis";
  if (type === "dividend") return "Temettu";
  if (type === "distribution") return "Fon dagitimi";
  if (type === "fee") return "Komisyon";
  if (type === "tax") return "Vergi";
  if (type === "transfer") return "Transfer";
  return "Islem";
}

function transactionCashAmount(tx: Transaction) {
  return Number(tx.amount || (isPositionTransaction(tx.type) ? tx.quantity * tx.price : tx.price) || 0);
}

function plainDate(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

function totalsFromAssets(assets: Asset[]) {
  const totalValue = assets.reduce((sum, a) => sum + a.quantity * a.price * (a.fxRate || 1), 0);
  const totalCost = assets.reduce((sum, a) => sum + a.quantity * a.avgCost * (a.fxRate || 1), 0);
  const cash = assets.filter((a) => a.type === "Nakit").reduce((sum, a) => sum + a.quantity * a.price, 0);
  const profitLoss = totalValue - totalCost;
  return { totalValue, totalCost, cash, profitLoss, rate: totalCost ? (profitLoss / totalCost) * 100 : 0 };
}

function dailyBasePrice(asset: Asset, today = plainDate()) {
  if (asset.dayOpenDate === today && Number(asset.dayOpenPrice || 0) > 0) return Number(asset.dayOpenPrice);
  if (Number(asset.previousPrice || 0) > 0 && asset.previousPriceAt?.slice(0, 10) === today) return Number(asset.previousPrice);
  return 0;
}

function nextDailyPriceAnchor(asset: Asset, today = plainDate()) {
  const existingOpen = asset.dayOpenDate === today && Number(asset.dayOpenPrice || 0) > 0 ? Number(asset.dayOpenPrice) : 0;
  return {
    dayOpenPrice: existingOpen || Number(asset.price || 0),
    dayOpenDate: today,
  };
}

function normalizeSnapshot(snapshot: Partial<PortfolioSnapshot>): PortfolioSnapshot {
  return {
    id: snapshot.id || uid(),
    date: snapshot.date || plainDate(),
    totalValue: Number(snapshot.totalValue || 0),
    totalCost: Number(snapshot.totalCost || 0),
    cash: Number(snapshot.cash || 0),
    profitLoss: Number(snapshot.profitLoss || 0),
    assetCount: Number(snapshot.assetCount || 0),
  };
}

function normalizeCashFlow(flow: Partial<CashFlow>): CashFlow {
  return {
    id: flow.id || uid(),
    date: flow.date || plainDate(),
    type: flow.type === "withdrawal" ? "withdrawal" : "deposit",
    amount: Number(flow.amount || 0),
    note: flow.note || "",
  };
}

function normalizeBenchmarkPoint(point: Partial<BenchmarkPoint>): BenchmarkPoint {
  return {
    id: point.id || uid(),
    code: point.code || "",
    date: point.date || plainDate(),
    price: Number(point.price || 0),
    source: point.source || "",
    symbol: point.symbol || "",
  };
}

function normalizeFundHolding(fundCode: string, holding: Partial<FundHolding>): FundHolding {
  const normalizedFundCode = compactCode(holding.fundCode || fundCode);
  const symbol = compactCode(holding.symbol || "");
  return {
    id: holding.id || `${normalizedFundCode}-${symbol || uid()}`,
    fundCode: normalizedFundCode,
    symbol,
    name: String(holding.name || symbol || "Isimsiz varlik"),
    weight: Math.max(0, Math.min(100, Number(holding.weight || 0))),
    sector: String(holding.sector || "Belirtilmedi"),
    country: String(holding.country || "Belirtilmedi"),
    source: holding.source ? String(holding.source) : undefined,
    asOf: holding.asOf ? String(holding.asOf) : undefined,
  };
}

function normalizeFundHoldings(holdings?: Record<string, Partial<FundHolding>[]>) {
  const merged: Record<string, Partial<FundHolding>[]> = { ...defaultFundHoldings, ...(holdings || {}) };
  return Object.fromEntries(
    Object.entries(merged).map(([fundCode, rows]) => [
      compactCode(fundCode),
      Array.isArray(rows)
        ? rows.map((row) => normalizeFundHolding(fundCode, row)).filter((row) => row.symbol && row.weight > 0)
        : [],
    ]),
  );
}

function normalizeTransaction(tx: Partial<Transaction>): Transaction {
  return {
    id: tx.id || uid(),
    assetId: String(tx.assetId || ""),
    assetTicker: tx.assetTicker ? String(tx.assetTicker) : undefined,
    assetName: tx.assetName ? String(tx.assetName) : undefined,
    assetSymbol: tx.assetSymbol ? String(tx.assetSymbol) : undefined,
    date: tx.date || plainDate(),
    type: String(tx.type || "buy"),
    quantity: Number(tx.quantity || 0),
    price: Number(tx.price || 0),
    amount: Number(tx.amount || 0),
    fee: Number(tx.fee || 0),
    costBasis: Number(tx.costBasis || 0),
    realizedProfit: Number(tx.realizedProfit || 0),
    resultingQuantity: Number(tx.resultingQuantity || 0),
    resultingAvgCost: Number(tx.resultingAvgCost || 0),
    note: String(tx.note || ""),
  };
}

function applyTransactionToAsset(asset: Asset, incoming: Transaction) {
  const tx = normalizeTransaction(incoming);
  const fee = Math.max(0, Number(tx.fee || 0));
  const amount = Number(tx.amount || tx.quantity * tx.price || 0);
  const quantity = Number(tx.quantity || (tx.price ? amount / tx.price : 0));
  const currentQuantity = Number(asset.quantity || 0);
  const currentAvgCost = Number(asset.avgCost || 0);
  let nextAsset = { ...asset };
  let nextTx = { ...tx, quantity, amount, fee };

  if (tx.type === "buy") {
    if (quantity <= 0 || amount <= 0) return { asset, transaction: nextTx, error: "Alis icin adet ve tutar bilgisi gerekli." };
    const currentCost = currentQuantity * currentAvgCost;
    const nextQuantity = currentQuantity + quantity;
    const nextCost = currentCost + amount + fee;
    const nextAvgCost = nextQuantity ? nextCost / nextQuantity : 0;
    nextAsset = {
      ...asset,
      quantity: nextQuantity,
      avgCost: nextAvgCost,
      price: asset.price || tx.price,
    };
    nextTx = {
      ...nextTx,
      costBasis: amount + fee,
      realizedProfit: 0,
      resultingQuantity: nextQuantity,
      resultingAvgCost: nextAvgCost,
    };
  }

  if (tx.type === "sell") {
    if (quantity <= 0 || amount <= 0) return { asset, transaction: nextTx, error: "Satis icin adet ve tutar bilgisi gerekli." };
    if (quantity > currentQuantity + 0.00000001) return { asset, transaction: nextTx, error: "Satmak istedigin adet mevcut adetten fazla." };
    const costBasis = quantity * currentAvgCost;
    const realizedProfit = amount - fee - costBasis;
    const nextQuantity = Math.max(0, currentQuantity - quantity);
    const nextAvgCost = nextQuantity > 0.00000001 ? currentAvgCost : 0;
    nextAsset = {
      ...asset,
      quantity: nextQuantity,
      avgCost: nextAvgCost,
    };
    nextTx = {
      ...nextTx,
      costBasis,
      realizedProfit,
      resultingQuantity: nextQuantity,
      resultingAvgCost: nextAvgCost,
    };
  }

  return { asset: normalizeAsset(nextAsset), transaction: normalizeTransaction(nextTx), error: "" };
}

function transactionSortRank(transaction: Transaction) {
  if (transaction.type === "buy" && transaction.note.toLowerCase().includes("ilk varlik kaydi")) return 0;
  if (transaction.type === "sell") return 1;
  if (transaction.type === "buy") return 2;
  return 3;
}

function sortTransactionsChronologically(transactions: Transaction[]) {
  return transactions
    .map((transaction, index) => ({ transaction: normalizeTransaction(transaction), index }))
    .sort((left, right) => {
      const byDate = left.transaction.date.localeCompare(right.transaction.date);
      const byRank = transactionSortRank(left.transaction) - transactionSortRank(right.transaction);
      return byDate || byRank || left.index - right.index;
    })
    .map((item) => item.transaction);
}

function rebuildAssetFromTransactions(asset: Asset, transactions: Transaction[]) {
  const ordered = sortTransactionsChronologically(transactions);
  let nextAsset = normalizeAsset({ ...asset, quantity: 0, avgCost: 0 });
  const rebuiltTransactions: Transaction[] = [];

  for (const transaction of ordered) {
    if (!isPositionTransaction(transaction.type)) {
      rebuiltTransactions.push(normalizeTransaction(transaction));
      continue;
    }
    const applied = applyTransactionToAsset(nextAsset, transaction);
    if (applied.error) return { asset, transactions, error: applied.error };
    nextAsset = applied.asset;
    rebuiltTransactions.push(applied.transaction);
  }

  return { asset: normalizeAsset(nextAsset), transactions: rebuiltTransactions, error: "" };
}

function summarizeAssetTransactions(asset: Asset, transactions: Transaction[]) {
  return transactions
    .map(normalizeTransaction)
    .filter((tx) => tx.assetId === asset.id)
    .reduce((summary, tx) => {
      const gross = tx.amount || tx.quantity * tx.price;
      if (tx.type === "buy") summary.buyTotal += gross + (tx.fee || 0);
      if (tx.type === "sell") {
        const costBasis = Number(tx.costBasis || tx.quantity * asset.avgCost || 0);
        summary.soldCostBasis += costBasis;
        summary.sellTotal += gross - (tx.fee || 0);
        summary.realizedProfit += Number.isFinite(Number(tx.realizedProfit)) && tx.realizedProfit !== 0
          ? Number(tx.realizedProfit)
          : gross - costBasis - (tx.fee || 0);
      }
      if (tx.type === "dividend" || tx.type === "distribution") summary.income += tx.amount || tx.price;
      if (tx.type === "fee" || tx.type === "tax") summary.expense += (tx.amount || tx.price) + (tx.fee || 0);
      if (tx.type === "transfer") summary.transferCount += 1;
      return summary;
    }, { buyTotal: 0, sellTotal: 0, soldCostBasis: 0, realizedProfit: 0, income: 0, expense: 0, transferCount: 0 });
}

function realizedNetFromSummary(summary: ReturnType<typeof summarizeAssetTransactions>) {
  return summary.realizedProfit + summary.income - summary.expense;
}

function historicalPerformanceBase(openCost: number, summary: ReturnType<typeof summarizeAssetTransactions>) {
  return summary.buyTotal || openCost + summary.soldCostBasis;
}

function transactionWithAssetIdentity(tx: Partial<Transaction>, asset: Asset): Partial<Transaction> {
  return {
    ...tx,
    assetId: asset.id,
    assetTicker: asset.ticker,
    assetName: asset.name,
    assetSymbol: asset.priceSymbol || asset.ticker,
  };
}

function transactionIdentityCode(tx: Transaction) {
  return compactCode(tx.assetTicker || tx.assetSymbol || tx.assetName || "");
}

function transactionBelongsToAsset(tx: Transaction, asset: Asset, assetsById: Map<string, Asset>) {
  if (tx.assetId === asset.id) return true;
  const assetCodes = [asset.ticker, asset.priceSymbol, asset.name].map(compactCode).filter(Boolean);
  const txCode = transactionIdentityCode(tx);
  if (txCode && assetCodes.includes(txCode)) return true;
  const hasKnownAsset = Boolean(tx.assetId && assetsById.has(tx.assetId));
  if (!hasKnownAsset && isPositionTransaction(tx.type) && tx.price && asset.price) {
    const diff = Math.abs(Number(asset.price || 0) - Number(tx.price || 0));
    return diff <= Math.max(0.05, Number(tx.price || 0) * 0.0025);
  }
  return false;
}

function repairPortfolioState(input: PortfolioState): PortfolioState {
  const normalizedState: PortfolioState = {
    assets: (input.assets || []).map(normalizeAsset),
    watchlist: (input.watchlist || []).map(normalizeWatchItem),
    transactions: (input.transactions || []).map(normalizeTransaction),
    history: (input.history || []).map(normalizeSnapshot),
    cashFlows: (input.cashFlows || []).map(normalizeCashFlow),
    benchmarkHistory: (input.benchmarkHistory || []).map(normalizeBenchmarkPoint),
    settings: normalizeSettings(input.settings),
  };
  const assetsById = new Map(normalizedState.assets.map((asset) => [asset.id, asset]));
  const transactionUpdates = new Map<string, Transaction>();
  let changed = false;

  const assets = normalizedState.assets.map((asset) => {
    const related = normalizedState.transactions
      .filter((tx) => !transactionUpdates.has(tx.id) || tx.assetId === asset.id)
      .filter((tx) => transactionBelongsToAsset(tx, asset, assetsById))
      .map((tx) => {
        const identified = normalizeTransaction(transactionWithAssetIdentity(tx, asset));
        if (
          identified.assetId !== tx.assetId
          || identified.assetTicker !== tx.assetTicker
          || identified.assetSymbol !== tx.assetSymbol
          || identified.assetName !== tx.assetName
        ) {
          changed = true;
        }
        return identified;
      });
    if (!related.some((tx) => isPositionTransaction(tx.type))) return asset;

    const rebuilt = rebuildAssetFromTransactions(asset, related);
    if (rebuilt.error) return asset;
    rebuilt.transactions.forEach((tx) => transactionUpdates.set(tx.id, tx));
    const nextAsset = normalizeAsset({
      ...rebuilt.asset,
      price: asset.price,
      lastPriceAt: asset.lastPriceAt,
      lastPriceError: asset.lastPriceError,
      previousPrice: asset.previousPrice,
      previousPriceAt: asset.previousPriceAt,
      dayOpenPrice: asset.dayOpenPrice,
      dayOpenDate: asset.dayOpenDate,
      logoUrl: asset.logoUrl,
    });
    if (
      Math.abs(nextAsset.quantity - asset.quantity) > 0.00000001
      || Math.abs(nextAsset.avgCost - asset.avgCost) > 0.00000001
    ) {
      changed = true;
    }
    return nextAsset;
  });

  if (!changed) return normalizedState;
  return {
    ...normalizedState,
    assets,
    transactions: normalizedState.transactions.map((tx) => transactionUpdates.get(tx.id) || tx),
  };
}

function reverseLastTransactionOnAsset(asset: Asset, incoming: Transaction) {
  const tx = normalizeTransaction(incoming);
  const amount = Number(tx.amount || tx.quantity * tx.price || 0);
  const fee = Number(tx.fee || 0);
  let nextAsset = { ...asset };

  if (tx.type === "buy") {
    const nextQuantity = Math.max(0, Number(asset.quantity || 0) - Number(tx.quantity || 0));
    const currentCost = Number(asset.quantity || 0) * Number(asset.avgCost || 0);
    const previousCost = Math.max(0, currentCost - amount - fee);
    nextAsset = {
      ...asset,
      quantity: nextQuantity,
      avgCost: nextQuantity ? previousCost / nextQuantity : 0,
    };
  }

  if (tx.type === "sell") {
    const restoredQuantity = Number(asset.quantity || 0) + Number(tx.quantity || 0);
    const restoredAvgCost = tx.costBasis && tx.quantity ? tx.costBasis / tx.quantity : Number(asset.avgCost || tx.resultingAvgCost || 0);
    nextAsset = {
      ...asset,
      quantity: restoredQuantity,
      avgCost: restoredAvgCost,
    };
  }

  return normalizeAsset(nextAsset);
}

function normalizeSettings(settings?: Partial<PortfolioSettings> & { autoRefresh?: boolean }): PortfolioSettings {
  const incomingTargets = settings?.targetAllocations || {};
  return {
    autoRefresh: settings?.autoRefresh !== false,
    rebalanceAmount: Number(settings?.rebalanceAmount || defaultSettings.rebalanceAmount),
    dismissedAlertIds: Array.isArray(settings?.dismissedAlertIds) ? settings.dismissedAlertIds.map(String) : [],
    fundHoldings: normalizeFundHoldings(settings?.fundHoldings),
    targetAllocations: Object.fromEntries(
      groupDefinitions.map((group) => [
        group.key,
        Math.max(0, Number(incomingTargets[group.key] ?? defaultTargetAllocations[group.key] ?? 0)),
      ]),
    ),
  };
}

function absoluteMoney(value: number) {
  return money(Math.abs(value));
}

function compactMoney(value: number) {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} M TL`;
  }
  return money(value);
}

function formatTime(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatAge(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return "Az once";
  if (diffMinutes < 60) return `${diffMinutes} dk once`;
  const hours = Math.round(diffMinutes / 60);
  if (hours < 48) return `${hours} saat once`;
  return `${Math.round(hours / 24)} gun once`;
}

function inferAssetDetails(input: string) {
  const raw = String(input || "").trim().toUpperCase();
  const parts = raw.split(/[/-]/).filter(Boolean);
  const base = compactCode(parts[0] || raw);
  const quote = parts[1] ? compactCode(parts[1]) : "TRY";
  const known = knownNames[base] || knownNames[compactCode(raw)];
  const crypto = known?.type === "Kripto" || Boolean(parts[1]);
  const source = known?.source || (crypto ? "binance" : base.length === 3 ? "tefas" : "yahoo");
  const type = known?.type || (crypto ? "Kripto" : base.length === 3 ? "Fon" : "Hisse");
  const ticker = crypto ? `${base}/${quote}` : raw.replace(".", "") || base;
  const symbol =
    known?.symbol ||
    (source === "binance" ? `${base === "RNDR" ? "RENDER" : base}${quote}` : source === "yahoo" ? `${base}.IS` : base);

  return {
    ticker,
    name: known?.name || base,
    type,
    currency: quote || "TRY",
    priceSource: source,
    priceSymbol: symbol,
    autoUpdate: source !== "manual",
    fxRate: 1,
  };
}

function normalizeAsset(asset: Partial<Asset>): Asset {
  const details = inferAssetDetails(asset.ticker || "");
  const assetCode = compactCode(asset.ticker || details.ticker || "");
  const isCash = assetCode === "NAKIT" || (asset.type || details.type) === "Nakit";
  const normalizedType = isCash ? "Nakit" : asset.type || details.type;
  const normalizedSource = isCash ? "manual" : asset.priceSource || details.priceSource;
  const normalizedSymbol = isCash ? "NAKIT" : asset.priceSymbol || details.priceSymbol;
  const avgCost = Number(asset.avgCost || (isCash ? 1 : 0));
  const price = Number(asset.price || asset.avgCost || (isCash ? 1 : 0));
  const assetName = /request rejected/i.test(String(asset.name || "")) ? details.name : asset.name || details.name;
  return {
    id: asset.id || uid(),
    ticker: asset.ticker || details.ticker,
    name: assetName,
    type: normalizedType,
    currency: asset.currency || details.currency,
    priceSource: normalizedSource,
    priceSymbol: normalizedSymbol,
    autoUpdate: asset.autoUpdate !== false && normalizedSource !== "manual",
    fxRate: Number(asset.fxRate || details.fxRate || 1),
    quantity: Number(asset.quantity || 0),
    avgCost,
    costMode: "unit",
    price,
    target: Number(asset.target || 0),
    note: asset.note || "",
    lastPriceAt: asset.lastPriceAt,
    lastPriceError: asset.lastPriceError,
    previousPrice: Number.isFinite(Number(asset.previousPrice)) ? Number(asset.previousPrice) : undefined,
    previousPriceAt: asset.previousPriceAt,
    dayOpenPrice: Number.isFinite(Number(asset.dayOpenPrice)) ? Number(asset.dayOpenPrice) : undefined,
    dayOpenDate: asset.dayOpenDate,
    logoUrl: asset.logoUrl,
    createdAt: asset.createdAt,
  };
}

function normalizeWatchItem(item: Partial<WatchItem>): WatchItem {
  const details = inferAssetDetails(item.ticker || "");
  const priceSource = item.priceSource || details.priceSource;
  const priceSymbol = item.priceSymbol || details.priceSymbol;
  const price = Number(item.price || 0);
  const targetPrice = Number(item.targetPrice || 0);
  return {
    id: item.id || uid(),
    ticker: item.ticker || details.ticker,
    name: /request rejected/i.test(String(item.name || "")) ? details.name : item.name || details.name,
    type: item.type || details.type,
    currency: item.currency || details.currency,
    priceSource,
    priceSymbol,
    targetPrice,
    targetWeight: Number(item.targetWeight || 0),
    note: item.note || "",
    price,
    lastPriceAt: item.lastPriceAt,
    lastPriceError: item.lastPriceError,
    logoUrl: item.logoUrl,
    createdAt: item.createdAt || plainDate(),
  };
}

function watchItemAsAsset(item: WatchItem): Asset {
  return normalizeAsset({
    id: item.id,
    ticker: item.ticker,
    name: item.name,
    type: item.type,
    currency: item.currency,
    priceSource: item.priceSource,
    priceSymbol: item.priceSymbol,
    autoUpdate: item.priceSource !== "manual",
    fxRate: 1,
    quantity: 0,
    avgCost: item.targetPrice || item.price || 0,
    price: item.price || item.targetPrice || 0,
    target: item.targetWeight,
    note: item.note,
    lastPriceAt: item.lastPriceAt,
    lastPriceError: item.lastPriceError,
    logoUrl: item.logoUrl,
    createdAt: item.createdAt,
  });
}

function assetGroupKey(asset: Asset) {
  const code = compactCode(asset.ticker || asset.priceSymbol || "");
  if (preciousCodes.has(code)) return "precious";
  if (fundCodes.has(code) || asset.priceSource === "isportfoy" || asset.priceSource === "tefas" || asset.priceSource === "akportfoy") return "fund";
  if (asset.type === "Altin") return "precious";
  if (asset.type === "Fon") return "fund";
  return asset.type || "Diger";
}

function assetGroupIndex(asset: Asset) {
  const index = groupDefinitions.findIndex((group) => group.key === assetGroupKey(asset));
  return index >= 0 ? index : groupDefinitions.length - 1;
}

function assetMergeKey(asset: Asset) {
  return compactCode(asset.ticker || asset.priceSymbol || asset.name);
}

function mergeAssetCluster(assets: Asset[]) {
  const normalized = assets.map(normalizeAsset);
  const primary = normalized
    .slice()
    .sort((left, right) => {
      const byDate = String(right.lastPriceAt || "").localeCompare(String(left.lastPriceAt || ""));
      if (byDate) return byDate;
      return (right.quantity * right.price) - (left.quantity * left.price);
    })[0] || normalizeAsset({});
  const quantity = normalized.reduce((sum, asset) => sum + Number(asset.quantity || 0), 0);
  const totalCost = normalized.reduce((sum, asset) => sum + Number(asset.quantity || 0) * Number(asset.avgCost || 0), 0);
  const bestPriceAsset = normalized.find((asset) => Number(asset.price || 0) > 0) || primary;
  const notes = normalized.map((asset) => asset.note).filter(Boolean);

  return normalizeAsset({
    ...primary,
    id: primary.id,
    createdAt: normalized.map((asset) => asset.createdAt).filter(Boolean).sort()[0] || primary.createdAt,
    quantity,
    avgCost: quantity ? totalCost / quantity : Number(primary.avgCost || 0),
    price: Number(bestPriceAsset.price || primary.price || 0),
    target: Math.max(...normalized.map((asset) => Number(asset.target || 0)), 0),
    note: Array.from(new Set(notes)).join(" | "),
    lastPriceAt: bestPriceAsset.lastPriceAt || primary.lastPriceAt,
    lastPriceError: bestPriceAsset.lastPriceError || primary.lastPriceError,
    previousPrice: bestPriceAsset.previousPrice ?? primary.previousPrice,
    previousPriceAt: bestPriceAsset.previousPriceAt || primary.previousPriceAt,
    dayOpenPrice: bestPriceAsset.dayOpenPrice ?? primary.dayOpenPrice,
    dayOpenDate: bestPriceAsset.dayOpenDate || primary.dayOpenDate,
    logoUrl: bestPriceAsset.logoUrl || primary.logoUrl,
  });
}

async function api<T>(path: string, passcode: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-portfolio-passcode": passcode,
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Islem tamamlanamadi");
  return data as T;
}

export default function Home() {
  const [authChecked, setAuthChecked] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [draftPasscode, setDraftPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [state, setState] = useState<PortfolioState>(emptyState);
  const stateRef = useRef<PortfolioState>(emptyState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<(typeof menuItems)[number]["key"]>("distribution");
  const [historyRange, setHistoryRange] = useState<(typeof rangeOptions)[number]["key"]>("1m");
  const [hoveredHistoryIndex, setHoveredHistoryIndex] = useState<number | null>(null);
  const [assetDraft, setAssetDraft] = useState<Asset | null>(null);
  const [assetLookup, setAssetLookup] = useState<{ loading: boolean; message: string; ok: boolean }>({ loading: false, message: "", ok: false });
  const [assetDraftInputs, setAssetDraftInputs] = useState({ quantity: "", avgCost: "", fee: "", feeQuantity: "", target: "" });
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [cashDraft, setCashDraft] = useState({ type: "deposit" as CashFlow["type"], amount: "", date: plainDate(), note: "" });
  const [editingCashFlowId, setEditingCashFlowId] = useState("");
  const [transactionDraft, setTransactionDraft] = useState({ type: "buy", quantity: "", price: "", amount: "", fee: "", date: plainDate(), note: "" });
  const [quickSellDraft, setQuickSellDraft] = useState({ assetId: "", quantity: "", price: "", amount: "", fee: "", date: plainDate(), note: "" });
  const [sellStrategyDraft, setSellStrategyDraft] = useState({ quantity: "", amount: "", price: "" });
  const [watchDraft, setWatchDraft] = useState({ ticker: "", targetPrice: "", targetWeight: "", note: "" });
  const [fundHoldingDraft, setFundHoldingDraft] = useState({ fundCode: "", symbol: "", name: "", weight: "", sector: "", country: "" });
  const [fundSyncStatus, setFundSyncStatus] = useState("");
  const [lastSync, setLastSync] = useState("");

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => setNeedsSetup(!data.configured))
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("portfolio-passcode");
    if (saved) {
      setDraftPasscode(saved);
      void login(saved);
    }
  }, []);

  useEffect(() => {
    if (!passcode) return;
    const timer = window.setInterval(() => {
      if (state.settings.autoRefresh) void updatePrices();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [passcode, state.assets, state.watchlist, state.settings.autoRefresh]);

  const totals = useMemo(() => {
    const calculated = totalsFromAssets(state.assets);
    const realizedAndBase = state.assets.reduce((summary, asset) => {
      const assetCost = asset.quantity * asset.avgCost * (asset.fxRate || 1);
      const txSummary = summarizeAssetTransactions(asset, state.transactions);
      summary.realized += realizedNetFromSummary(txSummary);
      summary.rateBase += historicalPerformanceBase(assetCost, txSummary);
      return summary;
    }, { realized: 0, rateBase: 0 });
    const pl = calculated.profitLoss + realizedAndBase.realized;
    const rateBase = realizedAndBase.rateBase || calculated.totalCost;
    return { totalValue: calculated.totalValue, totalCost: calculated.totalCost, cash: calculated.cash, pl, rate: rateBase ? (pl / rateBase) * 100 : 0 };
  }, [state.assets, state.transactions]);

  const historySeries = useMemo(() => {
    const todayTotals = totalsFromAssets(state.assets);
    const todaySnapshot = normalizeSnapshot({
      id: `live-${plainDate()}`,
      date: plainDate(),
      totalValue: todayTotals.totalValue,
      totalCost: todayTotals.totalCost,
      cash: todayTotals.cash,
      profitLoss: totals.pl,
      assetCount: state.assets.length,
    });
    const byDate = new Map<string, PortfolioSnapshot>();
    [...state.history.map(normalizeSnapshot), todaySnapshot].forEach((snapshot) => byDate.set(snapshot.date, snapshot));
    const sorted = Array.from(byDate.values()).sort((left, right) => left.date.localeCompare(right.date));
    const selected = rangeOptions.find((item) => item.key === historyRange) || rangeOptions[1];
    if (!selected.days) return sorted;
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - selected.days + 1);
    const cutoff = plainDate(minDate);
    return sorted.filter((snapshot) => snapshot.date >= cutoff);
  }, [state.assets, state.history, historyRange, totals.pl]);

  const performanceStats = useMemo(() => {
    const first = historySeries[0];
    const latest = historySeries[historySeries.length - 1];
    const periodChange = latest && first ? latest.totalValue - first.totalValue : 0;
    const rangeStart = first?.date || plainDate();
    const periodFlows = state.cashFlows.map(normalizeCashFlow).filter((flow) => flow.date >= rangeStart);
    const periodDeposits = periodFlows.filter((flow) => flow.type === "deposit").reduce((sum, flow) => sum + flow.amount, 0);
    const periodWithdrawals = periodFlows.filter((flow) => flow.type === "withdrawal").reduce((sum, flow) => sum + flow.amount, 0);
    const netCashFlow = periodDeposits - periodWithdrawals;
    const investmentGain = periodChange - netCashFlow;
    const performanceBase = Math.max((first?.totalValue || 0) + periodDeposits, 1);
    const realReturnRate = (investmentGain / performanceBase) * 100;
    const high = historySeries.reduce((max, item) => Math.max(max, item.totalValue), latest?.totalValue || 0);
    const low = historySeries.reduce((min, item) => Math.min(min, item.totalValue), latest?.totalValue || 0);
    const monthStart = `${plainDate().slice(0, 7)}-01`;
    const monthBase = [...historySeries].reverse().find((item) => item.date <= monthStart) || historySeries.find((item) => item.date >= monthStart) || first;
    const monthChange = latest && monthBase ? latest.totalValue - monthBase.totalValue : 0;
    return { first, latest, periodChange, periodDeposits, periodWithdrawals, netCashFlow, investmentGain, realReturnRate, high, low, monthChange };
  }, [historySeries, state.cashFlows]);

  const comparisonRows = useMemo(() => {
    const portfolioStart = performanceStats.first?.totalValue || totals.totalValue;
    const portfolioEnd = performanceStats.latest?.totalValue || totals.totalValue;
    const portfolioReturn = portfolioStart ? ((portfolioEnd - portfolioStart - performanceStats.netCashFlow) / Math.max(portfolioStart + performanceStats.periodDeposits, 1)) * 100 : 0;
    const selected = rangeOptions.find((item) => item.key === historyRange) || rangeOptions[1];
    const cutoffDate = historySeries[0]?.date || plainDate();

    return benchmarkDefinitions.map((benchmark) => {
      if (benchmark.code === "portfolio") {
        return {
          ...benchmark,
          firstPrice: portfolioStart,
          latestPrice: portfolioEnd,
          returnRate: portfolioReturn,
          difference: 0,
          points: historySeries.length,
          lastDate: performanceStats.latest?.date || plainDate(),
        };
      }
      const points = state.benchmarkHistory
        .map(normalizeBenchmarkPoint)
        .filter((point) => point.code === benchmark.code && (!selected.days || point.date >= cutoffDate))
        .sort((left, right) => left.date.localeCompare(right.date));
      const first = points[0];
      const latest = points[points.length - 1];
      const returnRate = first?.price && latest?.price ? ((latest.price - first.price) / first.price) * 100 : 0;
      return {
        ...benchmark,
        firstPrice: first?.price || 0,
        latestPrice: latest?.price || 0,
        returnRate,
        difference: portfolioReturn - returnRate,
        points: points.length,
        lastDate: latest?.date || "",
      };
    });
  }, [historyRange, historySeries, performanceStats, state.benchmarkHistory, totals.totalValue]);

  const benchmarkLeader = useMemo(() => {
    return [...comparisonRows].filter((row) => row.latestPrice > 0 || row.code === "portfolio").sort((left, right) => right.returnRate - left.returnRate)[0];
  }, [comparisonRows]);

  const cashFlowSummary = useMemo(() => {
    const flows = state.cashFlows.map(normalizeCashFlow);
    const totalDeposits = flows.filter((flow) => flow.type === "deposit").reduce((sum, flow) => sum + flow.amount, 0);
    const totalWithdrawals = flows.filter((flow) => flow.type === "withdrawal").reduce((sum, flow) => sum + flow.amount, 0);
    const netInvested = totalDeposits - totalWithdrawals;
    const effectivePrincipal = netInvested > 0 ? netInvested : totals.totalCost;
    const investmentProfit = totals.totalValue + totalWithdrawals - totalDeposits;
    const fallbackProfit = totals.totalValue - totals.totalCost;
    const realProfit = flows.length ? investmentProfit : fallbackProfit;
    const realReturnRate = effectivePrincipal ? (realProfit / effectivePrincipal) * 100 : 0;
    return { totalDeposits, totalWithdrawals, netInvested, effectivePrincipal, realProfit, realReturnRate, flowCount: flows.length };
  }, [state.cashFlows, totals.totalCost, totals.totalValue]);

  const chartBounds = useMemo(() => {
    const values = historySeries.flatMap((item) => [item.totalValue, item.totalCost]);
    if (!values.length) return { min: 0, max: 1 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const visibleRange = Math.max(max - min, Math.abs(max) * 0.005, 1);
    const padding = visibleRange * 0.12;
    return { min: Math.max(0, min - padding), max: max + padding };
  }, [historySeries]);

  const dailyCandles = useMemo(() => {
    const width = Math.max(0.7, Math.min(2.4, 54 / Math.max(historySeries.length, 1)));
    return historySeries.map((item, index) => {
      const previous = historySeries[index - 1];
      const open = previous?.totalValue ?? item.totalValue;
      const close = item.totalValue;
      const high = Math.max(open, close);
      const low = Math.min(open, close);
      const x = historySeries.length === 1 ? 50 : 2 + (index / Math.max(historySeries.length - 1, 1)) * 96;
      const openY = chartY(open);
      const closeY = chartY(close);
      const highY = chartY(high);
      const lowY = chartY(low);
      return {
        date: item.date,
        x,
        width,
        open,
        close,
        change: close - open,
        openY,
        closeY,
        highY,
        lowY,
        bodyY: closeY - 1.2,
        bodyHeight: 2.4,
        trend: close >= open ? "positive" : "negative",
      };
    });
  }, [historySeries, chartBounds]);

  const filteredAssets = useMemo(() => {
    return state.assets
      .filter((asset) => {
        const text = `${asset.ticker} ${asset.name}`.toLowerCase();
        const selectedType = typeFilter === "Altin" ? "precious" : typeFilter === "Fon" ? "fund" : typeFilter;
        return text.includes(query.toLowerCase()) && (typeFilter === "all" || assetGroupKey(asset) === selectedType || asset.type === typeFilter);
      })
      .sort((left, right) => {
        const leftGroup = assetGroupIndex(left);
        const rightGroup = assetGroupIndex(right);
        if (leftGroup !== rightGroup) return leftGroup - rightGroup;
        const rightValue = right.quantity * right.price * (right.fxRate || 1);
        const leftValue = left.quantity * left.price * (left.fxRate || 1);
        return rightValue - leftValue;
      });
  }, [state.assets, query, typeFilter]);

  const groupedAssets = useMemo(() => {
    return groupDefinitions
      .map((group) => {
        const assets = filteredAssets
          .filter((asset) => assetGroupKey(asset) === group.key)
          .sort((left, right) => {
            const rightValue = right.quantity * right.price * (right.fxRate || 1);
            const leftValue = left.quantity * left.price * (left.fxRate || 1);
            return rightValue - leftValue;
          });
        const value = assets.reduce((sum, asset) => sum + asset.quantity * asset.price * (asset.fxRate || 1), 0);
        const cost = assets.reduce((sum, asset) => sum + asset.quantity * asset.avgCost * (asset.fxRate || 1), 0);
        const profitLoss = assets.reduce((sum, asset) => {
          const assetValue = asset.quantity * asset.price * (asset.fxRate || 1);
          const assetCost = asset.quantity * asset.avgCost * (asset.fxRate || 1);
          const realized = realizedNetFromSummary(summarizeAssetTransactions(asset, state.transactions));
          return sum + assetValue - assetCost + realized;
        }, 0);
        return { ...group, assets, value, cost, profitLoss };
      })
      .filter((group) => group.assets.length > 0);
  }, [filteredAssets, state.transactions]);

  const duplicateAssetGroups = useMemo(() => {
    const clusters = new Map<string, Asset[]>();
    state.assets.map(normalizeAsset).forEach((asset) => {
      const key = assetMergeKey(asset);
      if (!key) return;
      clusters.set(key, [...(clusters.get(key) || []), asset]);
    });
    return Array.from(clusters.entries())
      .map(([key, assets]) => ({ key, assets }))
      .filter((group) => group.assets.length > 1);
  }, [state.assets]);

  const firstPortfolioDate = useMemo(() => {
    return state.history.map((item) => item.date).filter(Boolean).sort()[0] || plainDate();
  }, [state.history]);

  const missingInitialPositionAssets = useMemo(() => {
    const positionAssetIds = new Set(
      state.transactions
        .map(normalizeTransaction)
        .filter((tx) => isPositionTransaction(tx.type))
        .map((tx) => tx.assetId),
    );
    return state.assets
      .map(normalizeAsset)
      .filter((asset) => asset.type !== "Nakit" && asset.quantity > 0 && asset.avgCost > 0 && !positionAssetIds.has(asset.id));
  }, [state.assets, state.transactions]);

  const targetRows = useMemo(() => {
    const targets = normalizeSettings(state.settings).targetAllocations;
    return groupDefinitions.map((group) => {
      const value = state.assets
        .filter((asset) => assetGroupKey(asset) === group.key)
        .reduce((sum, asset) => sum + asset.quantity * asset.price * (asset.fxRate || 1), 0);
      const currentShare = totals.totalValue ? (value / totals.totalValue) * 100 : 0;
      const targetShare = targets[group.key] || 0;
      const targetValue = (totals.totalValue * targetShare) / 100;
      const gapValue = targetValue - value;
      const gapShare = targetShare - currentShare;
      const status = Math.abs(gapShare) <= 1 ? "balanced" : gapShare > 0 ? "missing" : "over";
      return { ...group, value, currentShare, targetShare, targetValue, gapValue, gapShare, status };
    });
  }, [state.assets, state.settings, totals.totalValue]);

  const targetTotal = targetRows.reduce((sum, row) => sum + row.targetShare, 0);

  const rebalanceSuggestions = useMemo(() => {
    const amount = Math.max(0, Number(state.settings.rebalanceAmount || 0));
    const positiveGaps = targetRows.filter((row) => row.targetShare > 0 && row.gapValue > 0);
    const totalGap = positiveGaps.reduce((sum, row) => sum + row.gapValue, 0);
    if (!amount || !totalGap) return targetRows.map((row) => ({ ...row, suggestedAmount: 0 }));
    return targetRows.map((row) => ({
      ...row,
      suggestedAmount: row.gapValue > 0 ? (amount * row.gapValue) / totalGap : 0,
    }));
  }, [state.settings.rebalanceAmount, targetRows]);

  const assetTargetSuggestions = useMemo(() => {
    const amount = Math.max(0, Number(state.settings.rebalanceAmount || 0));
    if (!amount) return [];
    return rebalanceSuggestions
      .filter((group) => group.suggestedAmount > 0)
      .flatMap((group) => {
        const assets = state.assets
          .filter((asset) => assetGroupKey(asset) === group.key)
          .map((asset) => {
            const value = asset.quantity * asset.price * (asset.fxRate || 1);
            const targetShare = Number(asset.target || 0);
            const targetValue = targetShare > 0 ? ((totals.totalValue + amount) * targetShare) / 100 : 0;
            const gapValue = targetShare > 0 ? targetValue - value : 0;
            return { asset, value, targetShare, targetValue, gapValue };
          });
        if (!assets.length) return [];

        const explicit = assets.filter((row) => row.targetShare > 0 && row.gapValue > 0);
        const pool = explicit.length ? explicit : assets;
        const totalWeight = explicit.length
          ? explicit.reduce((sum, row) => sum + row.gapValue, 0)
          : pool.reduce((sum, row) => sum + Math.max(row.value, 1), 0);

        return pool.map((row) => {
          const weight = explicit.length ? row.gapValue : Math.max(row.value, 1);
          const suggestedAmount = totalWeight ? (group.suggestedAmount * weight) / totalWeight : 0;
          return {
            ...row,
            groupKey: group.key,
            groupLabel: group.label,
            color: groupColors[group.key] || "#647181",
            suggestedAmount,
            reason: explicit.length ? "Varlik hedef payi eksik" : "Sinif hedefi eksik",
          };
        });
      })
      .filter((row) => row.suggestedAmount > 0)
      .sort((left, right) => right.suggestedAmount - left.suggestedAmount);
  }, [rebalanceSuggestions, state.assets, state.settings.rebalanceAmount, totals.totalValue]);

  const rebalanceHealth = useMemo(() => {
    const maxDeviation = targetRows.reduce((max, row) => Math.max(max, Math.abs(row.gapShare)), 0);
    const missingCount = targetRows.filter((row) => row.status === "missing").length;
    const overCount = targetRows.filter((row) => row.status === "over").length;
    const score = Math.max(0, Math.min(100, 100 - maxDeviation * 3.2 - (missingCount + overCount) * 2));
    return { maxDeviation, missingCount, overCount, score };
  }, [targetRows]);

  const portfolioRows = useMemo(() => {
    return state.assets
      .map((asset) => {
        const value = asset.quantity * asset.price * (asset.fxRate || 1);
        const cost = asset.quantity * asset.avgCost * (asset.fxRate || 1);
        const transactionSummary = summarizeAssetTransactions(asset, state.transactions);
        const netRealized = realizedNetFromSummary(transactionSummary);
        const totalProfitLoss = value - cost + netRealized;
        const performanceCost = historicalPerformanceBase(cost, transactionSummary);
        const basePrice = dailyBasePrice(asset);
        const baseValue = basePrice > 0 ? asset.quantity * basePrice * (asset.fxRate || 1) : 0;
        const dailyChange = baseValue ? value - baseValue : 0;
        const code = compactCode(asset.ticker).slice(0, 2) || "PF";
        const groupKey = assetGroupKey(asset);
        return {
          asset,
          value,
          cost,
          profitLoss: totalProfitLoss,
          openProfitLoss: value - cost,
          netRealized,
          performanceCost,
          returnRate: performanceCost ? (totalProfitLoss / performanceCost) * 100 : 0,
          dailyChange,
          dailyRate: baseValue ? (dailyChange / baseValue) * 100 : 0,
          hasDailyChange: baseValue > 0,
          share: totals.totalValue ? (value / totals.totalValue) * 100 : 0,
          initials: code,
          color: groupColors[groupKey] || colors[assetGroupIndex(asset) % colors.length],
        };
      })
      .sort((left, right) => right.value - left.value);
  }, [state.assets, state.transactions, totals.totalValue]);

  const sellableAssets = useMemo(() => {
    return state.assets
      .map(normalizeAsset)
      .filter((asset) => asset.quantity > 0 && asset.type !== "Nakit")
      .sort((left, right) => left.ticker.localeCompare(right.ticker));
  }, [state.assets]);

  const watchRows = useMemo(() => {
    return (state.watchlist || []).map(normalizeWatchItem).map((item) => {
      const asset = watchItemAsAsset(item);
      const currentPrice = Number(item.price || 0);
      const targetPrice = Number(item.targetPrice || 0);
      const gap = targetPrice > 0 && currentPrice > 0 ? currentPrice - targetPrice : 0;
      const gapRate = targetPrice > 0 && currentPrice > 0 ? (gap / targetPrice) * 100 : 0;
      const isBuyZone = targetPrice > 0 && currentPrice > 0 && currentPrice <= targetPrice;
      const missingPrice = currentPrice <= 0 || Boolean(item.lastPriceError);
      const status = missingPrice
        ? { label: "Fiyat bekliyor", tone: "warning" }
        : isBuyZone
          ? { label: "Alim bolgesi", tone: "ok" }
          : { label: "Hedef ustu", tone: "muted" };
      return { item, asset, currentPrice, targetPrice, gap, gapRate, isBuyZone, missingPrice, status };
    }).sort((left, right) => {
      if (left.missingPrice !== right.missingPrice) return Number(left.missingPrice) - Number(right.missingPrice);
      if (left.isBuyZone !== right.isBuyZone) return Number(right.isBuyZone) - Number(left.isBuyZone);
      return Math.abs(left.gapRate) - Math.abs(right.gapRate) || left.item.ticker.localeCompare(right.item.ticker);
    });
  }, [state.watchlist]);

  const watchSummary = useMemo(() => {
    const priced = watchRows.filter((row) => !row.missingPrice);
    const buyZone = priced.filter((row) => row.isBuyZone);
    const closest = priced.slice().sort((left, right) => Math.abs(left.gapRate) - Math.abs(right.gapRate))[0];
    const errors = watchRows.filter((row) => row.item.lastPriceError).length;
    return { total: watchRows.length, buyZone: buyZone.length, errors, closest };
  }, [watchRows]);

  const bestAsset = useMemo(() => {
    return portfolioRows.filter((row) => row.cost > 0).sort((left, right) => right.returnRate - left.returnRate)[0];
  }, [portfolioRows]);

  const worstAsset = useMemo(() => {
    return portfolioRows.filter((row) => row.cost > 0).sort((left, right) => left.returnRate - right.returnRate)[0];
  }, [portfolioRows]);

  const allTimeGainers = useMemo(() => {
    return portfolioRows.filter((row) => row.profitLoss > 0).sort((left, right) => right.profitLoss - left.profitLoss).slice(0, 3);
  }, [portfolioRows]);

  const allTimeLosers = useMemo(() => {
    return portfolioRows.filter((row) => row.profitLoss < 0).sort((left, right) => left.profitLoss - right.profitLoss).slice(0, 3);
  }, [portfolioRows]);

  const dailyGainers = useMemo(() => {
    return portfolioRows.filter((row) => row.hasDailyChange && row.dailyChange > 0).sort((left, right) => right.dailyChange - left.dailyChange).slice(0, 3);
  }, [portfolioRows]);

  const dailyLosers = useMemo(() => {
    return portfolioRows.filter((row) => row.hasDailyChange && row.dailyChange < 0).sort((left, right) => left.dailyChange - right.dailyChange).slice(0, 3);
  }, [portfolioRows]);

  const fundAssets = useMemo(() => {
    return portfolioRows
      .filter((row) => assetGroupKey(row.asset) === "fund")
      .sort((left, right) => right.value - left.value);
  }, [portfolioRows]);

  const fundLookthrough = useMemo(() => {
    const settings = normalizeSettings(state.settings);
    const fundTotals: Record<string, { knownWeight: number; missingWeight: number; overWeight: number }> = {};
    const holdingRows = fundAssets.flatMap((fundRow) => {
      const fundCode = compactCode(fundRow.asset.ticker || fundRow.asset.priceSymbol);
      const holdings = settings.fundHoldings[fundCode] || [];
      const knownWeight = holdings.reduce((sum, holding) => sum + Number(holding.weight || 0), 0);
      const missingWeight = Math.max(0, 100 - knownWeight);
      const overWeight = Math.max(0, knownWeight - 100);
      fundTotals[fundCode] = { knownWeight, missingWeight, overWeight };
      const completeHoldings = missingWeight > 0.05
        ? [
            ...holdings,
            normalizeFundHolding(fundCode, {
              id: `${fundCode}-DIGER`,
              fundCode,
              symbol: `DIGER${fundCode}`,
              name: "Diger / aciklanmayan kisim",
              weight: missingWeight,
              sector: "Diger",
              country: "Belirtilmedi",
              source: holdings[0]?.source || "Tamamlayici hesap",
              asOf: holdings[0]?.asOf,
            }),
          ]
        : holdings;
      return completeHoldings.map((holding) => {
        const indirectValue = (fundRow.value * holding.weight) / 100;
        return {
          ...holding,
          fundAsset: fundRow.asset,
          fundValue: fundRow.value,
          indirectValue,
          portfolioShare: totals.totalValue ? (indirectValue / totals.totalValue) * 100 : 0,
        };
      });
    });

    const bySymbol = new Map<string, {
      symbol: string;
      name: string;
      sector: string;
      country: string;
      indirectValue: number;
      portfolioShare: number;
      funds: string[];
    }>();
    holdingRows.forEach((row) => {
      const current = bySymbol.get(row.symbol) || {
        symbol: row.symbol,
        name: row.name,
        sector: row.sector,
        country: row.country,
        indirectValue: 0,
        portfolioShare: 0,
        funds: [],
      };
      current.indirectValue += row.indirectValue;
      current.portfolioShare += row.portfolioShare;
      if (!current.funds.includes(row.fundCode)) current.funds.push(row.fundCode);
      bySymbol.set(row.symbol, current);
    });

    const sectorMap = new Map<string, number>();
    const countryMap = new Map<string, number>();
    holdingRows.forEach((row) => {
      sectorMap.set(row.sector, (sectorMap.get(row.sector) || 0) + row.indirectValue);
      countryMap.set(row.country, (countryMap.get(row.country) || 0) + row.indirectValue);
    });

    const pairs: Array<{ left: string; right: string; overlap: number; commonCount: number; commonSymbols: string[] }> = [];
    fundAssets.forEach((leftFund, leftIndex) => {
      const leftCode = compactCode(leftFund.asset.ticker || leftFund.asset.priceSymbol);
      const leftHoldings = settings.fundHoldings[leftCode] || [];
      const leftMap = new Map(leftHoldings.map((holding) => [holding.symbol, holding.weight]));
      fundAssets.slice(leftIndex + 1).forEach((rightFund) => {
        const rightCode = compactCode(rightFund.asset.ticker || rightFund.asset.priceSymbol);
        const rightHoldings = settings.fundHoldings[rightCode] || [];
        let overlap = 0;
        const commonSymbols: string[] = [];
        rightHoldings.forEach((holding) => {
          const leftWeight = leftMap.get(holding.symbol);
          if (leftWeight !== undefined) {
            overlap += Math.min(leftWeight, holding.weight);
            commonSymbols.push(holding.symbol);
          }
        });
        if (commonSymbols.length) pairs.push({ left: leftCode, right: rightCode, overlap, commonCount: commonSymbols.length, commonSymbols });
      });
    });

    const fundsWithData = fundAssets.filter((row) => (settings.fundHoldings[compactCode(row.asset.ticker || row.asset.priceSymbol)] || []).length > 0).length;
    const topOverlap = pairs.sort((left, right) => right.overlap - left.overlap)[0];
    const indirectRows = Array.from(bySymbol.values()).sort((left, right) => right.indirectValue - left.indirectValue);

    return {
      settings,
      holdingRows,
      indirectRows,
      pairs,
      topOverlap,
      fundsWithData,
      fundTotals,
      coverage: fundAssets.length ? (fundsWithData / fundAssets.length) * 100 : 0,
      sectors: Array.from(sectorMap.entries()).map(([label, value]) => ({ label, value, share: totals.totalValue ? (value / totals.totalValue) * 100 : 0 })).sort((left, right) => right.value - left.value),
      countries: Array.from(countryMap.entries()).map(([label, value]) => ({ label, value, share: totals.totalValue ? (value / totals.totalValue) * 100 : 0 })).sort((left, right) => right.value - left.value),
    };
  }, [fundAssets, state.settings, totals.totalValue]);

  const reportFundCards = useMemo(() => {
    return fundAssets.map((fundRow) => {
      const code = compactCode(fundRow.asset.ticker || fundRow.asset.priceSymbol);
      const rows = (fundLookthrough.settings.fundHoldings[code] || [])
        .map((holding) => normalizeFundHolding(code, holding))
        .sort((left, right) => right.weight - left.weight);
      const totalsInfo = fundLookthrough.fundTotals[code] || { knownWeight: 0, missingWeight: 100, overWeight: 0 };
      const sectorMap = new Map<string, number>();
      const countryMap = new Map<string, number>();
      rows.forEach((holding) => {
        sectorMap.set(holding.sector || "Diger", (sectorMap.get(holding.sector || "Diger") || 0) + Number(holding.weight || 0));
        countryMap.set(holding.country || "Belirtilmedi", (countryMap.get(holding.country || "Belirtilmedi") || 0) + Number(holding.weight || 0));
      });
      return {
        fundRow,
        code,
        rows,
        totalsInfo,
        source: rows[0]?.source || "Veri yok",
        asOf: rows[0]?.asOf || "",
        sectorRows: Array.from(sectorMap.entries()).map(([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value).slice(0, 6),
        countryRows: Array.from(countryMap.entries()).map(([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value).slice(0, 5),
      };
    });
  }, [fundAssets, fundLookthrough]);

  const selectedAssetDetail = useMemo(() => {
    const asset = state.assets.find((item) => item.id === selectedAssetId);
    if (!asset) return null;
    const value = asset.quantity * asset.price * (asset.fxRate || 1);
    const cost = asset.quantity * asset.avgCost * (asset.fxRate || 1);
    const groupKey = assetGroupKey(asset);
    const group = groupDefinitions.find((item) => item.key === groupKey) || groupDefinitions[groupDefinitions.length - 1];
    const groupValue = state.assets
      .filter((item) => assetGroupKey(item) === groupKey)
      .reduce((sum, item) => sum + item.quantity * item.price * (item.fxRate || 1), 0);
    const portfolioShare = totals.totalValue ? (value / totals.totalValue) * 100 : 0;
    const categoryShare = groupValue ? (value / groupValue) * 100 : 0;
    const targetGap = (asset.target || 0) - portfolioShare;
    const rank = portfolioRows.findIndex((row) => row.asset.id === asset.id) + 1;
    const lastPriceDate = asset.lastPriceAt ? new Date(asset.lastPriceAt) : null;
    const priceAgeHours = lastPriceDate ? (Date.now() - lastPriceDate.getTime()) / 3600000 : null;
    const priceStatus = asset.lastPriceError
      ? "Hata"
      : priceAgeHours === null
        ? "Kayit yok"
        : priceAgeHours > 24
          ? "Eski"
          : "Guncel";
    const chronologicalTransactions = sortTransactionsChronologically(state.transactions
      .map(normalizeTransaction)
      .filter((tx) => tx.assetId === asset.id));
    const transactions = chronologicalTransactions.slice().reverse();
    const transactionSummary = summarizeAssetTransactions(asset, state.transactions);
    const netRealized = realizedNetFromSummary(transactionSummary);
    const openProfitLoss = value - cost;
    const profitLoss = openProfitLoss + netRealized;
    const returnBase = historicalPerformanceBase(cost, transactionSummary);
    const returnRate = returnBase ? (profitLoss / returnBase) * 100 : 0;
    const buyTransactions = chronologicalTransactions.filter((tx) => tx.type === "buy");
    const sellTransactions = chronologicalTransactions.filter((tx) => tx.type === "sell");
    const totalBoughtQuantity = buyTransactions.reduce((sum, tx) => sum + Number(tx.quantity || 0), 0);
    const totalSoldQuantity = sellTransactions.reduce((sum, tx) => sum + Number(tx.quantity || 0), 0);
    const totalBuyAmount = buyTransactions.reduce((sum, tx) => sum + transactionCashAmount(tx) + Number(tx.fee || 0), 0);
    const totalSellAmount = sellTransactions.reduce((sum, tx) => sum + transactionCashAmount(tx) - Number(tx.fee || 0), 0);
    const avgSellPrice = totalSoldQuantity ? totalSellAmount / totalSoldQuantity : 0;
    const firstBuyDate = buyTransactions[0]?.date || asset.createdAt || "";
    const principalRecovered = totalSellAmount + transactionSummary.income - transactionSummary.expense;
    const principalGap = Math.max(0, totalBuyAmount - principalRecovered);
    const principalStatus = totalBuyAmount > 0 && principalRecovered >= totalBuyAmount ? "Cikti" : totalBuyAmount > 0 ? "Cikmadi" : "Kayit yok";
    const storyRows = chronologicalTransactions.map((tx, index) => {
      const amount = transactionCashAmount(tx);
      const label = transactionTypeLabel(tx.type);
      const isIncome = tx.type === "dividend" || tx.type === "distribution";
      const isExpense = tx.type === "fee" || tx.type === "tax";
      const realized = tx.type === "sell"
        ? Number(tx.realizedProfit || 0)
        : isIncome
          ? amount
          : isExpense
            ? -Math.abs(amount + Number(tx.fee || 0))
            : 0;
      const realizedRate = tx.type === "sell" && tx.costBasis ? (realized / tx.costBasis) * 100 : 0;
      const tone = tx.type === "buy" ? "buy" : tx.type === "sell" ? (realized >= 0 ? "positive" : "negative") : isIncome ? "positive" : isExpense ? "negative" : "neutral";
      const title = tx.type === "buy"
        ? `${num(tx.quantity)} adet alis`
        : tx.type === "sell"
          ? `${num(tx.quantity)} adet satis`
          : isIncome
            ? `${label} geliri`
            : isExpense
              ? `${label} gideri`
              : label;
      const resultLabel = tx.type === "buy"
        ? "Yeni ortalama"
        : tx.type === "sell"
          ? "Gerceklesen sonuc"
          : isIncome
            ? "Gelir"
            : isExpense
              ? "Gider"
              : "Kayit";
      const resultText = tx.type === "buy"
        ? money(tx.resultingAvgCost || tx.price || 0, asset.currency)
        : tx.type === "sell"
          ? `${signedMoney(realized)}${realizedRate ? ` · ${signedPct(realizedRate)}` : ""}`
          : isIncome || isExpense
            ? signedMoney(realized)
            : money(amount);
      return {
        tx,
        index: index + 1,
        label,
        title,
        tone,
        amount,
        resultLabel,
        resultText,
        realized,
        remaining: isPositionTransaction(tx.type) ? Number(tx.resultingQuantity || 0) : null,
      };
    });
    const notes = [
      rank > 0 && rank <= 3 ? "Bu varlik portfoyun en buyuk 3 pozisyonundan biri." : "",
      asset.target ? (targetGap >= 0 ? "Hedef payinin altinda; yeni yatirimlarda desteklenebilir." : "Hedef payinin uzerinde; agirligi izlenebilir.") : "Bu varlik icin hedef pay belirlenmemis.",
      profitLoss >= 0 ? "Pozisyon karda gorunuyor." : "Pozisyon zararda gorunuyor.",
      transactions.length ? `${transactions.length} islem kaydi tutuluyor; gerceklesmis sonuc ayrica izleniyor.` : "Bu varlik icin henuz islem gecmisi yok.",
      priceStatus === "Guncel" ? "Fiyat verisi guncel." : priceStatus === "Eski" ? "Fiyat verisi 24 saatten eski olabilir." : priceStatus === "Hata" ? "Fiyat kaynaginda hata kaydi var." : "Fiyat guncelleme kaydi yok.",
    ].filter(Boolean);
    return {
      asset,
      value,
      cost,
      profitLoss,
      openProfitLoss,
      returnRate,
      group,
      groupValue,
      portfolioShare,
      categoryShare,
      targetGap,
      rank,
      priceStatus,
      notes,
      transactions,
      storyRows,
      transactionSummary,
      netRealized,
      storyMetrics: {
        firstBuyDate,
        totalBoughtQuantity,
        totalSoldQuantity,
        avgSellPrice,
        totalBuyAmount,
        totalSellAmount,
        principalRecovered,
        principalGap,
        principalStatus,
      },
    };
  }, [portfolioRows, selectedAssetId, state.assets, state.transactions, totals.totalValue]);

  const sellStrategy = useMemo(() => {
    if (!selectedAssetDetail) return null;
    const asset = selectedAssetDetail.asset;
    const price = parseAmount(sellStrategyDraft.price) || Number(asset.price || asset.avgCost || 0);
    const availableQuantity = Number(asset.quantity || 0);
    const avgCost = Number(asset.avgCost || 0);
    const perUnitProfit = price - avgCost;
    const buildScenario = (label: string, quantity: number, note: string) => {
      const safeQuantity = Math.max(0, Math.min(availableQuantity, quantity || 0));
      const amount = safeQuantity * price;
      const costBasis = safeQuantity * avgCost;
      const realized = amount - costBasis;
      const remainingQuantity = Math.max(0, availableQuantity - safeQuantity);
      const remainingCost = remainingQuantity * avgCost;
      const remainingValue = remainingQuantity * price;
      return {
        label,
        note,
        quantity: safeQuantity,
        amount,
        realized,
        remainingQuantity,
        remainingCost,
        remainingValue,
        rate: costBasis ? (realized / costBasis) * 100 : 0,
      };
    };
    const principalQuantity = price > 0 ? selectedAssetDetail.cost / price : 0;
    const halfProfitQuantity = perUnitProfit > 0 ? (selectedAssetDetail.openProfitLoss / 2) / perUnitProfit : 0;
    const customAmount = parseAmount(sellStrategyDraft.amount);
    const customQuantity = parseAmount(sellStrategyDraft.quantity) || (customAmount && price ? customAmount / price : 0);
    return {
      price,
      scenarios: [
        buildScenario("Ana para kadar sat", principalQuantity, "Pozisyon maliyetine yakin tutari nakde cevirir."),
        buildScenario("Karin yarisini al", halfProfitQuantity, "Acik karin yaklasik yarisini realize eder."),
        buildScenario("Ozel deneme", customQuantity, "Girdigin adet veya tutara gore hesaplanir."),
      ],
    };
  }, [selectedAssetDetail, sellStrategyDraft]);

  const dataStatusRows = useMemo(() => {
    return state.assets.map((asset) => {
      const lastDate = asset.lastPriceAt ? new Date(asset.lastPriceAt) : null;
      const ageHours = lastDate && !Number.isNaN(lastDate.getTime()) ? (Date.now() - lastDate.getTime()) / 3600000 : null;
      let key = "fresh";
      let label = "Guncel";
      let tone = "ok";
      if (!asset.autoUpdate) {
        key = "disabled";
        label = "Kapali";
        tone = "muted";
      } else if (asset.priceSource === "manual") {
        key = "manual";
        label = "Manuel";
        tone = "manual";
      } else if (asset.lastPriceError) {
        key = "error";
        label = "Hata";
        tone = "error";
      } else if (ageHours === null) {
        key = "missing";
        label = "Kayit yok";
        tone = "warning";
      } else if (ageHours > 24) {
        key = "stale";
        label = "Eski";
        tone = "warning";
      }
      return {
        asset,
        key,
        label,
        tone,
        ageHours,
        lastLabel: asset.lastPriceAt ? formatAge(asset.lastPriceAt) : "-",
        sourceLabel: `${asset.priceSource || "manual"}${asset.priceSymbol ? ` / ${asset.priceSymbol}` : ""}`,
      };
    }).sort((left, right) => {
      const rank: Record<string, number> = { error: 0, stale: 1, missing: 2, manual: 3, disabled: 4, fresh: 5 };
      return (rank[left.key] ?? 9) - (rank[right.key] ?? 9) || left.asset.ticker.localeCompare(right.asset.ticker);
    });
  }, [state.assets]);

  const dataStatusSummary = useMemo(() => {
    const counts = dataStatusRows.reduce<Record<string, number>>((result, row) => {
      result[row.key] = (result[row.key] || 0) + 1;
      return result;
    }, {});
    const scoreWeights: Record<string, number> = { fresh: 100, manual: 75, disabled: 45, stale: 55, missing: 40, error: 0 };
    const score = dataStatusRows.length
      ? dataStatusRows.reduce((sum, row) => sum + (scoreWeights[row.key] ?? 50), 0) / dataStatusRows.length
      : 100;
    const sourceMap = new Map<string, { source: string; total: number; fresh: number; error: number; stale: number; manual: number; disabled: number }>();
    dataStatusRows.forEach((row) => {
      const source = row.asset.priceSource || "manual";
      const current = sourceMap.get(source) || { source, total: 0, fresh: 0, error: 0, stale: 0, manual: 0, disabled: 0 };
      current.total += 1;
      if (row.key === "fresh") current.fresh += 1;
      if (row.key === "error") current.error += 1;
      if (row.key === "stale" || row.key === "missing") current.stale += 1;
      if (row.key === "manual") current.manual += 1;
      if (row.key === "disabled") current.disabled += 1;
      sourceMap.set(source, current);
    });
    return {
      score,
      fresh: counts.fresh || 0,
      stale: (counts.stale || 0) + (counts.missing || 0),
      error: counts.error || 0,
      manual: counts.manual || 0,
      disabled: counts.disabled || 0,
      sources: Array.from(sourceMap.values()).sort((left, right) => right.error - left.error || right.stale - left.stale || right.total - left.total),
    };
  }, [dataStatusRows]);

  const alertRows = useMemo(() => {
    const rows: Array<{ id: string; level: "high" | "medium" | "low"; category: string; title: string; detail: string; action: string }> = [];
    const dismissed = new Set(normalizeSettings(state.settings).dismissedAlertIds);
    dataStatusRows.forEach((row) => {
      if (row.key === "error") {
        rows.push({
          id: `price-error-${row.asset.id}`,
          level: "high",
          category: "Fiyat verisi",
          title: `${row.asset.ticker} fiyat kaynagi hata veriyor`,
          detail: row.asset.lastPriceError || "Fiyat kaynagi okunamadi.",
          action: "Veri Durumu ekranindan tek varligi yenilemeyi dene.",
        });
      }
      if (row.key === "stale" || row.key === "missing") {
        rows.push({
          id: `price-stale-${row.asset.id}`,
          level: "medium",
          category: "Fiyat verisi",
          title: `${row.asset.ticker} fiyati eski veya kayitsiz`,
          detail: row.asset.lastPriceAt ? `Son guncelleme ${row.lastLabel}.` : "Bu varlik icin basarili fiyat kaydi yok.",
          action: "Fiyatlari guncelle veya kaynak sembolunu kontrol et.",
        });
      }
    });
    portfolioRows.forEach((row) => {
      if (row.cost > 0 && row.returnRate <= -10) {
        rows.push({
          id: `loss-high-${row.asset.id}`,
          level: "high",
          category: "Performans",
          title: `${row.asset.ticker} zarari %10 seviyesini asti`,
          detail: `${signedPct(row.returnRate)} · ${signedMoney(row.profitLoss)}`,
          action: "Varlik detayindan maliyet, not ve islem gecmisini kontrol et.",
        });
      } else if (row.cost > 0 && row.returnRate <= -5) {
        rows.push({
          id: `loss-medium-${row.asset.id}`,
          level: "medium",
          category: "Performans",
          title: `${row.asset.ticker} belirgin zararda`,
          detail: `${signedPct(row.returnRate)} · ${signedMoney(row.profitLoss)}`,
          action: "Pozisyonu izleme listesinde tut.",
        });
      }
      if (row.share >= 20) {
        rows.push({
          id: `concentration-${row.asset.id}`,
          level: row.share >= 30 ? "high" : "medium",
          category: "Yogunlasma",
          title: `${row.asset.ticker} portfoyde yuksek agirlikta`,
          detail: `Portfoy payi ${pct(row.share)}.`,
          action: "Hedef Portfoy ekraninda sinif ve varlik agirligini karsilastir.",
        });
      }
    });
    targetRows.forEach((row) => {
      const absGap = Math.abs(row.gapShare);
      if (row.targetShare > 0 && absGap >= 8) {
        rows.push({
          id: `target-gap-${row.key}`,
          level: absGap >= 14 ? "high" : "medium",
          category: "Hedef dagilim",
          title: `${row.label} hedef dagilimdan uzaklasti`,
          detail: `Mevcut ${pct(row.currentShare)}, hedef ${pct(row.targetShare)}, fark ${signedPct(row.gapShare)}.`,
          action: "Yeni yatirim dagitim onerisine bak.",
        });
      }
    });
    if (dataStatusSummary.error === 0 && dataStatusSummary.stale === 0 && rows.length === 0) {
      rows.push({
        id: "healthy-portfolio",
        level: "low",
        category: "Genel durum",
        title: "Aktif kritik uyari yok",
        detail: "Fiyat verileri ve portfoy dengesi su an sakin gorunuyor.",
        action: "Periyodik olarak fiyatlari guncellemeye devam et.",
      });
    }
    const rank = { high: 0, medium: 1, low: 2 };
    return rows
      .map((row) => ({ ...row, dismissed: dismissed.has(row.id) }))
      .sort((left, right) => rank[left.level] - rank[right.level] || Number(left.dismissed) - Number(right.dismissed) || left.title.localeCompare(right.title));
  }, [dataStatusRows, dataStatusSummary.error, dataStatusSummary.stale, portfolioRows, state.settings, targetRows]);

  const activeAlerts = useMemo(() => alertRows.filter((alert) => !alert.dismissed), [alertRows]);
  const alertSummary = useMemo(() => ({
    high: activeAlerts.filter((alert) => alert.level === "high").length,
    medium: activeAlerts.filter((alert) => alert.level === "medium").length,
    low: activeAlerts.filter((alert) => alert.level === "low").length,
    dismissed: alertRows.filter((alert) => alert.dismissed).length,
  }), [activeAlerts, alertRows]);

  const classGradient = useMemo(() => {
    let cursor = 0;
    const segments = groupedAssets.map((group) => {
      const share = totals.totalValue ? (group.value / totals.totalValue) * 100 : 0;
      const start = cursor;
      cursor += share;
      return `${groupColors[group.key] || "#647181"} ${start}% ${cursor}%`;
    });
    return segments.length ? `linear-gradient(90deg, ${segments.join(", ")})` : "#edf1f5";
  }, [groupedAssets, totals.totalValue]);

  const donutGradient = useMemo(() => {
    let cursor = 0;
    const segments = groupedAssets.map((group) => {
      const share = totals.totalValue ? (group.value / totals.totalValue) * 100 : 0;
      const start = cursor;
      cursor += share;
      return `${groupColors[group.key] || "#647181"} ${start}% ${cursor}%`;
    });
    return segments.length ? `conic-gradient(${segments.join(", ")})` : "#edf1f5";
  }, [groupedAssets, totals.totalValue]);

  const projections = useMemo(() => {
    const annualContribution = 360000;
    const annualReturn = 0.16;
    const years = [1, 2, 3, 4, 5, 6, 10];
    return years.map((year) => {
      const growth = Math.pow(1 + annualReturn, year);
      const contributionGrowth = annualContribution * ((growth - 1) / annualReturn);
      return { year, value: totals.totalValue * growth + contributionGrowth };
    });
  }, [totals.totalValue]);

  const maxProjection = Math.max(...projections.map((item) => item.value), 1);
  const activeMenu = menuItems.find((item) => item.key === activeTab) || menuItems[0];
  const topShare = portfolioRows[0]?.share || 0;
  const activeGroupCount = groupedAssets.length;
  const top3Share = portfolioRows.slice(0, 3).reduce((sum, row) => sum + row.share, 0);
  const top5Share = portfolioRows.slice(0, 5).reduce((sum, row) => sum + row.share, 0);
  const biggestGroup = groupedAssets
    .map((group) => ({ ...group, share: totals.totalValue ? (group.value / totals.totalValue) * 100 : 0 }))
    .sort((left, right) => right.share - left.share)[0];
  const cryptoShare = groupedAssets.find((group) => group.key === "Kripto")?.value || 0;
  const cashShare = totals.totalValue ? (totals.cash / totals.totalValue) * 100 : 0;
  const cryptoSharePct = totals.totalValue ? (cryptoShare / totals.totalValue) * 100 : 0;
  const maxTargetDeviation = targetRows.reduce((max, row) => Math.max(max, Math.abs(row.gapShare)), 0);
  const hhiScore = portfolioRows.reduce((sum, row) => sum + row.share * row.share, 0);
  const concentrationRisk = Math.min(100, topShare * 1.25 + Math.max(0, top3Share - 45) * 0.7 + Math.max(0, (biggestGroup?.share || 0) - 45) * 0.6);
  const cryptoRisk = Math.min(20, cryptoSharePct * 0.8);
  const targetRisk = Math.min(20, maxTargetDeviation * 0.9);
  const cashRisk = cashShare < 3 ? 7 : cashShare > 20 ? 5 : 0;
  const measuredRiskScore = Math.max(0, Math.min(100, concentrationRisk + cryptoRisk + targetRisk + cashRisk));
  const diversificationScore = Math.max(0, Math.min(100, 100 - Math.min(70, hhiScore / 18) - Math.max(0, top5Share - 70) * 0.7 + Math.min(12, activeGroupCount * 2)));
  const riskScore = Math.max(1, Math.min(10, measuredRiskScore / 10));
  const diversityScore = Math.max(1, Math.min(10, diversificationScore / 10));
  const riskLevel = measuredRiskScore >= 70 ? "Yuksek" : measuredRiskScore >= 45 ? "Orta" : "Dusuk";
  const riskDriver = topShare >= 25
    ? `En buyuk risk ${portfolioRows[0]?.asset.ticker || "-"} agirliginin ${pct(topShare)} seviyesinde olmasi.`
    : top3Share >= 50
      ? `Ilk 3 varlik portfoyun ${pct(top3Share)} kadarini olusturuyor.`
      : maxTargetDeviation >= 8
        ? `Hedef portfoyden en buyuk sapma ${pct(maxTargetDeviation)} seviyesinde.`
        : "Portfoy yogunlasmasi su an kabul edilebilir seviyede gorunuyor.";
  const riskMetrics = [
    { label: "En buyuk varlik", value: portfolioRows[0]?.asset.ticker || "-", detail: pct(topShare), tone: topShare >= 25 ? "red" : topShare >= 15 ? "gold" : "green" },
    { label: "Ilk 3 agirlik", value: pct(top3Share), detail: "Toplam pay", tone: top3Share >= 55 ? "red" : top3Share >= 40 ? "gold" : "green" },
    { label: "Ilk 5 agirlik", value: pct(top5Share), detail: "Toplam pay", tone: top5Share >= 75 ? "red" : top5Share >= 60 ? "gold" : "green" },
    { label: "Sinif yogunlugu", value: biggestGroup?.label || "-", detail: pct(biggestGroup?.share || 0), tone: (biggestGroup?.share || 0) >= 45 ? "red" : (biggestGroup?.share || 0) >= 35 ? "gold" : "green" },
    { label: "Kripto agirligi", value: pct(cryptoSharePct), detail: "Riskli varlik payi", tone: cryptoSharePct >= 20 ? "red" : cryptoSharePct >= 10 ? "gold" : "green" },
    { label: "Nakit orani", value: pct(cashShare), detail: "Tampon pay", tone: cashShare < 3 ? "red" : cashShare <= 15 ? "green" : "gold" },
    { label: "Hedef sapmasi", value: pct(maxTargetDeviation), detail: "En buyuk fark", tone: maxTargetDeviation >= 12 ? "red" : maxTargetDeviation >= 6 ? "gold" : "green" },
    { label: "HHI yogunlasma", value: hhiScore.toLocaleString("tr-TR", { maximumFractionDigits: 0 }), detail: "Dusuk daha iyi", tone: hhiScore >= 1800 ? "red" : hhiScore >= 900 ? "gold" : "green" },
  ];
  const reportPerformanceGroups = [
    { title: "Tum zamanlar en cok kazandiran", rows: allTimeGainers, metric: "profitLoss", tone: "positive" },
    { title: "Tum zamanlar en cok kaybettiren", rows: allTimeLosers, metric: "profitLoss", tone: "negative" },
    { title: "Gunun en cok kazandiran", rows: dailyGainers, metric: "dailyChange", tone: "positive" },
    { title: "Gunun en cok kaybettiren", rows: dailyLosers, metric: "dailyChange", tone: "negative" },
  ] as const;
  const reportTransactionRows = useMemo(() => {
    const assetsById = new Map(state.assets.map((asset) => [asset.id, asset]));
    const assetsByCode = new Map<string, Asset>();
    state.assets.forEach((asset) => {
      [asset.ticker, asset.priceSymbol, asset.name].map(compactCode).filter(Boolean).forEach((code) => assetsByCode.set(code, asset));
    });
    return state.transactions
      .map(normalizeTransaction)
      .filter((tx) => ["buy", "sell", "dividend", "distribution", "fee", "tax"].includes(tx.type))
      .map((tx) => {
        const asset = assetsById.get(tx.assetId)
          || assetsByCode.get(compactCode(tx.assetTicker || tx.assetSymbol || tx.assetName || ""))
          || (isPositionTransaction(tx.type) && tx.price
            ? state.assets
              .map((item) => ({ asset: item, diff: Math.abs(Number(item.price || 0) - tx.price) }))
              .filter((item) => item.asset.price > 0 && item.diff <= Math.max(0.05, tx.price * 0.0025))
              .sort((left, right) => left.diff - right.diff)[0]?.asset
            : undefined);
        const amount = tx.amount || tx.quantity * tx.price || tx.price;
        const saleCostBasis = tx.type === "sell"
          ? Number(tx.costBasis || tx.quantity * (tx.resultingAvgCost || asset?.avgCost || 0) || 0)
          : 0;
        const realized = tx.type === "sell"
          ? (Number.isFinite(Number(tx.realizedProfit)) && tx.realizedProfit !== 0
            ? Number(tx.realizedProfit)
            : amount - saleCostBasis - (tx.fee || 0))
          : tx.type === "dividend" || tx.type === "distribution"
            ? amount
            : -Math.abs(amount + (tx.fee || 0));
        const rateBase = tx.type === "sell" ? saleCostBasis : 0;
        const rate = rateBase ? (realized / rateBase) * 100 : 0;
        const typeLabel = tx.type === "buy" ? "Alis" : tx.type === "sell" ? "Satis" : tx.type === "dividend" ? "Temettu" : tx.type === "distribution" ? "Fon dagitimi" : tx.type === "fee" ? "Komisyon" : "Vergi";
        return {
          tx,
          asset,
          typeLabel,
          amount,
          realized,
          rate,
          remaining: isPositionTransaction(tx.type) ? (tx.resultingQuantity || asset?.quantity || 0) : 0,
          avgCostAfter: isPositionTransaction(tx.type) ? (tx.resultingAvgCost || asset?.avgCost || 0) : 0,
          status: realized >= 0 ? "positive" : "negative",
        };
      })
      .sort((left, right) => {
        const byDate = right.tx.date.localeCompare(left.tx.date);
        return byDate || transactionSortRank(left.tx) - transactionSortRank(right.tx);
      })
      .slice(0, 28);
  }, [state.assets, state.transactions]);

  async function login(code = draftPasscode) {
    setAuthError("");
    setLoading(true);
    try {
      const endpoint = needsSetup ? "/api/auth/setup" : "/api/auth/login";
      await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ passcode: code }),
      }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Giris yapilamadi");
      });
      sessionStorage.setItem("portfolio-passcode", code);
      setPasscode(code);
      setNeedsSetup(false);
      await loadPortfolio(code);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Giris yapilamadi");
    } finally {
      setLoading(false);
    }
  }

  async function loadPortfolio(code = passcode) {
    const data = await api<{ state: PortfolioState }>("/api/portfolio", code);
    const loadedState = repairPortfolioState({
      assets: (data.state.assets || []).map(normalizeAsset),
      watchlist: (data.state.watchlist || []).map(normalizeWatchItem),
      transactions: (data.state.transactions || []).map(normalizeTransaction),
      history: (data.state.history || []).map(normalizeSnapshot),
      cashFlows: (data.state.cashFlows || []).map(normalizeCashFlow),
      benchmarkHistory: (data.state.benchmarkHistory || []).map(normalizeBenchmarkPoint),
      settings: normalizeSettings(data.state.settings),
    });
    setState(loadedState);
    setLastSync(new Date().toISOString());
  }

  function withTodaySnapshot(nextState: PortfolioState) {
    const calculated = totalsFromAssets(nextState.assets);
    const realized = nextState.assets.reduce((sum, asset) => sum + realizedNetFromSummary(summarizeAssetTransactions(asset, nextState.transactions || [])), 0);
    if (!nextState.assets.length) {
      return {
        ...nextState,
        history: nextState.history || [],
        watchlist: (nextState.watchlist || []).map(normalizeWatchItem),
        cashFlows: nextState.cashFlows || [],
        benchmarkHistory: (nextState.benchmarkHistory || []).map(normalizeBenchmarkPoint),
        settings: normalizeSettings(nextState.settings),
      };
    }
    const today = plainDate();
    const snapshot = normalizeSnapshot({
      id: `snapshot-${today}`,
      date: today,
      totalValue: calculated.totalValue,
      totalCost: calculated.totalCost,
      cash: calculated.cash,
      profitLoss: calculated.profitLoss + realized,
      assetCount: nextState.assets.length,
    });
    const history = [...(nextState.history || []).map(normalizeSnapshot).filter((item) => item.date !== today), snapshot]
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(-730);
    return {
      ...nextState,
      history,
      watchlist: (nextState.watchlist || []).map(normalizeWatchItem),
      cashFlows: (nextState.cashFlows || []).map(normalizeCashFlow),
      benchmarkHistory: (nextState.benchmarkHistory || []).map(normalizeBenchmarkPoint),
      settings: normalizeSettings(nextState.settings),
    };
  }

  function withLatestFundHoldings(nextState: PortfolioState) {
    const latestSettings = normalizeSettings(stateRef.current.settings);
    const nextSettings = normalizeSettings(nextState.settings);
    const fundHoldings = { ...nextSettings.fundHoldings };
    Object.entries(latestSettings.fundHoldings).forEach(([code, latestRows]) => {
      const nextRows = fundHoldings[code] || [];
      if (latestRows.length > nextRows.length) fundHoldings[code] = latestRows;
    });
    return { ...nextState, settings: { ...nextSettings, fundHoldings } };
  }

  async function savePortfolio(nextState: PortfolioState, options: { snapshot?: boolean; preserveFundHoldings?: boolean } = {}) {
    const shouldSnapshot = options.snapshot !== false;
    const protectedState = options.preserveFundHoldings ? withLatestFundHoldings(nextState) : nextState;
    const repairedState = repairPortfolioState(protectedState);
    const finalState = shouldSnapshot ? withTodaySnapshot(repairedState) : repairedState;
    setState(finalState);
    setSaving(true);
    try {
      await api("/api/portfolio", passcode, {
        method: "PUT",
        body: JSON.stringify({ state: finalState }),
      });
      setLastSync(new Date().toISOString());
    } finally {
      setSaving(false);
    }
  }

  async function updatePrices() {
    if (!passcode || (!state.assets.length && !state.watchlist.length)) return;
    setLoading(true);
    try {
      const today = plainDate();
      const updated = await Promise.all(
        state.assets.map(async (asset) => {
          if (!asset.autoUpdate || asset.priceSource === "manual") return asset;
          try {
            const result = await fetchPrice(asset);
            const nextPrice = Number(result.price);
            return { ...asset, ...nextDailyPriceAnchor(asset, today), previousPrice: asset.price, previousPriceAt: asset.lastPriceAt, price: nextPrice, lastPriceAt: new Date().toISOString(), lastPriceError: "" };
          } catch (error) {
            return { ...asset, lastPriceError: error instanceof Error ? error.message : "Fiyat alinamadi" };
          }
        }),
      );
      const updatedWatchlist = await Promise.all(
        (state.watchlist || []).map(async (item) => {
          const normalized = normalizeWatchItem(item);
          if (normalized.priceSource === "manual") return normalized;
          try {
            const result = await fetchPrice(watchItemAsAsset(normalized));
            return { ...normalized, price: Number(result.price), lastPriceAt: new Date().toISOString(), lastPriceError: "" };
          } catch (error) {
            return { ...normalized, lastPriceError: error instanceof Error ? error.message : "Fiyat alinamadi" };
          }
        }),
      );
      const benchmarkHistory = await collectBenchmarkHistory(state.benchmarkHistory);
      await savePortfolio({ ...state, assets: updated, watchlist: updatedWatchlist, benchmarkHistory }, { preserveFundHoldings: true });
    } finally {
      setLoading(false);
    }
  }

  async function refreshAssetPrice(id: string) {
    if (!passcode) return;
    const target = state.assets.find((asset) => asset.id === id);
    if (!target || target.priceSource === "manual") return;
    setLoading(true);
    try {
      let nextAsset = target;
      const today = plainDate();
      try {
        const result = await fetchPrice(target);
        nextAsset = { ...target, autoUpdate: true, ...nextDailyPriceAnchor(target, today), previousPrice: target.price, previousPriceAt: target.lastPriceAt, price: Number(result.price), lastPriceAt: new Date().toISOString(), lastPriceError: "" };
      } catch (error) {
        nextAsset = { ...target, autoUpdate: true, lastPriceError: error instanceof Error ? error.message : "Fiyat alinamadi" };
      }
      await savePortfolio({ ...state, assets: state.assets.map((asset) => (asset.id === id ? nextAsset : asset)) }, { preserveFundHoldings: true });
    } finally {
      setLoading(false);
    }
  }

  async function submitWatchItem(event: FormEvent) {
    event.preventDefault();
    const ticker = watchDraft.ticker.trim();
    if (!ticker) {
      alert("Izlemek istedigin varligin kodunu yaz.");
      return;
    }
    const details = inferAssetDetails(ticker);
    let item = normalizeWatchItem({
      ticker: details.ticker,
      name: details.name,
      type: details.type,
      currency: details.currency,
      priceSource: details.priceSource,
      priceSymbol: details.priceSymbol,
      targetPrice: parseAmount(watchDraft.targetPrice),
      targetWeight: parseAmount(watchDraft.targetWeight),
      note: watchDraft.note,
      createdAt: plainDate(),
    });
    try {
      const discovered = await discoverDraftAsset(normalizeAsset({ ...watchItemAsAsset(item), ticker: item.ticker }), false);
      item = normalizeWatchItem({
        ...item,
        ticker: discovered.ticker,
        name: discovered.name,
        type: discovered.type,
        currency: discovered.currency,
        priceSource: discovered.priceSource,
        priceSymbol: discovered.priceSymbol,
        logoUrl: discovered.logoUrl,
      });
      if (item.priceSource !== "manual") {
        const result = await fetchPrice(watchItemAsAsset(item));
        item = normalizeWatchItem({ ...item, price: Number(result.price), lastPriceAt: new Date().toISOString(), lastPriceError: "" });
      }
    } catch (error) {
      item = normalizeWatchItem({ ...item, lastPriceError: error instanceof Error ? error.message : "Fiyat alinamadi" });
    }
    await savePortfolio({ ...state, watchlist: [...(state.watchlist || []).map(normalizeWatchItem), item] }, { snapshot: false, preserveFundHoldings: true });
    setWatchDraft({ ticker: "", targetPrice: "", targetWeight: "", note: "" });
  }

  async function refreshWatchItem(id: string) {
    const target = (state.watchlist || []).map(normalizeWatchItem).find((item) => item.id === id);
    if (!target || target.priceSource === "manual") return;
    setLoading(true);
    try {
      let nextItem = target;
      try {
        const result = await fetchPrice(watchItemAsAsset(target));
        nextItem = normalizeWatchItem({ ...target, price: Number(result.price), lastPriceAt: new Date().toISOString(), lastPriceError: "" });
      } catch (error) {
        nextItem = normalizeWatchItem({ ...target, lastPriceError: error instanceof Error ? error.message : "Fiyat alinamadi" });
      }
      await savePortfolio({
        ...state,
        watchlist: (state.watchlist || []).map((item) => item.id === id ? nextItem : normalizeWatchItem(item)),
      }, { snapshot: false, preserveFundHoldings: true });
    } finally {
      setLoading(false);
    }
  }

  async function deleteWatchItem(id: string) {
    await savePortfolio({
      ...state,
      watchlist: (state.watchlist || []).filter((item) => item.id !== id).map(normalizeWatchItem),
    }, { snapshot: false, preserveFundHoldings: true });
  }

  function moveWatchItemToAssetDraft(item: WatchItem) {
    const asset = normalizeAsset({ ...watchItemAsAsset(item), id: uid(), quantity: 0, avgCost: item.price || item.targetPrice || 0 });
    openAsset(asset);
    setAssetDraftInputs({
      quantity: "",
      avgCost: amountFieldValue(item.price || item.targetPrice),
      fee: "",
      feeQuantity: "",
      target: amountFieldValue(item.targetWeight),
    });
  }

  async function toggleAssetAutoUpdate(id: string) {
    const assets = state.assets.map((asset) => (asset.id === id ? { ...asset, autoUpdate: !asset.autoUpdate } : asset));
    await savePortfolio({ ...state, assets }, { snapshot: false });
  }

  async function dismissAlert(id: string) {
    const settings = normalizeSettings(state.settings);
    if (settings.dismissedAlertIds.includes(id)) return;
    await savePortfolio({
      ...state,
      settings: { ...settings, dismissedAlertIds: [...settings.dismissedAlertIds, id] },
    }, { snapshot: false });
  }

  async function clearActiveAlerts() {
    const settings = normalizeSettings(state.settings);
    const nextIds = Array.from(new Set([...settings.dismissedAlertIds, ...activeAlerts.map((alert) => alert.id)]));
    await savePortfolio({ ...state, settings: { ...settings, dismissedAlertIds: nextIds } }, { snapshot: false });
  }

  async function resetDismissedAlerts() {
    const settings = normalizeSettings(state.settings);
    await savePortfolio({ ...state, settings: { ...settings, dismissedAlertIds: [] } }, { snapshot: false });
  }

  async function submitAsset(event: FormEvent) {
    event.preventDefault();
    if (!assetDraft) return;
    const grossQuantity = parseAmount(assetDraftInputs.quantity);
    const priceCost = parseAmount(assetDraftInputs.avgCost);
    const cashFee = parseAmount(assetDraftInputs.fee);
    const quantityFee = parseAmount(assetDraftInputs.feeQuantity);
    const netQuantity = Math.max(0, grossQuantity - quantityFee);
    const totalCost = grossQuantity * priceCost + cashFee;
    const adjustedAvgCost = netQuantity ? totalCost / netQuantity : priceCost;
    const numericDraft = normalizeAsset({
      ...assetDraft,
      createdAt: assetDraft.createdAt || plainDate(),
      quantity: netQuantity,
      avgCost: adjustedAvgCost,
      target: parseAmount(assetDraftInputs.target),
    });
    let asset = await discoverDraftAsset(numericDraft, false);
    if (asset.autoUpdate && asset.priceSource !== "manual") {
      try {
        const result = await fetchPrice(asset);
        asset = { ...asset, price: Number(result.price), lastPriceAt: new Date().toISOString(), lastPriceError: "" };
      } catch (error) {
        asset = { ...asset, price: asset.price || asset.avgCost, lastPriceError: error instanceof Error ? error.message : "Fiyat alinamadi" };
      }
    }
    const exists = state.assets.some((item) => item.id === asset.id);
    const duplicate = !exists ? state.assets.find((item) => assetMergeKey(item) === assetMergeKey(asset)) : null;
    const mergedDuplicate = duplicate ? { ...mergeAssetCluster([duplicate, asset]), id: duplicate.id } : null;
    const assets = exists
      ? state.assets.map((item) => (item.id === asset.id ? asset : item))
      : duplicate && mergedDuplicate
        ? state.assets.map((item) => (item.id === duplicate.id ? mergedDuplicate : item))
        : [...state.assets, asset];
    const targetAsset = duplicate && mergedDuplicate ? mergedDuplicate : asset;
    const shouldCreateInitialBuy = !exists && netQuantity > 0 && priceCost > 0;
    const buyTransaction = shouldCreateInitialBuy ? normalizeTransaction(transactionWithAssetIdentity({
      id: uid(),
      date: plainDate(),
      type: "buy",
      quantity: netQuantity,
      price: priceCost,
      amount: grossQuantity * priceCost,
      fee: cashFee,
      costBasis: totalCost,
      realizedProfit: 0,
      resultingQuantity: targetAsset.quantity,
      resultingAvgCost: targetAsset.avgCost,
      note: duplicate ? "Mevcut pozisyona ek alis" : "Ilk varlik kaydi",
    }, targetAsset)) : null;
    await savePortfolio({ ...state, assets, transactions: buyTransaction ? [...state.transactions.map(normalizeTransaction), buyTransaction] : state.transactions });
    setAssetDraft(null);
  }

  async function fetchPrice(asset: Asset) {
    const source = asset.priceSource;
    const symbol = asset.priceSymbol || asset.ticker;
    if (source === "binance" || asset.type === "Kripto") {
      return fetchBrowserCryptoPrice(symbol || asset.ticker);
    }
    const url = `/api/price?source=${encodeURIComponent(source)}&symbol=${encodeURIComponent(symbol)}`;
    return api<{ price: number }>(url, passcode);
  }

  async function fetchBenchmarkPrice(benchmark: (typeof benchmarkDefinitions)[number]) {
    if (benchmark.source === "binance") return fetchBrowserCryptoPrice(benchmark.symbol);
    const url = `/api/price?source=${encodeURIComponent(benchmark.source)}&symbol=${encodeURIComponent(benchmark.symbol)}`;
    return api<{ price: number; source?: string; symbol?: string }>(url, passcode);
  }

  async function collectBenchmarkHistory(existingHistory = state.benchmarkHistory) {
    const today = plainDate();
    const updates = await Promise.all(
      benchmarkDefinitions.filter((benchmark) => benchmark.code !== "portfolio").map(async (benchmark) => {
        try {
          const result = await fetchBenchmarkPrice(benchmark);
          const price = Number(result.price);
          if (!Number.isFinite(price) || price <= 0) return null;
          return normalizeBenchmarkPoint({
            id: `${benchmark.code}-${today}`,
            code: benchmark.code,
            date: today,
            price,
            source: result.source || benchmark.source,
            symbol: result.symbol || benchmark.symbol,
          });
        } catch {
          return null;
        }
      }),
    );
    const byKey = new Map<string, BenchmarkPoint>();
    existingHistory.map(normalizeBenchmarkPoint).forEach((point) => {
      if (point.code && point.date) byKey.set(`${point.code}-${point.date}`, point);
    });
    updates.filter(Boolean).forEach((point) => {
      if (point) byKey.set(`${point.code}-${point.date}`, point);
    });
    return Array.from(byKey.values()).sort((left, right) => `${left.date}-${left.code}`.localeCompare(`${right.date}-${right.code}`)).slice(-3650);
  }

  async function updateBenchmarksOnly() {
    if (!passcode) return;
    setLoading(true);
    try {
      const benchmarkHistory = await collectBenchmarkHistory(state.benchmarkHistory);
      await savePortfolio({ ...state, benchmarkHistory }, { snapshot: false });
    } finally {
      setLoading(false);
    }
  }

  async function fetchBrowserCryptoPrice(symbol: string) {
    const finalSymbol = normalizeCryptoSymbol(symbol);
    const binanceEndpoints = [
      "https://api.binance.com",
      "https://api1.binance.com",
      "https://api2.binance.com",
      "https://api3.binance.com",
      "https://data-api.binance.vision",
    ];
    let lastError = "Kripto fiyati alinamadi";

    for (const endpoint of binanceEndpoints) {
      try {
        const response = await fetch(`${endpoint}/api/v3/ticker/price?symbol=${encodeURIComponent(finalSymbol)}`, { cache: "no-store" });
        if (!response.ok) {
          lastError = `Binance ${response.status}`;
          continue;
        }
        const data = await response.json() as { price?: string };
        const price = Number(data.price);
        if (Number.isFinite(price) && price > 0) return { price };
      } catch (error) {
        lastError = error instanceof Error ? error.message : lastError;
      }
    }

    for (const fallback of [fetchCryptoCompareTryPrice, fetchCoinPaprikaTryPrice, fetchCoinGeckoTryPrice]) {
      try {
        return await fallback(finalSymbol);
      } catch {
        // Keep going until one public crypto source works from the browser.
      }
    }
    throw new Error(`${lastError}; tarayici yedek kaynaklari da okunamadi`);
  }

  function normalizeCryptoSymbol(symbol: string) {
    const compact = compactCode(symbol);
    if (compact === "RNDRTRY") return "RENDERTRY";
    if (["TRY", "USDT", "USD", "EUR"].some((suffix) => compact.endsWith(suffix))) return compact;
    return `${compact}TRY`;
  }

  function cryptoBaseFromSymbol(symbol: string) {
    const compact = compactCode(symbol);
    const quote = ["TRY", "USDT", "USD", "EUR"].find((suffix) => compact.endsWith(suffix));
    return quote ? compact.slice(0, -quote.length) : compact;
  }

  async function fetchCryptoCompareTryPrice(symbol: string) {
    const base = cryptoBaseFromSymbol(symbol);
    const candidates = base === "RENDER" ? ["RENDER", "RNDR"] : base === "RNDR" ? ["RNDR", "RENDER"] : [base];
    for (const candidate of candidates) {
      const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${encodeURIComponent(candidate)}&tsyms=TRY`, { cache: "no-store" });
      if (!response.ok) continue;
      const data = await response.json() as { TRY?: number };
      const price = Number(data.TRY);
      if (Number.isFinite(price) && price > 0) return { price };
    }
    throw new Error("CryptoCompare fiyati okunamadi");
  }

  const coinPaprikaIds: Record<string, string> = {
    BTC: "btc-bitcoin",
    ETH: "eth-ethereum",
    LINK: "link-chainlink",
    RNDR: "rndr-render-token",
    RENDER: "rndr-render-token",
    ONDO: "ondo-ondo-finance",
    ALGO: "algo-algorand",
    SUI: "sui-sui",
    XRP: "xrp-xrp",
    NEAR: "near-near-protocol",
  };

  async function fetchCoinPaprikaTryPrice(symbol: string) {
    const base = cryptoBaseFromSymbol(symbol);
    const id = coinPaprikaIds[base];
    if (!id) throw new Error("CoinPaprika sembolu yok");
    const response = await fetch(`https://api.coinpaprika.com/v1/tickers/${encodeURIComponent(id)}?quotes=TRY`, { cache: "no-store" });
    if (!response.ok) throw new Error(`CoinPaprika ${response.status}`);
    const data = await response.json() as { quotes?: { TRY?: { price?: number } } };
    const price = Number(data.quotes?.TRY?.price);
    if (!Number.isFinite(price) || price <= 0) throw new Error("CoinPaprika fiyati okunamadi");
    return { price };
  }

  const coinGeckoIds: Record<string, string> = {
    BTC: "bitcoin",
    ETH: "ethereum",
    LINK: "chainlink",
    RNDR: "render-token",
    RENDER: "render-token",
    ONDO: "ondo-finance",
    ALGO: "algorand",
    SUI: "sui",
    XRP: "ripple",
    NEAR: "near-protocol",
  };

  async function fetchCoinGeckoTryPrice(symbol: string) {
    const base = cryptoBaseFromSymbol(symbol);
    const id = coinGeckoIds[base];
    if (!id) throw new Error("CoinGecko sembolu yok");
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=try`, { cache: "no-store" });
    if (!response.ok) throw new Error(`CoinGecko ${response.status}`);
    const data = await response.json() as Record<string, { try?: number }>;
    const price = Number(data[id]?.try);
    if (!Number.isFinite(price) || price <= 0) throw new Error("CoinGecko fiyati okunamadi");
    return { price };
  }

  function openAsset(asset?: Asset) {
    setSelectedAssetId("");
    setAssetLookup({ loading: false, message: "", ok: false });
    const nextAsset = asset ? { ...asset } : normalizeAsset({ ticker: "", quantity: 0, avgCost: 0, price: 0 });
    setAssetDraft(nextAsset);
    setAssetDraftInputs({
      quantity: amountFieldValue(nextAsset.quantity),
      avgCost: amountFieldValue(nextAsset.avgCost),
      fee: "",
      feeQuantity: "",
      target: amountFieldValue(nextAsset.target),
    });
  }

  function openAssetDetail(asset: Asset) {
    setSelectedAssetId(asset.id);
    setTransactionDraft({ type: "buy", quantity: "", price: "", amount: "", fee: "", date: plainDate(), note: "" });
  }

  function openQuickSell(asset?: Asset) {
    const target = asset || sellableAssets[0];
    if (!target) {
      alert("Satilabilecek acik pozisyon yok.");
      return;
    }
    setSelectedAssetId("");
    setQuickSellDraft({
      assetId: target.id,
      quantity: "",
      price: amountFieldValue(target.price),
      amount: "",
      fee: "",
      date: plainDate(),
      note: "",
    });
  }

  function updateDraftTicker(value: string) {
    const details = inferAssetDetails(value);
    setAssetLookup({ loading: false, message: "", ok: false });
    setAssetDraft((draft) => normalizeAsset({ ...(draft || {}), ...details, ticker: details.ticker }));
  }

  async function discoverDraftAsset(draft = assetDraft, updateState = true) {
    if (!draft || !draft.ticker.trim() || draft.priceSource === "manual") return normalizeAsset(draft || {});
    if (updateState) setAssetLookup({ loading: true, message: "Varlik bilgileri bulunuyor...", ok: false });
    try {
      const discovered = await api<Partial<Asset>>(`/api/asset?code=${encodeURIComponent(draft.ticker)}`, passcode);
      const resolved = normalizeAsset({ ...draft, ...discovered, id: draft.id, quantity: draft.quantity, avgCost: draft.avgCost, target: draft.target, note: draft.note });
      if (updateState) {
        setAssetDraft(resolved);
        setAssetLookup({ loading: false, message: `${resolved.name} otomatik olarak eslestirildi.`, ok: true });
      }
      return resolved;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Varlik otomatik bulunamadi";
      if (updateState) setAssetLookup({ loading: false, message: `${message}. Mevcut kodla devam edilecek.`, ok: false });
      return normalizeAsset(draft);
    }
  }

  async function deleteAsset(id: string) {
    if (!confirm("Bu varlik silinsin mi?")) return;
    await savePortfolio({
      ...state,
      assets: state.assets.filter((asset) => asset.id !== id),
      transactions: state.transactions.filter((tx) => tx.assetId !== id),
    });
    if (selectedAssetId === id) setSelectedAssetId("");
  }

  async function mergeDuplicateAssets() {
    if (!duplicateAssetGroups.length) {
      alert("Birleştirilecek tekrar eden varlık yok.");
      return;
    }
    const summary = duplicateAssetGroups.map((group) => {
      const ticker = group.assets[0]?.ticker || group.key;
      return `${ticker}: ${group.assets.length} satir`;
    }).join("\n");
    if (!confirm(`Ayni kodlu varliklar tek satirda birlestirilecek:\n\n${summary}\n\nDevam edilsin mi?`)) return;

    const duplicateIds = new Set(duplicateAssetGroups.flatMap((group) => group.assets.map((asset) => asset.id)));
    const mergedAssets = duplicateAssetGroups.map((group) => mergeAssetCluster(group.assets));
    const idMap = new Map<string, string>();
    duplicateAssetGroups.forEach((group, index) => {
      const targetId = mergedAssets[index].id;
      group.assets.forEach((asset) => idMap.set(asset.id, targetId));
    });
    const untouchedAssets = state.assets.filter((asset) => !duplicateIds.has(asset.id));
    const transactions = state.transactions.map((tx) => normalizeTransaction({
      ...tx,
      assetId: idMap.get(tx.assetId) || tx.assetId,
    }));

    await savePortfolio({
      ...state,
      assets: [...untouchedAssets, ...mergedAssets],
      transactions,
    });
  }

  async function createInitialPositionStories() {
    if (!missingInitialPositionAssets.length) {
      alert("Hikayesi eksik pozisyon yok.");
      return;
    }
    const summary = missingInitialPositionAssets.map((asset) => `${asset.ticker}: ${num(asset.quantity)} adet`).join("\n");
    if (!confirm(`${missingInitialPositionAssets.length} varlik icin baslangic alis kaydi olusturulacak.\n\n${summary}\n\nTarih olarak portfoye ekleme/ilk portfoy kayit tarihi kullanilacak. Devam edilsin mi?`)) return;

    const assetDateMap = new Map(missingInitialPositionAssets.map((asset) => [asset.id, asset.createdAt || firstPortfolioDate]));
    const assets = state.assets.map((asset) => {
      const normalized = normalizeAsset(asset);
      return assetDateMap.has(normalized.id) ? { ...normalized, createdAt: assetDateMap.get(normalized.id) } : normalized;
    });
    const initialTransactions = missingInitialPositionAssets.map((asset) => {
      const date = assetDateMap.get(asset.id) || firstPortfolioDate;
      return normalizeTransaction(transactionWithAssetIdentity({
        id: uid(),
        date,
        type: "buy",
        quantity: asset.quantity,
        price: asset.avgCost,
        amount: asset.quantity * asset.avgCost,
        fee: 0,
        costBasis: asset.quantity * asset.avgCost,
        realizedProfit: 0,
        resultingQuantity: asset.quantity,
        resultingAvgCost: asset.avgCost,
        note: "Baslangic pozisyon kaydi",
      }, asset));
    });

    await savePortfolio({
      ...state,
      assets,
      transactions: [...state.transactions.map(normalizeTransaction), ...initialTransactions],
    }, { snapshot: false, preserveFundHoldings: true });
    alert(`${initialTransactions.length} baslangic alis kaydi olusturuldu.`);
  }

  async function submitTransaction(event: FormEvent) {
    event.preventDefault();
    if (!selectedAssetDetail) return;
    const isPositionTrade = isPositionTransaction(transactionDraft.type);
    const amount = parseAmount(transactionDraft.amount);
    const price = parseAmount(transactionDraft.price) || (!isPositionTrade ? amount : selectedAssetDetail.asset.price || selectedAssetDetail.asset.avgCost);
    const quantity = parseAmount(transactionDraft.quantity) || (amount && price ? amount / price : 0);
    const tx = normalizeTransaction(transactionWithAssetIdentity({
      id: uid(),
      date: transactionDraft.date,
      type: transactionDraft.type,
      quantity,
      price,
      amount: amount || quantity * price,
      fee: parseAmount(transactionDraft.fee),
      note: transactionDraft.note,
    }, selectedAssetDetail.asset));
    if (!tx.date || (isPositionTrade && (!tx.quantity || !tx.price)) || (!isPositionTrade && !tx.price)) {
      alert("Islem icin tarih ve tutar bilgisi gerekli.");
      return;
    }
    const existingTransactions = state.transactions.map(normalizeTransaction);
    const nextTransactions = [...existingTransactions, tx];
    const relatedTransactions = nextTransactions.filter((item) => item.assetId === selectedAssetDetail.asset.id);
    const shouldRebuildPosition = isPositionTrade;
    const rebuilt = shouldRebuildPosition ? rebuildAssetFromTransactions(selectedAssetDetail.asset, relatedTransactions) : { asset: selectedAssetDetail.asset, transactions: relatedTransactions, error: "" };
    const applied = shouldRebuildPosition && rebuilt.error
      ? applyTransactionToAsset(selectedAssetDetail.asset, tx)
      : {
        asset: rebuilt.asset,
        transaction: tx,
        error: "",
      };
    if (applied.error) {
      alert(applied.error);
      return;
    }
    const persistedTransactions = rebuilt.error ? relatedTransactions.map((item) => (item.id === tx.id ? applied.transaction : item)) : rebuilt.transactions;
    const rebuiltById = new Map(persistedTransactions.map((item) => [item.id, item]));
    await savePortfolio({
      ...state,
      assets: state.assets.map((asset) => (asset.id === selectedAssetDetail.asset.id ? applied.asset : asset)),
      transactions: nextTransactions.map((item) => item.assetId === selectedAssetDetail.asset.id ? (rebuiltById.get(item.id) || item) : item),
    });
    setTransactionDraft({ type: "buy", quantity: "", price: "", amount: "", fee: "", date: plainDate(), note: "" });
  }

  async function submitQuickSell(event: FormEvent) {
    event.preventDefault();
    const asset = state.assets.find((item) => item.id === quickSellDraft.assetId);
    if (!asset) {
      alert("Satilacak varlik secilemedi.");
      return;
    }
    const amount = parseAmount(quickSellDraft.amount);
    const price = parseAmount(quickSellDraft.price) || asset.price || asset.avgCost;
    const quantity = parseAmount(quickSellDraft.quantity) || (amount && price ? amount / price : 0);
    const tx = normalizeTransaction(transactionWithAssetIdentity({
      id: uid(),
      date: quickSellDraft.date,
      type: "sell",
      quantity,
      price,
      amount: amount || quantity * price,
      fee: parseAmount(quickSellDraft.fee),
      note: quickSellDraft.note || "Hizli satis",
    }, asset));
    if (!tx.date || !tx.quantity || !tx.price) {
      alert("Satis icin tarih, adet ve fiyat bilgisi gerekli.");
      return;
    }
    if (tx.quantity > Number(asset.quantity || 0) + 0.00000001) {
      alert(`Satmak istedigin adet mevcut adetten fazla. Mevcut adet: ${num(asset.quantity)}`);
      return;
    }

    const existingTransactions = state.transactions.map(normalizeTransaction);
    const nextTransactions = [...existingTransactions, tx];
    const relatedTransactions = nextTransactions.filter((item) => item.assetId === asset.id);
    const rebuilt = rebuildAssetFromTransactions(asset, relatedTransactions);
    const applied = rebuilt.error
      ? applyTransactionToAsset(asset, tx)
      : { asset: rebuilt.asset, transaction: tx, error: "" };
    if (applied.error) {
      alert(applied.error);
      return;
    }
    const persistedTransactions = rebuilt.error ? relatedTransactions.map((item) => (item.id === tx.id ? applied.transaction : item)) : rebuilt.transactions;
    const rebuiltById = new Map(persistedTransactions.map((item) => [item.id, item]));
    const nextAsset = applied.asset;
    await savePortfolio({
      ...state,
      assets: state.assets.map((item) => (item.id === asset.id ? nextAsset : item)),
      transactions: nextTransactions.map((item) => item.assetId === asset.id ? (rebuiltById.get(item.id) || item) : item),
    });
    setQuickSellDraft({ assetId: "", quantity: "", price: "", amount: "", fee: "", date: plainDate(), note: "" });
    setSelectedAssetId(asset.id);
    alert(`Satis kaydedildi. Kalan adet: ${num(nextAsset.quantity)}`);
  }

  async function deleteTransaction(id: string) {
    const transactions = state.transactions.map(normalizeTransaction);
    const tx = transactions.find((item) => item.id === id);
    if (!tx) return;
    const nextTransactions = transactions.filter((item) => item.id !== id);
    const baseAsset = state.assets.find((asset) => asset.id === tx.assetId);
    if (!baseAsset) return;
    const relatedTransactions = nextTransactions.filter((item) => item.assetId === tx.assetId);
    const shouldRebuildPosition = isPositionTransaction(tx.type);
    const rebuilt = shouldRebuildPosition ? rebuildAssetFromTransactions(baseAsset, relatedTransactions) : { asset: baseAsset, transactions: relatedTransactions, error: "" };
    const nextAsset = shouldRebuildPosition && rebuilt.error ? reverseLastTransactionOnAsset(baseAsset, tx) : rebuilt.asset;
    const rebuiltById = new Map((rebuilt.error ? relatedTransactions : rebuilt.transactions).map((item) => [item.id, item]));
    const assets = state.assets.map((asset) => (asset.id === tx.assetId ? nextAsset : asset));
    await savePortfolio({
      ...state,
      assets,
      transactions: nextTransactions.map((item) => item.assetId === tx.assetId ? (rebuiltById.get(item.id) || item) : item),
    }, { snapshot: false });
  }

  async function importBackup(file: File) {
    try {
      const text = await file.text();
      const nextState = file.name.toLowerCase().endsWith(".csv")
        ? parseCsvBackup(text)
        : parseJsonBackup(text);
      await savePortfolio(nextState);
      alert(`${nextState.assets.length} varlik bulut portfoyune aktarildi.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Dosya iceri aktarilamadi.");
    }
  }

  function parseJsonBackup(text: string): PortfolioState {
    const data = JSON.parse(text);
    return {
      assets: (data.assets || []).map(normalizeAsset),
      watchlist: (data.watchlist || []).map(normalizeWatchItem),
      transactions: (data.transactions || []).map(normalizeTransaction),
      history: (data.history || []).map(normalizeSnapshot),
      cashFlows: (data.cashFlows || []).map(normalizeCashFlow),
      benchmarkHistory: (data.benchmarkHistory || []).map(normalizeBenchmarkPoint),
      settings: normalizeSettings(data.settings),
    };
  }

  function parseCsvBackup(text: string): PortfolioState {
    const rows = parseCsvRows(text);
    if (rows.length < 2) throw new Error("CSV dosyasinda aktarilacak varlik bulunamadi");

    const headers = rows[0].map((header) => normalizeHeader(header));
    const assets = rows.slice(1).map((row) => {
      const get = (name: string) => row[headers.indexOf(normalizeHeader(name))] || "";
      const ticker = get("Kod");
      const inferred = inferAssetDetails(ticker);
      return normalizeAsset({
        id: uid(),
        ticker,
        name: get("Ad") || inferred.name,
        type: get("Tur") || inferred.type,
        currency: get("Para Birimi") || inferred.currency,
        fxRate: parseAmount(get("TL Kuru")) || 1,
        priceSource: get("Fiyat Kaynagi") || inferred.priceSource,
        priceSymbol: get("API Sembolu") || inferred.priceSymbol,
        autoUpdate: !["hayir", "false", "0"].includes(get("Oto Guncelleme").trim().toLowerCase()),
        quantity: parseAmount(get("Adet")),
        avgCost: parseAmount(get("Ortalama Alis Fiyati")),
        price: parseAmount(get("Guncel Fiyat")) || parseAmount(get("Ortalama Alis Fiyati")),
        target: parseAmount(get("Hedef")),
        note: get("Not"),
      });
    }).filter((asset) => asset.ticker && asset.quantity > 0);

    if (!assets.length) throw new Error("CSV dosyasinda aktarilacak varlik bulunamadi");
    return { assets, watchlist: [], transactions: [], history: [], cashFlows: [], benchmarkHistory: [], settings: defaultSettings };
  }

  function normalizeHeader(value: string) {
    return String(value || "")
      .trim()
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/\s+/g, " ");
  }

  function parseCsvRows(text: string) {
    const firstLine = text.split(/\r?\n/, 1)[0] || "";
    const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];
      if (char === '"' && quoted && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === delimiter && !quoted) {
        row.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") index += 1;
        row.push(cell);
        if (row.some((value) => value.trim())) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    row.push(cell);
    if (row.some((value) => value.trim())) rows.push(row);
    return rows;
  }

  async function submitCashFlow(event: FormEvent) {
    event.preventDefault();
    const amount = parseAmount(cashDraft.amount);
    if (amount <= 0) {
      alert("Lutfen gecerli bir tutar gir.");
      return;
    }
    const flow = normalizeCashFlow({
      id: editingCashFlowId || uid(),
      date: cashDraft.date,
      type: cashDraft.type,
      amount,
      note: cashDraft.note,
    });
    const cashFlows = editingCashFlowId
      ? state.cashFlows.map((item) => (item.id === editingCashFlowId ? flow : item))
      : [...state.cashFlows, flow];
    await savePortfolio({ ...state, cashFlows });
    setCashDraft({ type: "deposit", amount: "", date: plainDate(), note: "" });
    setEditingCashFlowId("");
  }

  function editCashFlow(flow: CashFlow) {
    const normalized = normalizeCashFlow(flow);
    setEditingCashFlowId(normalized.id);
    setCashDraft({
      type: normalized.type,
      amount: String(normalized.amount).replace(".", ","),
      date: normalized.date,
      note: normalized.note,
    });
  }

  function cancelCashFlowEdit() {
    setEditingCashFlowId("");
    setCashDraft({ type: "deposit", amount: "", date: plainDate(), note: "" });
  }

  async function deleteCashFlow(id: string) {
    await savePortfolio({ ...state, cashFlows: state.cashFlows.filter((flow) => flow.id !== id) });
    if (editingCashFlowId === id) cancelCashFlowEdit();
  }

  async function updateTargetAllocation(groupKey: string, value: string) {
    const amount = Math.max(0, parseAmount(value));
    const settings = normalizeSettings(state.settings);
    await savePortfolio({
      ...state,
      settings: {
        ...settings,
        targetAllocations: { ...settings.targetAllocations, [groupKey]: amount },
      },
    }, { snapshot: false });
  }

  async function updateRebalanceAmount(value: string) {
    const settings = normalizeSettings(state.settings);
    await savePortfolio({
      ...state,
      settings: { ...settings, rebalanceAmount: Math.max(0, parseAmount(value)) },
    }, { snapshot: false });
  }

  async function resetTargetAllocations() {
    const settings = normalizeSettings(state.settings);
    await savePortfolio({
      ...state,
      settings: { ...settings, targetAllocations: defaultTargetAllocations },
    }, { snapshot: false });
  }

  async function saveFundHolding(event: FormEvent) {
    event.preventDefault();
    const fundCode = compactCode(fundHoldingDraft.fundCode || fundAssets[0]?.asset.ticker || "");
    const symbol = compactCode(fundHoldingDraft.symbol);
    const weight = parseAmount(fundHoldingDraft.weight);
    if (!fundCode || !symbol || weight <= 0) return;
    const settings = normalizeSettings(state.settings);
    const row = normalizeFundHolding(fundCode, {
      id: `${fundCode}-${symbol}-${Date.now()}`,
      fundCode,
      symbol,
      name: fundHoldingDraft.name || symbol,
      weight,
      sector: fundHoldingDraft.sector || "Belirtilmedi",
      country: fundHoldingDraft.country || "Belirtilmedi",
    });
    const nextRows = [...(settings.fundHoldings[fundCode] || []).filter((item) => item.symbol !== symbol), row]
      .sort((left, right) => right.weight - left.weight);
    await savePortfolio({
      ...state,
      settings: { ...settings, fundHoldings: { ...settings.fundHoldings, [fundCode]: nextRows } },
    }, { snapshot: false });
    setFundHoldingDraft({ fundCode, symbol: "", name: "", weight: "", sector: "", country: "" });
  }

  async function deleteFundHolding(fundCode: string, id: string) {
    const settings = normalizeSettings(state.settings);
    const code = compactCode(fundCode);
    const nextRows = (settings.fundHoldings[code] || []).filter((row) => row.id !== id);
    await savePortfolio({
      ...state,
      settings: { ...settings, fundHoldings: { ...settings.fundHoldings, [code]: nextRows } },
    }, { snapshot: false });
  }

  async function syncFundHoldings(fundCode?: string) {
    const codes = fundCode ? [compactCode(fundCode)] : fundAssets.map((row) => compactCode(row.asset.ticker || row.asset.priceSymbol));
    const uniqueCodes = [...new Set(codes.filter(Boolean))];
    if (!uniqueCodes.length) return;
    setFundSyncStatus("Fon icerikleri kontrol ediliyor...");
    setLoading(true);
    try {
      const query = uniqueCodes.length === 1
        ? `code=${encodeURIComponent(uniqueCodes[0])}`
        : `codes=${encodeURIComponent(uniqueCodes.join(","))}`;
      const data = await api<{ funds?: Array<{ fundCode: string; ok: boolean; holdings: Partial<FundHolding>[]; message?: string }> }>(`/api/fund-holdings?${query}`, passcode);
      const settings = normalizeSettings(state.settings);
      const nextHoldings = { ...settings.fundHoldings };
      let updatedCount = 0;
      let missingCount = 0;
      (data.funds || []).forEach((fund) => {
        const code = compactCode(fund.fundCode);
        const rows = (fund.holdings || []).map((holding) => normalizeFundHolding(code, holding));
        if (fund.ok && rows.length) {
          nextHoldings[code] = rows;
          updatedCount += 1;
        } else {
          missingCount += 1;
        }
      });
      await savePortfolio({ ...state, settings: { ...settings, fundHoldings: nextHoldings } }, { snapshot: false });
      setFundSyncStatus(`${updatedCount} fon icerigi guncellendi${missingCount ? `, ${missingCount} fon icin otomatik kaynak yok` : ""}.`);
    } catch (error) {
      setFundSyncStatus(error instanceof Error ? error.message : "Fon icerikleri guncellenemedi");
    } finally {
      setLoading(false);
    }
  }

  function chartPoints(key: "totalValue" | "totalCost") {
    if (historySeries.length === 1) {
      const y = chartY(historySeries[0][key]);
      return `0,${y} 100,${y}`;
    }
    return historySeries
      .map((item, index) => {
        const x = 2 + (index / Math.max(historySeries.length - 1, 1)) * 96;
        return `${x},${chartY(item[key])}`;
      })
      .join(" ");
  }

  function chartY(value: number) {
    const range = Math.max(chartBounds.max - chartBounds.min, 1);
    return 92 - ((value - chartBounds.min) / range) * 84;
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `portfoy-yedek-${plainDate()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function printPortfolioReport() {
    const previousTitle = document.title;
    const now = new Date();
    const parts = [
      now.getDate(),
      now.getMonth() + 1,
      now.getFullYear(),
      now.getHours(),
      now.getMinutes(),
    ].map((item) => String(item).padStart(2, "0"));
    document.title = `mustafa-cimen-portfoy-${parts.join("-")}`;
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.title = previousTitle;
      }, 500);
    }, 50);
  }

  if (!authChecked || (!passcode && loading && !authError)) {
    return <main className="center-screen">Portfoy paneli hazirlaniyor...</main>;
  }

  if (!passcode) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <div className="mark">PF</div>
          <h1>{needsSetup ? "Kisisel portfoy sifreni olustur" : "Portfoyune giris yap"}</h1>
          <p>
            {needsSetup
              ? "Bu sifre bu web panelini ve buluttaki portfoy kaydini koruyacak."
              : "Portfoy verilerin bulutta saklaniyor; sifrenle acabilirsin."}
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void login();
            }}
          >
            <input
              className="input"
              type="password"
              minLength={6}
              placeholder="En az 6 karakter"
              value={draftPasscode}
              onChange={(event) => setDraftPasscode(event.target.value)}
              autoFocus
            />
            {authError ? <div className="form-error">{authError}</div> : null}
            <button className="primary" disabled={loading}>
              {needsSetup ? "Sifreyi olustur" : "Giris yap"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  const failures = state.assets.filter((asset) => asset.lastPriceError).length;
  const active = state.assets.filter((asset) => asset.autoUpdate && asset.priceSource !== "manual").length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="mark">PF</div>
          <div>
            <strong>Portfoy Takip</strong>
            <span>Kisisel bulut paneli</span>
          </div>
        </div>
        <nav className="side-menu" aria-label="Portfoy bolumleri">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={activeTab === item.key ? "active" : ""}
              onClick={() => setActiveTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="side-note">
          Bu surum lokal dosyadan ayridir. Veriler sifreli erisimle bulutta saklanir; mevcut bilgisayar surumun korunur.
        </div>
      </aside>

      <main className="dashboard">
        <section className="topbar">
          <div>
            <h1>{activeMenu.label}</h1>
            <p>{activeMenu.description}</p>
            <div className="status-line">
              <span className="status-pill"><span className={`pulse ${failures ? "error" : active ? "" : "off"}`} />{active} kaynak aktif, {failures} hata</span>
              <span>{lastSync ? `Son kayit ${formatTime(lastSync)}` : "Kayit bekliyor"}</span>
              <span>{saving ? "Kaydediliyor..." : loading ? "Guncelleniyor..." : "Hazir"}</span>
            </div>
          </div>
          <div className="actions">
            <button className="secondary" onClick={() => void updatePrices()} disabled={loading}>Fiyatlari guncelle</button>
            <button
              className="secondary"
              onClick={() => void savePortfolio({ ...state, settings: { autoRefresh: !state.settings.autoRefresh } })}
            >
              Oto: {state.settings.autoRefresh ? "Acik" : "Kapali"}
            </button>
            <button className="secondary" onClick={printPortfolioReport}>PDF raporu</button>
            <button className="secondary" onClick={exportBackup}>Yedek indir</button>
            <button className="secondary" onClick={() => void mergeDuplicateAssets()} disabled={!duplicateAssetGroups.length}>Tekrarlananlari birlestir{duplicateAssetGroups.length ? ` (${duplicateAssetGroups.length})` : ""}</button>
            <button className="secondary" onClick={() => void createInitialPositionStories()} disabled={!missingInitialPositionAssets.length}>Eksik hikayeleri olustur{missingInitialPositionAssets.length ? ` (${missingInitialPositionAssets.length})` : ""}</button>
            <button className="secondary" onClick={() => openQuickSell()} disabled={!sellableAssets.length}>Varlik sat</button>
            <label className="file-button">
              Yedek yukle
              <input type="file" accept=".json,.csv,application/json,text/csv" onChange={(event) => event.target.files?.[0] && void importBackup(event.target.files[0])} />
            </label>
            <button className="primary" onClick={() => openAsset()}>+ Varlik ekle</button>
          </div>
        </section>

        <section className="cards">
          <article className="card"><span>Toplam maliyet</span><strong>{money(totals.totalCost)}</strong><small>Kayitli alis maliyeti</small></article>
          <article className="card"><span>Guncel deger</span><TrendValue trend={totals.pl}>{money(totals.totalValue)}</TrendValue><small>{state.assets.length} varlik</small></article>
          <article className="card"><span>Kar / Zarar</span><TrendValue trend={totals.pl}>{signedMoney(totals.pl)}</TrendValue><small>{pct(totals.rate)}</small></article>
          <article className="card"><span>Nakit</span><strong>{money(totals.cash)}</strong><small>Varlik tipi: Nakit</small></article>
        </section>

        {activeTab === "distribution" ? (
          <section className="insights-grid">
            <article className="insight-card gold"><span>Yatirilan ana para</span><strong>{money(totals.totalCost)}</strong></article>
            <article className={totals.pl >= 0 ? "insight-card green" : "insight-card red"}><span>Varlik degeri</span><TrendValue trend={totals.pl}>{money(totals.totalValue)}</TrendValue></article>
            <article className={totals.pl >= 0 ? "insight-card green" : "insight-card red"}><span>Net durum</span><TrendValue trend={totals.pl}>{signedMoney(totals.pl)}</TrendValue><small>{pct(totals.rate)}</small></article>
            <article className={(bestAsset?.returnRate || 0) >= 0 ? "insight-card green" : "insight-card red"}><span>En iyi performans</span><strong className={(bestAsset?.returnRate || 0) >= 0 ? "positive" : "negative"}>{bestAsset?.asset.ticker || "-"}</strong><small className={(bestAsset?.returnRate || 0) >= 0 ? "positive" : "negative"}><span className={`trend-triangle ${(bestAsset?.returnRate || 0) >= 0 ? "up" : "down"}`} />{bestAsset ? `${pct(bestAsset.returnRate)} · ${absoluteMoney(bestAsset.profitLoss)}` : "%0"}</small></article>
            <article className={(worstAsset?.returnRate || 0) >= 0 ? "insight-card green" : "insight-card red"}><span>En zayif performans</span><strong className={(worstAsset?.returnRate || 0) >= 0 ? "positive" : "negative"}>{worstAsset?.asset.ticker || "-"}</strong><small className={(worstAsset?.returnRate || 0) >= 0 ? "positive" : "negative"}><span className={`trend-triangle ${(worstAsset?.returnRate || 0) >= 0 ? "up" : "down"}`} />{worstAsset ? `${pct(worstAsset.returnRate)} · ${absoluteMoney(worstAsset.profitLoss)}` : "%0"}</small></article>
          </section>
        ) : null}

        {activeTab === "distribution" ? (
          <section className="panel visual-panel">
            <div className="panel-header compact">
              <div>
                <h2>Varlik Sinifi Dagilimi</h2>
                <p>Guncel portfoy degerine gore sinif paylari.</p>
              </div>
            </div>
            <div className="visual-body">
              <div className="class-stack" style={{ background: classGradient }} />
              <div className="legend-grid">
                {groupedAssets.map((group) => {
                  const share = totals.totalValue ? (group.value / totals.totalValue) * 100 : 0;
                  return (
                    <div key={group.key} className="legend-item">
                      <span style={{ background: groupColors[group.key] || "#647181" }} />
                      <strong>{group.label}</strong>
                      <b>{pct(share)}</b>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "distribution" ? (
          <section className="panel visual-panel">
            <div className="panel-header compact">
              <div>
                <h2>Genel Portfoy Dagilimi</h2>
                <p>Varlik bazinda portfoy payi ve guncel deger.</p>
              </div>
            </div>
            <div className="portfolio-bars">
              {portfolioRows.map((row) => (
                <div className="portfolio-bar-row" key={row.asset.id}>
                  <AssetLogo asset={row.asset} color={row.color} />
                  <strong>{row.asset.ticker}</strong>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(2, row.share)}%`, background: row.color }} /></div>
                  <span>{pct(row.share)}</span>
                  <b>{money(row.value)}</b>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "performance" ? (
          <>
            <section className="insights-grid performance-kpis">
              <article className="insight-card"><span>Donem baslangici</span><strong>{money(performanceStats.first?.totalValue || totals.totalValue)}</strong></article>
              <article className={performanceStats.periodChange >= 0 ? "insight-card green" : "insight-card red"}><span>Donem degisimi</span><TrendValue trend={performanceStats.periodChange}>{signedMoney(performanceStats.periodChange)}</TrendValue></article>
              <article className={performanceStats.investmentGain >= 0 ? "insight-card green" : "insight-card red"}><span>Yatirim getirisi</span><TrendValue trend={performanceStats.investmentGain}>{signedMoney(performanceStats.investmentGain)}</TrendValue><small>{signedPct(performanceStats.realReturnRate)}</small></article>
              <article className={performanceStats.netCashFlow >= 0 ? "insight-card green" : "insight-card red"}><span>Net nakit akisi</span><TrendValue trend={performanceStats.netCashFlow}>{signedMoney(performanceStats.netCashFlow)}</TrendValue></article>
              <article className={performanceStats.monthChange >= 0 ? "insight-card green" : "insight-card red"}><span>Bu ay</span><TrendValue trend={performanceStats.monthChange}>{signedMoney(performanceStats.monthChange)}</TrendValue></article>
            </section>

            <section className="panel real-return-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Gercek Getiri Hesabi</h2>
                  <p>Para yatirma ve cekme hareketleri ayrilarak yatirimin kendi performansi hesaplanir.</p>
                </div>
              </div>
              <div className="return-grid">
                <article>
                  <span>Toplam yatirilan para</span>
                  <strong>{money(cashFlowSummary.totalDeposits)}</strong>
                  <small>{cashFlowSummary.flowCount ? "Nakit akisi kayitlarindan" : "Henuz nakit kaydi yok"}</small>
                </article>
                <article>
                  <span>Toplam cekilen para</span>
                  <strong>{money(cashFlowSummary.totalWithdrawals)}</strong>
                  <small>Portfoyden cikislar</small>
                </article>
                <article>
                  <span>Net yatirilan ana para</span>
                  <strong>{money(cashFlowSummary.effectivePrincipal)}</strong>
                  <small>{cashFlowSummary.flowCount ? "Yatirilan eksi cekilen" : "Varlik maliyeti baz alindi"}</small>
                </article>
                <article className={cashFlowSummary.realProfit >= 0 ? "positive-card" : "negative-card"}>
                  <span>Yatirimdan olusan net kazanc</span>
                  <TrendValue trend={cashFlowSummary.realProfit}>{signedMoney(cashFlowSummary.realProfit)}</TrendValue>
                  <small>{signedPct(cashFlowSummary.realReturnRate)}</small>
                </article>
              </div>
              <div className="return-breakdown">
                <div><span>Donem portfoy buyumesi</span><strong>{signedMoney(performanceStats.periodChange)}</strong></div>
                <div><span>Donem nakit etkisi</span><strong>{signedMoney(performanceStats.netCashFlow)}</strong></div>
                <div><span>Donem gercek yatirim getirisi</span><strong className={performanceStats.investmentGain >= 0 ? "positive" : "negative"}>{signedMoney(performanceStats.investmentGain)} · {signedPct(performanceStats.realReturnRate)}</strong></div>
              </div>
            </section>

            <section className="panel visual-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Portfoy Deger Gecmisi</h2>
                  <p>Guncel deger ve yatirilan ana para cizgileri. Yeni kayitlar bugunden itibaren birikir.</p>
                </div>
                <div className="range-tabs">
                  {rangeOptions.map((option) => (
                    <button
                      key={option.key}
                      className={historyRange === option.key ? "active" : ""}
                      onClick={() => {
                        setHistoryRange(option.key);
                        setHoveredHistoryIndex(null);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="history-chart-wrap">
                <div className="chart-summary-row">
                  <span>En yuksek: <strong>{money(performanceStats.high)}</strong></span>
                  <span>En dusuk: <strong>{money(performanceStats.low)}</strong></span>
                  <span>Kayit sayisi: <strong>{historySeries.length}</strong></span>
                </div>
                <div className="history-chart-stage" onMouseLeave={() => setHoveredHistoryIndex(null)}>
                  <svg className="history-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Portfoy performans grafigi">
                    <line x1="0" y1="92" x2="100" y2="92" />
                    <line x1="0" y1="50" x2="100" y2="50" />
                    <line x1="0" y1="8" x2="100" y2="8" />
                    <polyline className="cost-line" points={chartPoints("totalCost")} />
                    <polyline className="value-line" points={chartPoints("totalValue")} />
                    <g className="daily-candles" aria-label="Gunluk yukselis ve dusus igneleri">
                      {dailyCandles.map((candle) => (
                        <g className={`history-candle ${candle.trend}`} key={candle.date}>
                          <line className="candle-wick" x1={candle.x} x2={candle.x} y1={candle.highY} y2={candle.lowY} />
                          <rect
                            className="candle-body"
                            x={candle.x - candle.width / 2}
                            y={candle.bodyY}
                            width={candle.width}
                            height={candle.bodyHeight}
                            rx="0.35"
                          />
                        </g>
                      ))}
                    </g>
                    {hoveredHistoryIndex !== null && dailyCandles[hoveredHistoryIndex] && (
                      <g className="history-hover-markers">
                        <line x1={dailyCandles[hoveredHistoryIndex].x} x2={dailyCandles[hoveredHistoryIndex].x} y1="8" y2="92" />
                        <circle className="value-marker" cx={dailyCandles[hoveredHistoryIndex].x} cy={chartY(historySeries[hoveredHistoryIndex].totalValue)} r="1.15" />
                        <circle className="cost-marker" cx={dailyCandles[hoveredHistoryIndex].x} cy={chartY(historySeries[hoveredHistoryIndex].totalCost)} r="1.15" />
                      </g>
                    )}
                    <g className="history-hit-zones">
                      {dailyCandles.map((candle, index) => {
                        const hitWidth = Math.max(4, 96 / Math.max(dailyCandles.length, 1));
                        return (
                          <rect
                            key={candle.date}
                            x={Math.max(0, candle.x - hitWidth / 2)}
                            y="0"
                            width={Math.min(hitWidth, 100 - Math.max(0, candle.x - hitWidth / 2))}
                            height="100"
                            onMouseEnter={() => setHoveredHistoryIndex(index)}
                            onTouchStart={() => setHoveredHistoryIndex(index)}
                          />
                        );
                      })}
                    </g>
                  </svg>
                  {hoveredHistoryIndex !== null && historySeries[hoveredHistoryIndex] && dailyCandles[hoveredHistoryIndex] && (
                    <div
                      className={`history-tooltip ${dailyCandles[hoveredHistoryIndex].x < 24 ? "align-left" : dailyCandles[hoveredHistoryIndex].x > 76 ? "align-right" : ""}`}
                      style={{ left: `${dailyCandles[hoveredHistoryIndex].x}%` }}
                    >
                      <strong>{historySeries[hoveredHistoryIndex].date.split("-").reverse().join(".")}</strong>
                      <span><i className="tooltip-value-dot" />Guncel deger <b>{money(historySeries[hoveredHistoryIndex].totalValue)}</b></span>
                      <span><i className="tooltip-cost-dot" />Ana para <b>{money(historySeries[hoveredHistoryIndex].totalCost)}</b></span>
                      <span className={dailyCandles[hoveredHistoryIndex].change >= 0 ? "positive" : "negative"}>Gunluk degisim <b>{signedMoney(dailyCandles[hoveredHistoryIndex].change)}</b></span>
                    </div>
                  )}
                </div>
                <div className="history-date-axis" aria-label="Grafik tarihleri">
                  {historySeries.map((item, index) => {
                    const interval = Math.max(1, Math.ceil(historySeries.length / 7));
                    const visible = index === 0 || index === historySeries.length - 1 || index % interval === 0;
                    return visible ? <span key={item.date}>{item.date.slice(8, 10)}.{item.date.slice(5, 7)}</span> : null;
                  })}
                </div>
                <div className="chart-legend">
                  <span><i className="value-swatch" /> Guncel deger</span>
                  <span><i className="cost-swatch" /> Ana para</span>
                  <span><i className="daily-up-swatch" /> Gunluk yukselis</span>
                  <span><i className="daily-down-swatch" /> Gunluk dusus</span>
                </div>
              </div>
            </section>

            <section className="panel cash-flow-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Nakit Akisi</h2>
                  <p>Yeni para yatirma ve para cekme kayitlari gercek getiriyi ayirmak icin kullanilir.</p>
                </div>
              </div>
              <div className="cash-flow-body">
                <form className="cash-flow-form" onSubmit={(event) => void submitCashFlow(event)}>
                  <select value={cashDraft.type} onChange={(event) => setCashDraft({ ...cashDraft, type: event.target.value as CashFlow["type"] })}>
                    <option value="deposit">Para yatirma</option>
                    <option value="withdrawal">Para cekme</option>
                  </select>
                  <input className="input" type="date" value={cashDraft.date} onChange={(event) => setCashDraft({ ...cashDraft, date: event.target.value })} />
                  <input className="input" value={cashDraft.amount} onChange={(event) => setCashDraft({ ...cashDraft, amount: event.target.value })} placeholder="Tutar" />
                  <input className="input" value={cashDraft.note} onChange={(event) => setCashDraft({ ...cashDraft, note: event.target.value })} placeholder="Not" />
                  <button className="primary">{editingCashFlowId ? "Guncelle" : "Kaydet"}</button>
                  {editingCashFlowId ? <button type="button" className="secondary" onClick={cancelCashFlowEdit}>Vazgec</button> : null}
                </form>
                <div className="cash-flow-list">
                  {state.cashFlows.length ? [...state.cashFlows].map(normalizeCashFlow).sort((left, right) => right.date.localeCompare(left.date)).slice(0, 8).map((flow) => (
                    <div className="cash-flow-row" key={flow.id}>
                      <span className={flow.type === "deposit" ? "positive" : "negative"}>{flow.type === "deposit" ? "Para yatirma" : "Para cekme"}</span>
                      <strong>{money(flow.amount)}</strong>
                      <small>{flow.date}{flow.note ? ` · ${flow.note}` : ""}</small>
                      <button className="icon-btn" onClick={() => editCashFlow(flow)} title="Duzenle">D</button>
                      <button className="icon-btn" onClick={() => void deleteCashFlow(flow.id)} title="Sil">x</button>
                    </div>
                  )) : <div className="empty">Henuz nakit akisi kaydi yok. Ilk kayit sonraki performans hesaplarini daha dogru yapar.</div>}
                </div>
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "targets" ? (
          <>
            <section className="insights-grid target-kpis">
              <article className="insight-card"><span>Hedef toplam</span><strong className={Math.abs(targetTotal - 100) <= 0.01 ? "positive" : "negative"}>{pct(targetTotal)}</strong><small>Ideal toplam %100</small></article>
              <article className={rebalanceHealth.score >= 75 ? "insight-card green" : rebalanceHealth.score >= 55 ? "insight-card gold" : "insight-card red"}><span>Denge skoru</span><strong>{rebalanceHealth.score.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}/100</strong><small>Hedefe yakinlik</small></article>
              <article className={rebalanceHealth.missingCount ? "insight-card red" : "insight-card green"}><span>Eksik sinif</span><strong>{rebalanceHealth.missingCount}</strong><small>Hedefin altinda</small></article>
              <article className={rebalanceHealth.overCount ? "insight-card red" : "insight-card green"}><span>Fazla sinif</span><strong>{rebalanceHealth.overCount}</strong><small>Hedefin ustunde</small></article>
              <article className="insight-card"><span>En buyuk sapma</span><strong>{pct(rebalanceHealth.maxDeviation)}</strong><small>Mutlak fark</small></article>
            </section>

            <section className="panel targets-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Hedef Portfoy Dagilimi</h2>
                  <p>Varlik siniflari icin hedef oran belirle; uygulama mevcut dagilimla farki hesaplasin.</p>
                </div>
                <button className="secondary" onClick={() => void resetTargetAllocations()}>Varsayilana don</button>
              </div>
              <div className="target-settings-grid">
                {targetRows.map((row) => (
                  <label className="target-input" key={row.key}>
                    <span><i style={{ background: groupColors[row.key] || "#647181" }} />{row.label}</span>
                    <input
                      className="input"
                      value={row.targetShare || ""}
                      onChange={(event) => void updateTargetAllocation(row.key, event.target.value)}
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="panel visual-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Mevcut / Hedef Karsilastirma</h2>
                  <p>Eksik, fazla ve dengeli siniflari tek tabloda gosterir.</p>
                </div>
              </div>
              <div className="target-table-wrap">
                <table className="target-table">
                  <thead>
                    <tr><th>Sinif</th><th>Mevcut</th><th>Hedef</th><th>Fark</th><th>Tutar Farki</th><th>Durum</th></tr>
                  </thead>
                  <tbody>
                    {targetRows.map((row) => (
                      <tr key={row.key}>
                        <td><span className="target-label"><i style={{ background: groupColors[row.key] || "#647181" }} />{row.label}</span></td>
                        <td>{pct(row.currentShare)}</td>
                        <td>{pct(row.targetShare)}</td>
                        <td className={row.gapShare >= 0 ? "positive" : "negative"}>{signedPct(row.gapShare)}</td>
                        <td className={row.gapValue >= 0 ? "positive" : "negative"}>{signedMoney(row.gapValue)}</td>
                        <td><span className={`target-status ${row.status}`}>{row.status === "balanced" ? "Dengeli" : row.status === "missing" ? "Eksik" : "Fazla"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel rebalance-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Yeni Yatirim Dagitim Onerisi</h2>
                  <p>Girecegin yeni yatirim tutarini hedefe en uzak eksik siniflara dagitir.</p>
                </div>
                <label className="rebalance-amount">Yeni yatirim tutari
                  <input
                    className="input"
                    value={state.settings.rebalanceAmount || ""}
                    onChange={(event) => void updateRebalanceAmount(event.target.value)}
                  />
                </label>
              </div>
              <div className="rebalance-list">
                {rebalanceSuggestions.filter((row) => row.suggestedAmount > 0).length ? rebalanceSuggestions.filter((row) => row.suggestedAmount > 0).map((row) => (
                  <div className="rebalance-row" key={row.key}>
                    <span><i style={{ background: groupColors[row.key] || "#647181" }} />{row.label}</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(3, (row.suggestedAmount / Math.max(state.settings.rebalanceAmount || 1, 1)) * 100)}%`, background: groupColors[row.key] || "#647181" }} /></div>
                    <strong>{money(row.suggestedAmount)}</strong>
                  </div>
                )) : <div className="empty">Hedefe gore eksik sinif yok. Yeni yatirim icin portfoy zaten dengeli gorunuyor.</div>}
              </div>
            </section>

            <section className="panel asset-target-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Varlik Bazinda Hedef Onerileri</h2>
                  <p>Yeni yatirim tutarini eksik kalan siniflarin icindeki varliklara pratik sekilde paylastirir.</p>
                </div>
              </div>
              <div className="asset-target-list">
                {assetTargetSuggestions.length ? assetTargetSuggestions.map((row) => {
                  const approximateQuantity = row.asset.price > 0 ? row.suggestedAmount / (row.asset.price * (row.asset.fxRate || 1)) : 0;
                  const targetHint = row.targetShare > 0 ? `Hedef pay ${pct(row.targetShare)}` : row.reason;
                  return (
                    <div className="asset-target-row" key={`${row.groupKey}-${row.asset.id}`}>
                      <AssetLogo asset={row.asset} color={row.color} />
                      <div>
                        <strong>{row.asset.ticker}</strong>
                        <small>{row.groupLabel} · {targetHint}</small>
                      </div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(3, (row.suggestedAmount / Math.max(state.settings.rebalanceAmount || 1, 1)) * 100)}%`, background: row.color }} /></div>
                      <span>{approximateQuantity > 0 ? `${num(approximateQuantity)} adet` : "-"}</span>
                      <b>{money(row.suggestedAmount)}</b>
                    </div>
                  );
                }) : <div className="empty">Varlik bazinda oneriyi hesaplamak icin yeni yatirim tutari ve hedefte eksik kalan bir sinif gerekir.</div>}
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "watchlist" ? (
          <>
            <section className="insights-grid watch-kpis">
              <article className="insight-card"><span>Izlenen varlik</span><strong>{watchSummary.total}</strong><small>Portfoy disi takip listesi</small></article>
              <article className={watchSummary.buyZone ? "insight-card green" : "insight-card"}><span>Alim bolgesinde</span><strong>{watchSummary.buyZone}</strong><small>Hedef fiyatin altinda veya esit</small></article>
              <article className={watchSummary.closest?.gapRate && watchSummary.closest.gapRate <= 0 ? "insight-card green" : "insight-card gold"}><span>Hedefe en yakin</span><strong>{watchSummary.closest?.item.ticker || "-"}</strong><small>{watchSummary.closest ? signedPct(watchSummary.closest.gapRate) : "Kayit yok"}</small></article>
              <article className={watchSummary.errors ? "insight-card red" : "insight-card green"}><span>Fiyat hatasi</span><strong>{watchSummary.errors}</strong><small>{watchSummary.errors ? "Kontrol gerekiyor" : "Kaynaklar sakin"}</small></article>
            </section>

            <section className="panel watch-form-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Alim Firsati / Izleme Listesi</h2>
                  <p>Portfoye eklemeden once fiyatini, hedef seviyeni ve notunu takip et.</p>
                </div>
              </div>
              <form className="watch-form" onSubmit={(event) => void submitWatchItem(event)}>
                <label>Kod
                  <input
                    className="input"
                    placeholder="AFT, TUPRS, AVAX/TRY..."
                    value={watchDraft.ticker}
                    onChange={(event) => setWatchDraft({ ...watchDraft, ticker: event.target.value.toUpperCase() })}
                  />
                </label>
                <label>Hedef fiyat
                  <input
                    className="input"
                    inputMode="decimal"
                    placeholder="Orn. 280"
                    value={watchDraft.targetPrice}
                    onChange={(event) => setWatchDraft({ ...watchDraft, targetPrice: event.target.value })}
                  />
                </label>
                <label>Hedef pay (%)
                  <input
                    className="input"
                    inputMode="decimal"
                    placeholder="Istege bagli"
                    value={watchDraft.targetWeight}
                    onChange={(event) => setWatchDraft({ ...watchDraft, targetWeight: event.target.value })}
                  />
                </label>
                <label>Not
                  <input
                    className="input"
                    placeholder="Alim sebebi, destek seviyesi..."
                    value={watchDraft.note}
                    onChange={(event) => setWatchDraft({ ...watchDraft, note: event.target.value })}
                  />
                </label>
                <button className="primary">Listeye ekle</button>
              </form>
            </section>

            <section className="watchlist-grid">
              {watchRows.length ? watchRows.map((row) => (
                <article className={`watch-card ${row.status.tone}`} key={row.item.id}>
                  <div className="watch-card-head">
                    <AssetLogo asset={row.asset} color={groupColors[assetGroupKey(row.asset)] || "#647181"} />
                    <div>
                      <strong>{row.item.ticker}</strong>
                      <span>{row.item.name}</span>
                    </div>
                    <span className={`watch-status ${row.status.tone}`}>{row.status.label}</span>
                  </div>
                  <div className="watch-price-grid">
                    <div><span>Guncel</span><strong>{row.currentPrice ? money(row.currentPrice, row.item.currency || "TRY") : "-"}</strong></div>
                    <div><span>Hedef</span><strong>{row.targetPrice ? money(row.targetPrice, row.item.currency || "TRY") : "-"}</strong></div>
                    <div><span>Fark</span><strong className={row.gapRate <= 0 && row.targetPrice ? "positive" : "negative"}>{row.targetPrice && row.currentPrice ? signedPct(row.gapRate) : "-"}</strong></div>
                    <div><span>Hedef pay</span><strong>{row.item.targetWeight ? pct(row.item.targetWeight) : "-"}</strong></div>
                  </div>
                  {row.item.note ? <p className="watch-note">{row.item.note}</p> : null}
                  <div className="watch-meta">
                    <span>{row.item.priceSource} / {row.item.priceSymbol}</span>
                    <span>{row.item.lastPriceAt ? formatAge(row.item.lastPriceAt) : "Fiyat kaydi yok"}</span>
                  </div>
                  {row.item.lastPriceError ? <div className="form-error">{row.item.lastPriceError}</div> : null}
                  <div className="watch-actions">
                    <button className="secondary" onClick={() => void refreshWatchItem(row.item.id)}>Yenile</button>
                    <button className="secondary" onClick={() => moveWatchItemToAssetDraft(row.item)}>Portfoye aktar</button>
                    <button className="icon-button" onClick={() => void deleteWatchItem(row.item.id)}>×</button>
                  </div>
                </article>
              )) : (
                <section className="panel">
                  <div className="empty">Henuz izleme listesi yok. Almayi dusundugun varliklari buraya ekleyebilirsin.</div>
                </section>
              )}
            </section>
          </>
        ) : null}

        {activeTab === "comparison" ? (
          <>
            <section className="insights-grid comparison-kpis">
              <article className="insight-card"><span>Secili donem</span><strong>{rangeOptions.find((item) => item.key === historyRange)?.label || "1 Ay"}</strong><small>Portfoy gecmisi baz alinir</small></article>
              <article className={(comparisonRows[0]?.returnRate || 0) >= 0 ? "insight-card green" : "insight-card red"}><span>Portfoy getirisi</span><TrendValue trend={comparisonRows[0]?.returnRate || 0}>{signedPct(comparisonRows[0]?.returnRate || 0)}</TrendValue><small>Nakit etkisi ayrildi</small></article>
              <article className="insight-card"><span>En iyi benchmark</span><strong>{benchmarkLeader?.label || "-"}</strong><small>{signedPct(benchmarkLeader?.returnRate || 0)}</small></article>
              <article className={(comparisonRows[0]?.returnRate || 0) - (benchmarkLeader?.returnRate || 0) >= 0 ? "insight-card green" : "insight-card red"}><span>Lidere fark</span><TrendValue trend={(comparisonRows[0]?.returnRate || 0) - (benchmarkLeader?.returnRate || 0)}>{signedPct((comparisonRows[0]?.returnRate || 0) - (benchmarkLeader?.returnRate || 0))}</TrendValue><small>Yuzde puan</small></article>
              <article className="insight-card"><span>Kayitli veri</span><strong>{state.benchmarkHistory.length}</strong><small>Benchmark noktasi</small></article>
            </section>

            <section className="panel comparison-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Benchmark Karsilastirmasi</h2>
                  <p>Portfoy getirini alternatif piyasalarla ayni donemde yan yana gosterir.</p>
                </div>
                <div className="range-tabs">
                  {rangeOptions.map((option) => (
                    <button
                      key={option.key}
                      className={historyRange === option.key ? "active" : ""}
                      onClick={() => setHistoryRange(option.key)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="comparison-actions">
                <button className="primary" onClick={() => void updateBenchmarksOnly()} disabled={loading}>Benchmarklari guncelle</button>
                <span>Benchmark gecmisi bugunden itibaren birikir; eski donemler icin veri yoksa getiri %0 gorunebilir.</span>
              </div>
              <div className="benchmark-grid">
                {comparisonRows.map((row) => (
                  <article className={row.returnRate >= 0 ? "benchmark-card positive-card" : "benchmark-card negative-card"} key={row.code}>
                    <span><i style={{ background: row.color }} />{row.label}</span>
                    <strong>{signedPct(row.returnRate)}</strong>
                    <small>{row.code === "portfolio" ? "Gercek portfoy getirisi" : row.points ? `${row.points} kayit · Son ${row.lastDate}` : "Henuz veri yok"}</small>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel visual-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Portfoy - Benchmark Farki</h2>
                  <p>Pozitif fark portfoyun ilgili benchmarktan daha iyi performans gosterdigini anlatir.</p>
                </div>
              </div>
              <div className="comparison-table-wrap">
                <table className="comparison-table">
                  <thead>
                    <tr><th>Olcut</th><th>Ilk Deger</th><th>Son Deger</th><th>Getiri</th><th>Portfoye Gore Fark</th><th>Durum</th></tr>
                  </thead>
                  <tbody>
                    {comparisonRows.filter((row) => row.code !== "portfolio").map((row) => (
                      <tr key={row.code}>
                        <td><span className="benchmark-label"><i style={{ background: row.color }} />{row.label}</span></td>
                        <td>{row.firstPrice ? num(row.firstPrice) : "-"}</td>
                        <td>{row.latestPrice ? num(row.latestPrice) : "-"}</td>
                        <td className={row.returnRate >= 0 ? "positive" : "negative"}>{signedPct(row.returnRate)}</td>
                        <td className={row.difference >= 0 ? "positive" : "negative"}>{signedPct(row.difference)}</td>
                        <td><span className={`target-status ${row.difference >= 0 ? "balanced" : "over"}`}>{row.difference >= 0 ? "Onde" : "Geride"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "fundOverlap" ? (
          <>
            <section className="insights-grid fund-kpis">
              <article className="insight-card"><span>Takip edilen fon</span><strong>{fundAssets.length}</strong><small>Portfoydeki fon sayisi</small></article>
              <article className={fundLookthrough.coverage >= 80 ? "insight-card green" : fundLookthrough.coverage >= 40 ? "insight-card gold" : "insight-card red"}><span>Icerik kapsami</span><strong>{pct(fundLookthrough.coverage)}</strong><small>{fundLookthrough.fundsWithData} fon icin veri var</small></article>
              <article className={fundLookthrough.topOverlap ? "insight-card gold" : "insight-card green"}><span>En yuksek ortusme</span><strong>{fundLookthrough.topOverlap ? `${fundLookthrough.topOverlap.left}/${fundLookthrough.topOverlap.right}` : "-"}</strong><small>{fundLookthrough.topOverlap ? `${pct(fundLookthrough.topOverlap.overlap)} ortak agirlik` : "Ortak pozisyon yok"}</small></article>
              <article className="insight-card"><span>En buyuk dolayli varlik</span><strong>{fundLookthrough.indirectRows[0]?.symbol || "-"}</strong><small>{fundLookthrough.indirectRows[0] ? `${money(fundLookthrough.indirectRows[0].indirectValue)} - ${pct(fundLookthrough.indirectRows[0].portfolioShare)}` : "Veri yok"}</small></article>
              <article className="insight-card"><span>Icerik kaydi</span><strong>{fundLookthrough.holdingRows.length}</strong><small>Fon ici pozisyon</small></article>
            </section>

            <section className="panel fund-overlap-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Fonlar Arasi Ortusme</h2>
                  <p>Ayni alt varliklari tasiyan fonlari yakalar; oranlar fon ici agirliklarin kesisimini gosterir.</p>
                </div>
              </div>
              <div className="overlap-grid">
                <div className="table-scroll">
                  <table className="fund-overlap-table">
                    <thead>
                      <tr><th>Fon cifti</th><th>Ortak varlik</th><th>Ortusme</th><th>Ortak kodlar</th></tr>
                    </thead>
                    <tbody>
                      {fundLookthrough.pairs.length ? fundLookthrough.pairs.map((pair) => (
                        <tr key={`${pair.left}-${pair.right}`}>
                          <td><strong>{pair.left} / {pair.right}</strong></td>
                          <td>{pair.commonCount}</td>
                          <td><span className={pair.overlap >= 15 ? "target-status over" : pair.overlap >= 7 ? "target-status missing" : "target-status balanced"}>{pct(pair.overlap)}</span></td>
                          <td>{pair.commonSymbols.slice(0, 6).join(", ")}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4}><div className="empty">Kayitli fon iceriklerinde henuz ortak varlik bulunmuyor.</div></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="fund-note-card">
                  <span>Okuma notu</span>
                  <strong>Bu ekran kayitli fon icerik veri setiyle hesaplanir.</strong>
                  <p>Fon sirketleri portfoy dagilimini belirli araliklarla aciklar. Veri setini guncelledikce dolayli maruziyet, sektor ve ulke dagilimi de otomatik yenilenir.</p>
                </div>
              </div>
            </section>

            <section className="panel visual-panel fund-lookthrough-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Dolayli Varlik Maruziyeti</h2>
                  <p>Fonlar uzerinden portfoye dolayli olarak giren en buyuk sirket, tema ve emtia pozisyonlari.</p>
                </div>
              </div>
              <div className="lookthrough-list">
                {fundLookthrough.indirectRows.length ? fundLookthrough.indirectRows.slice(0, 10).map((row, index) => (
                  <div className="lookthrough-row" key={row.symbol}>
                    <span className="rank">{index + 1}</span>
                    <div className="holding-token">{row.symbol.slice(0, 2)}</div>
                    <div>
                      <strong>{row.symbol}</strong>
                      <small>{row.name} - {row.funds.join(", ")}</small>
                    </div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(3, row.portfolioShare * 3)}%`, background: "#3f7f8f" }} /></div>
                    <span>{pct(row.portfolioShare)}</span>
                    <b>{money(row.indirectValue)}</b>
                  </div>
                )) : <div className="empty">Fon icerigi eklendiginde dolayli varliklar burada gorunecek.</div>}
              </div>
            </section>

            <section className="fund-exposure-grid">
              <div className="panel exposure-panel">
                <div className="panel-header compact"><div><h2>Sektor Maruziyeti</h2><p>Fon iceriklerinden gelen dolayli sektor agirligi.</p></div></div>
                <div className="exposure-list">
                  {fundLookthrough.sectors.slice(0, 8).map((row) => (
                    <div className="exposure-row" key={row.label}>
                      <span>{row.label}</span>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(3, row.share * 3)}%`, background: "#193a6a" }} /></div>
                      <strong>{pct(row.share)}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel exposure-panel">
                <div className="panel-header compact"><div><h2>Ulke / Tema Maruziyeti</h2><p>Fonlarin ulke veya bolge kesisimleri.</p></div></div>
                <div className="exposure-list">
                  {fundLookthrough.countries.slice(0, 8).map((row) => (
                    <div className="exposure-row" key={row.label}>
                      <span>{row.label}</span>
                      <div className="bar-track"><div className="bar-fill accent" style={{ width: `${Math.max(3, row.share * 3)}%` }} /></div>
                      <strong>{pct(row.share)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="panel fund-dataset-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Fon Icerik Veri Seti</h2>
                  <p>Yeni fon veya alt varlik ekle; ayni sembol tekrar eklenirse ilgili kayit guncellenir.</p>
                </div>
                <div className="row-actions">
                  <button className="primary" onClick={() => void syncFundHoldings()} disabled={loading || !fundAssets.length}>Otomatik doldur</button>
                </div>
              </div>
              {fundSyncStatus ? <div className={`fund-sync-status ${/guncellendi/i.test(fundSyncStatus) ? "success" : ""}`}>{fundSyncStatus}</div> : null}
              <form className="fund-holding-form" onSubmit={(event) => void saveFundHolding(event)}>
                <label>Fon
                  <select value={fundHoldingDraft.fundCode || fundAssets[0]?.asset.ticker || ""} onChange={(event) => setFundHoldingDraft({ ...fundHoldingDraft, fundCode: event.target.value })}>
                    {fundAssets.map((row) => <option key={row.asset.id} value={compactCode(row.asset.ticker)}>{compactCode(row.asset.ticker)} - {row.asset.name}</option>)}
                    {!fundAssets.length ? <option value="">Fon yok</option> : null}
                  </select>
                </label>
                <label>Sembol
                  <input className="input" value={fundHoldingDraft.symbol} onChange={(event) => setFundHoldingDraft({ ...fundHoldingDraft, symbol: event.target.value })} placeholder="MSFT" />
                </label>
                <label>Ad
                  <input className="input" value={fundHoldingDraft.name} onChange={(event) => setFundHoldingDraft({ ...fundHoldingDraft, name: event.target.value })} placeholder="Microsoft" />
                </label>
                <label>Fon ici agirlik (%)
                  <input className="input" value={fundHoldingDraft.weight} onChange={(event) => setFundHoldingDraft({ ...fundHoldingDraft, weight: event.target.value })} placeholder="8,5" />
                </label>
                <label>Sektor
                  <input className="input" value={fundHoldingDraft.sector} onChange={(event) => setFundHoldingDraft({ ...fundHoldingDraft, sector: event.target.value })} placeholder="Teknoloji" />
                </label>
                <label>Ulke / Tema
                  <input className="input" value={fundHoldingDraft.country} onChange={(event) => setFundHoldingDraft({ ...fundHoldingDraft, country: event.target.value })} placeholder="ABD" />
                </label>
                <button className="primary" disabled={!fundAssets.length}>Kaydet</button>
              </form>
              <div className="fund-dataset-list">
                {fundAssets.map((fundRow) => {
                  const code = compactCode(fundRow.asset.ticker || fundRow.asset.priceSymbol);
                  const holdings = fundLookthrough.settings.fundHoldings[code] || [];
                  const sourceText = holdings[0]?.source || "Manuel veri";
                  const asOfText = holdings[0]?.asOf ? ` · ${holdings[0].asOf}` : "";
                  const totalInfo = fundLookthrough.fundTotals[code] || { knownWeight: 0, missingWeight: 100, overWeight: 0 };
                  return (
                    <article className="fund-dataset-card" key={fundRow.asset.id}>
                      <div className="fund-dataset-head">
                        <AssetLogo asset={fundRow.asset} color={groupColors.fund} />
                        <div><strong>{code}</strong><small>{holdings.length} kayit · {sourceText}{asOfText} · Fon degeri {money(fundRow.value)}</small></div>
                        <button className="secondary mini-action" onClick={() => void syncFundHoldings(code)} disabled={loading} type="button">Yenile</button>
                      </div>
                      <div className={totalInfo.overWeight > 0 ? "fund-total-strip warning" : totalInfo.missingWeight > 0.05 ? "fund-total-strip" : "fund-total-strip complete"}>
                        <span>Kayitli agirlik {pct(totalInfo.knownWeight)}</span>
                        <strong>{totalInfo.overWeight > 0 ? `${pct(totalInfo.overWeight)} fazla` : totalInfo.missingWeight > 0.05 ? `${pct(totalInfo.missingWeight)} diger / aciklanmayan kisim` : "Toplam %100"}</strong>
                      </div>
                      <div className="fund-dataset-rows">
                        {holdings.length ? holdings.map((holding) => (
                          <div className="fund-dataset-row" key={holding.id}>
                            <span>{holding.symbol}</span>
                            <strong>{holding.name}</strong>
                            <small>{holding.sector} - {holding.country}</small>
                            <b>{pct(holding.weight)}</b>
                            <button className="icon-btn" onClick={() => void deleteFundHolding(code, holding.id)} title="Sil" type="button">x</button>
                          </div>
                        )) : <div className="empty">Bu fon icin icerik kaydi yok.</div>}
                        {totalInfo.missingWeight > 0.05 ? (
                          <div className="fund-dataset-row residual">
                            <span>DIGER</span>
                            <strong>Diger / aciklanmayan kisim</strong>
                            <small>Diger - Belirtilmedi</small>
                            <b>{pct(totalInfo.missingWeight)}</b>
                            <i />
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "dataStatus" ? (
          <>
            <section className="insights-grid data-status-kpis">
              <article className={dataStatusSummary.score >= 80 ? "insight-card green" : dataStatusSummary.score >= 55 ? "insight-card gold" : "insight-card red"}>
                <span>Veri sagligi</span>
                <strong>{dataStatusSummary.score.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}/100</strong>
                <small>Fiyat kaynaklari genel durumu</small>
              </article>
              <article className="insight-card green"><span>Guncel</span><strong>{dataStatusSummary.fresh}</strong><small>24 saatten yeni fiyat</small></article>
              <article className={dataStatusSummary.stale ? "insight-card gold" : "insight-card green"}><span>Eski / kayitsiz</span><strong>{dataStatusSummary.stale}</strong><small>Kontrol gerekebilir</small></article>
              <article className={dataStatusSummary.error ? "insight-card red" : "insight-card green"}><span>Hata</span><strong>{dataStatusSummary.error}</strong><small>Kaynak okunamadi</small></article>
              <article className="insight-card"><span>Manuel / kapali</span><strong>{dataStatusSummary.manual + dataStatusSummary.disabled}</strong><small>Otomatik izlenmiyor</small></article>
            </section>

            <section className="panel data-source-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Kaynak Ozeti</h2>
                  <p>Binance, Yahoo, TradingView, Is Portfoy ve manuel kaynaklarin anlik saglik durumu.</p>
                </div>
                <button className="primary" onClick={() => void updatePrices()} disabled={loading}>Tum fiyatlari yenile</button>
              </div>
              <div className="source-grid">
                {dataStatusSummary.sources.map((source) => (
                  <article className={source.error ? "source-card error" : source.stale ? "source-card warning" : "source-card ok"} key={source.source}>
                    <span>{source.source}</span>
                    <strong>{source.total} varlik</strong>
                    <small>{source.fresh} guncel · {source.stale} eski · {source.error} hata</small>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel data-status-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Fiyat Guncelleme Merkezi</h2>
                  <p>Her varligin fiyat kaynagi, son basarili guncellemesi ve hata kaydi.</p>
                </div>
              </div>
              <div className="table-scroll">
                <table className="data-status-table">
                  <thead>
                    <tr><th>Varlik</th><th>Kaynak</th><th>Son guncelleme</th><th>Durum</th><th>Hata</th><th /></tr>
                  </thead>
                  <tbody>
                    {dataStatusRows.length ? dataStatusRows.map((row) => (
                      <tr key={row.asset.id}>
                        <td>
                          <button className="asset-name asset-detail-trigger" onClick={() => openAssetDetail(row.asset)} title="Varlik detayini ac">
                            <AssetLogo asset={row.asset} color={groupColors[assetGroupKey(row.asset)] || "#647181"} small />
                            <div>
                              <strong>{row.asset.ticker}</strong>
                              <small>{row.asset.name}</small>
                            </div>
                          </button>
                        </td>
                        <td><span className="source-label">{row.sourceLabel}</span></td>
                        <td>
                          <strong>{row.asset.lastPriceAt ? formatTime(row.asset.lastPriceAt) : "-"}</strong>
                          <small className="muted-block">{row.lastLabel}</small>
                        </td>
                        <td><span className={`data-status-badge ${row.tone}`}>{row.label}</span></td>
                        <td className="data-error-cell">{row.asset.lastPriceError || "-"}</td>
                        <td className="row-actions wide-actions">
                          <button className="icon-btn text-btn" onClick={() => void refreshAssetPrice(row.asset.id)} disabled={loading || row.asset.priceSource === "manual"} title="Tek varligi yenile">Yenile</button>
                          <button className="icon-btn text-btn" onClick={() => void toggleAssetAutoUpdate(row.asset.id)} disabled={loading || row.asset.priceSource === "manual"} title="Otomatik guncelleme">{row.asset.autoUpdate ? "Oto acik" : "Oto kapali"}</button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6}><div className="empty">Henuz takip edilen varlik yok.</div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "alerts" ? (
          <>
            <section className="insights-grid alert-kpis">
              <article className={alertSummary.high ? "insight-card red" : "insight-card green"}><span>Yuksek onem</span><strong>{alertSummary.high}</strong><small>Kritik takip</small></article>
              <article className={alertSummary.medium ? "insight-card gold" : "insight-card green"}><span>Orta onem</span><strong>{alertSummary.medium}</strong><small>Izleme listesi</small></article>
              <article className="insight-card"><span>Bilgi</span><strong>{alertSummary.low}</strong><small>Dusuk onem</small></article>
              <article className="insight-card"><span>Goruldu</span><strong>{alertSummary.dismissed}</strong><small>Temizlenen sinyal</small></article>
              <article className={activeAlerts.length ? "insight-card red" : "insight-card green"}><span>Aktif uyari</span><strong>{activeAlerts.length}</strong><small>Su an dikkat isteyen</small></article>
            </section>

            <section className="panel alerts-panel">
              <div className="panel-header compact">
                <div>
                  <h2>Uyari Merkezi</h2>
                  <p>Fiyat verisi, hedef dagilim, zarar ve yogunlasma sinyalleri tek ekranda.</p>
                </div>
                <div className="row-actions">
                  <button className="secondary" onClick={() => void clearActiveAlerts()} disabled={!activeAlerts.length}>Tumunu goruldu yap</button>
                  <button className="secondary" onClick={() => void resetDismissedAlerts()} disabled={!alertSummary.dismissed}>Goruldu listesini sifirla</button>
                </div>
              </div>
              <div className="alerts-list">
                {alertRows.length ? alertRows.map((alert) => (
                  <article className={`alert-row ${alert.level} ${alert.dismissed ? "dismissed" : ""}`} key={alert.id}>
                    <div className="alert-level">{alert.level === "high" ? "Yuksek" : alert.level === "medium" ? "Orta" : "Bilgi"}</div>
                    <div>
                      <span>{alert.category}</span>
                      <h3>{alert.title}</h3>
                      <p>{alert.detail}</p>
                      <small>{alert.action}</small>
                    </div>
                    <button className="secondary" onClick={() => void dismissAlert(alert.id)} disabled={alert.dismissed}>{alert.dismissed ? "Goruldu" : "Goruldu yap"}</button>
                  </article>
                )) : <div className="empty">Su an gosterilecek uyari yok.</div>}
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "projection" ? (
          <section className="panel visual-panel">
            <div className="panel-header compact">
              <div>
                <h2>Uzun Vadeli Gelecek Projeksiyonu</h2>
                <p>Bugunku deger uzerine her yil 360.000 TL ek yatirim ve yillik %16 bilesik getiri varsayimi.</p>
              </div>
            </div>
            <div className="projection-list">
              {projections.map((item) => (
                <div className="projection-row" key={item.year}>
                  <span>{item.year}. Yil</span>
                  <div className="bar-track"><div className={item.year === 10 ? "bar-fill accent" : "bar-fill"} style={{ width: `${(item.value / maxProjection) * 100}%` }} /></div>
                  <strong>{compactMoney(item.value)}</strong>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "analytics" ? (
          <section className="panel visual-panel">
            <div className="panel-header compact">
              <div>
                <h2>Portfoy Analitigi</h2>
                <p>Sinif dengesi, kategori paylari ve performans ozeti.</p>
              </div>
            </div>
            <div className="analytics-layout">
              <div className="donut-wrap">
                <div className="donut" style={{ background: donutGradient }}><span>Varlik<br />Sinifi</span></div>
              </div>
              <div className="analytics-list">
                {groupedAssets.map((group) => (
                  <div className="analytics-line" key={group.key}>
                    <span style={{ background: groupColors[group.key] || "#647181" }} />
                    <strong>{group.label}</strong>
                    <b>{pct(totals.totalValue ? (group.value / totals.totalValue) * 100 : 0)}</b>
                    <em>{money(group.value)}</em>
                  </div>
                ))}
              </div>
            </div>
            <div className="callout-grid">
              <article className="callout positive-bg"><span>En cok kazandiran</span><strong>{bestAsset?.asset.ticker || "-"}</strong><b>{bestAsset ? `${pct(bestAsset.returnRate)} (${signedMoney(bestAsset.profitLoss)})` : "%0"}</b></article>
              <article className="callout negative-bg"><span>En cok kaybettiren</span><strong>{worstAsset?.asset.ticker || "-"}</strong><b>{worstAsset ? `${pct(worstAsset.returnRate)} (${signedMoney(worstAsset.profitLoss)})` : "%0"}</b></article>
            </div>
          </section>
        ) : null}

        {activeTab === "risk" ? (
          <section className="panel risk-panel">
            <div className="risk-head">
              <div>
                <h2>Risk & Cesitlilik Notu</h2>
                <p>Portfoy dengesini, yogunlasmayi ve uzun vadeli buyume uyumunu ozetler.</p>
              </div>
              <div className="score-row">
                <div className="score-pill"><strong>{riskScore.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</strong><span>{riskLevel} Risk / 10</span></div>
                <div className="score-pill"><strong>{diversityScore.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</strong><span>Cesitlilik / 10</span></div>
              </div>
            </div>
            <div className="risk-summary-strip">
              <article><span>Oncelikli takip</span><strong>{portfolioRows[0]?.asset.ticker || "-"}</strong><small>{riskDriver}</small></article>
              <article><span>Denge hamlesi</span><strong>{biggestGroup?.label || "-"}</strong><small>Yeni yatirimlarda hedefin altinda kalan siniflara agirlik ver.</small></article>
              <article><span>Kontrol ritmi</span><strong>Aylik</strong><small>Ilk 5 agirlik ve hedef sapmasi ayda bir kontrol edilmeli.</small></article>
            </div>
            <div className="risk-metric-grid">
              {riskMetrics.map((metric) => (
                <article className={`risk-metric ${metric.tone}`} key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.detail}</small>
                </article>
              ))}
            </div>
            <div className="risk-grid">
              <article><h3>Riskin ana nedeni</h3><p>{riskDriver}</p></article>
              <article><h3>Dagilim yapisi</h3><p>Portfoy {activeGroupCount} ana sinifa dagiliyor. En buyuk sinif {biggestGroup?.label || "-"} ve payi {pct(biggestGroup?.share || 0)} seviyesinde.</p></article>
              <article><h3>Yogunlasma dengesi</h3><p>Ilk 3 varlik {pct(top3Share)}, ilk 5 varlik {pct(top5Share)} agirlik tasiyor. Bu oranlar arttikca tekil varlik etkisi guclenir.</p></article>
              <article><h3>Stratejik degerlendirme</h3><p>Hedef portfoyden en buyuk sapma {pct(maxTargetDeviation)}. Yeni yatirimlarda hedef paylara gore eksik kalan siniflara agirlik vermek dengeyi guclendirir.</p></article>
            </div>
          </section>
        ) : null}

        <section className={activeTab === "distribution" ? "panel" : "panel hidden"}>
          <div className="panel-header">
            <h2>Portfoy Varliklari</h2>
            <div className="toolbar">
              <input className="input" placeholder="Varlik ara" value={query} onChange={(event) => setQuery(event.target.value)} />
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="all">Tum turler</option>
                {types.map((type) => <option key={type}>{type}</option>)}
              </select>
              {duplicateAssetGroups.length ? <button className="secondary" onClick={() => void mergeDuplicateAssets()}>Tekrarlananlari birlestir</button> : null}
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Varlik</th><th>Adet</th><th>Toplam Maliyet</th><th>Guncel</th><th>Deger</th><th>K/Z</th><th>K/Z %</th><th />
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length ? filteredAssets.map((asset, index) => {
                  const value = asset.quantity * asset.price * (asset.fxRate || 1);
                  const cost = asset.quantity * asset.avgCost * (asset.fxRate || 1);
                  const txSummary = summarizeAssetTransactions(asset, state.transactions);
                  const netRealized = realizedNetFromSummary(txSummary);
                  const pl = value - cost + netRealized;
                  const plRateBase = historicalPerformanceBase(cost, txSummary);
                  const plRate = plRateBase ? (pl / plRateBase) * 100 : 0;
                  const previous = filteredAssets[index - 1];
                  const currentGroupKey = assetGroupKey(asset);
                  const showGroup = !previous || assetGroupKey(previous) !== currentGroupKey;
                  const group = groupedAssets.find((item) => item.key === currentGroupKey);
                  return (
                    <Fragment key={asset.id}>
                    {showGroup && group ? (
                      <tr className="group-row">
                        <td colSpan={8}>
                          <div className="group-title">
                            <span className="group-dot" style={{ background: colors[assetGroupIndex(asset) % colors.length] }} />
                            <strong>{group.label}</strong>
                            <small>{group.assets.length} varlik · Yatirilan {money(group.cost)}</small>
                            <span className={group.profitLoss >= 0 ? "group-pl positive" : "group-pl negative"}>{group.profitLoss >= 0 ? "+" : ""}{money(group.profitLoss)}</span>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                    <tr>
                      <td>
                        <button className="asset-name asset-detail-trigger" onClick={() => openAssetDetail(asset)} title="Varlik detayini ac">
                          <AssetLogo asset={asset} color={colors[index % colors.length]} small />
                          <div>
                            <strong>{asset.ticker}</strong>
                            <small>{asset.name} · {asset.priceSource} oto {asset.lastPriceAt ? `· ${formatTime(asset.lastPriceAt)}` : ""}{asset.lastPriceError ? ` · Hata: ${asset.lastPriceError}` : ""}</small>
                          </div>
                        </button>
                      </td>
                      <td>{num(asset.quantity)}</td>
                      <td>{money(cost)}</td>
                      <td>{money(asset.price, asset.currency)}</td>
                      <td>{money(value)}</td>
                      <td className={pl >= 0 ? "positive" : "negative"}>{signedMoney(pl)}</td>
                      <td><span className={pl >= 0 ? "performance-badge positive" : "performance-badge negative"}>{signedPct(plRate)}</span></td>
                      <td className="row-actions">
                        <button className="icon-btn text-btn transaction-action-btn" onClick={() => openAssetDetail(asset)} title="Islem gecmisini ac">Islem</button>
                        {asset.quantity > 0 && asset.type !== "Nakit" ? <button className="icon-btn text-btn transaction-action-btn" onClick={() => openQuickSell(asset)} title="Varlik sat">Sat</button> : null}
                        <button className="icon-btn" onClick={() => openAsset(asset)} title="Duzenle">✎</button>
                        <button className="icon-btn" onClick={() => void deleteAsset(asset.id)} title="Sil">×</button>
                      </td>
                    </tr>
                    </Fragment>
                  );
                }) : (
                  <tr><td colSpan={8}><div className="empty">Ilk varligini ekleyerek baslayabilirsin.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="print-report" aria-label="PDF portfoy raporu">
          <section className="report-page summary-page">
            <div className="report-hero">
              <div>
                <h1>MUSTAFA CIMEN - PORTFOY RAPORU</h1>
                <p className="report-title-sub">Portfoy Dagilimi</p>
                <p>Rapor tarihi: {new Date().toLocaleDateString("tr-TR")} · Son kayit: {lastSync ? formatTime(lastSync) : "-"}</p>
              </div>
              <strong>{money(totals.totalValue)}</strong>
            </div>

            <div className="report-cards">
              <article><span>Toplam maliyet</span><strong>{money(totals.totalCost)}</strong><small>Kayitli alis maliyeti</small></article>
              <article><span>Guncel deger</span><TrendValue trend={totals.pl}>{money(totals.totalValue)}</TrendValue><small>{state.assets.length} varlik</small></article>
              <article><span>Kar / Zarar</span><TrendValue trend={totals.pl}>{signedMoney(totals.pl)}</TrendValue><small>{pct(totals.rate)}</small></article>
              <article><span>Nakit</span><strong>{money(totals.cash)}</strong><small>Varlik tipi: Nakit</small></article>
            </div>

            <div className="report-insights">
              <article className="gold"><span>Yatirilan ana para</span><strong>{money(totals.totalCost)}</strong></article>
              <article className={totals.pl >= 0 ? "green" : "red"}><span>Varlik degeri</span><TrendValue trend={totals.pl}>{money(totals.totalValue)}</TrendValue></article>
              <article className={totals.pl >= 0 ? "green" : "red"}><span>Net durum</span><TrendValue trend={totals.pl}>{signedMoney(totals.pl)}</TrendValue><small>{pct(totals.rate)}</small></article>
              <article className={(bestAsset?.returnRate || 0) >= 0 ? "green" : "red"}><span>En iyi performans</span><strong className={(bestAsset?.returnRate || 0) >= 0 ? "positive" : "negative"}>{bestAsset?.asset.ticker || "-"}</strong><small className={(bestAsset?.returnRate || 0) >= 0 ? "positive" : "negative"}><span className={`trend-triangle ${(bestAsset?.returnRate || 0) >= 0 ? "up" : "down"}`} />{bestAsset ? `${pct(bestAsset.returnRate)} · ${absoluteMoney(bestAsset.profitLoss)}` : "%0"}</small></article>
              <article className={(worstAsset?.returnRate || 0) >= 0 ? "green" : "red"}><span>En zayif performans</span><strong className={(worstAsset?.returnRate || 0) >= 0 ? "positive" : "negative"}>{worstAsset?.asset.ticker || "-"}</strong><small className={(worstAsset?.returnRate || 0) >= 0 ? "positive" : "negative"}><span className={`trend-triangle ${(worstAsset?.returnRate || 0) >= 0 ? "up" : "down"}`} />{worstAsset ? `${pct(worstAsset.returnRate)} · ${absoluteMoney(worstAsset.profitLoss)}` : "%0"}</small></article>
            </div>

            <section className="report-panel">
              <div className="report-panel-head"><h2>Varlik Sinifi Dagilimi</h2><p>Guncel portfoy degerine gore sinif paylari.</p></div>
              <div className="class-stack" style={{ background: classGradient }} />
              <div className="legend-grid">
                {groupedAssets.map((group) => {
                  const share = totals.totalValue ? (group.value / totals.totalValue) * 100 : 0;
                  return (
                    <div key={group.key} className="legend-item">
                      <span style={{ background: groupColors[group.key] || "#647181" }} />
                      <strong>{group.label}</strong>
                      <b>{pct(share)}</b>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="report-summary-grid">
              <section className="report-panel report-category-summary">
                <div className="report-panel-head"><h2>Kategori Kar / Zarar Ozeti</h2><p>Sinif bazinda yatirilan tutar, guncel deger ve net sonuc.</p></div>
                <div className="category-summary-list">
                  {groupedAssets.map((group) => (
                    <div className="category-summary-row" key={group.key}>
                      <span style={{ background: groupColors[group.key] || "#647181" }} />
                      <strong>{group.label}</strong>
                      <small>Yatirilan {money(group.cost)}</small>
                      <b>{money(group.value)}</b>
                      <em className={group.profitLoss >= 0 ? "positive" : "negative"}>{signedMoney(group.profitLoss)}</em>
                    </div>
                  ))}
                </div>
              </section>

              <section className="report-panel report-executive-side">
                <div className="report-panel-head"><h2>Yonetici Ozeti</h2><p>En buyuk agirliklar ve takip edilmesi gereken risk sinyalleri.</p></div>
                <div className="report-top-list">
                  {portfolioRows.slice(0, 5).map((row) => (
                    <div className="report-top-row" key={row.asset.id}>
                      <AssetLogo asset={row.asset} color={row.color} small />
                      <strong>{row.asset.ticker}</strong>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(3, row.share)}%`, background: row.color }} /></div>
                      <span>{pct(row.share)}</span>
                    </div>
                  ))}
                </div>
                <div className="report-mini-risk">
                  <article><span>Risk</span><strong>{riskScore.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}/10</strong><small>{riskLevel}</small></article>
                  <article><span>Cesitlilik</span><strong>{diversityScore.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}/10</strong><small>{activeGroupCount} sinif</small></article>
                  <article><span>Ilk 5 agirlik</span><strong>{pct(top5Share)}</strong><small>Toplam pay</small></article>
                </div>
              </section>
            </section>

            <section className="report-panel report-performance-radar">
              <div className="report-panel-head"><h2>Performans Radari</h2><p>Tum zamanlar ve gunluk bazda one cikan varliklar.</p></div>
              <div className="report-radar-grid">
                {reportPerformanceGroups.map((group) => (
                  <article className={`report-radar-card ${group.tone}`} key={group.title}>
                    <h3>{group.title}</h3>
                    <div className="report-radar-list">
                      {group.rows.length ? group.rows.map((row, index) => {
                        const amount = group.metric === "dailyChange" ? row.dailyChange : row.profitLoss;
                        const rate = group.metric === "dailyChange" ? row.dailyRate : row.returnRate;
                        return (
                          <div className="report-radar-row" key={row.asset.id}>
                            <span>{index + 1}</span>
                            <AssetLogo asset={row.asset} color={row.color} small />
                            <strong>{row.asset.ticker}</strong>
                            <b className={amount >= 0 ? "positive" : "negative"}>
                              <i className={`trend-triangle ${amount >= 0 ? "up" : "down"}`} />
                              {absoluteMoney(amount)}
                              <em>{signedPct(rate)}</em>
                            </b>
                          </div>
                        );
                      }) : (
                        <div className="report-radar-empty">Gunluk veri fiyat guncellemeleriyle birikir.</div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>

          </section>

          <section className="report-page portfolio-report-page">
            <div className="report-hero compact"><div><h1>Genel Portfoy Dagilimi</h1><p>Varlik bazinda portfoy payi ve guncel deger.</p></div></div>
            <section className="report-panel report-portfolio-panel">
              <div className="portfolio-bars report-bars">
                {portfolioRows.map((row) => (
                  <div className="portfolio-bar-row" key={row.asset.id}>
                    <AssetLogo asset={row.asset} color={row.color} />
                    <strong>{row.asset.ticker}</strong>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(2, row.share)}%`, background: row.color }} /></div>
                    <span>{pct(row.share)}</span>
                    <b>{money(row.value)}</b>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <section className="report-page assets-page assets-detail-page">
            <div className="report-hero compact"><div><h1>Portfoy Varliklari</h1><p>Kategorilere ayrilmis detayli portfoy listesi.</p></div></div>
            <section className="report-panel">
              <table className="report-table">
                <thead><tr><th>Varlik</th><th>Adet</th><th>Toplam Maliyet</th><th>Guncel</th><th>Deger</th><th>K/Z</th><th>K/Z %</th></tr></thead>
                <tbody>
                  {filteredAssets.map((asset, index) => {
                    const value = asset.quantity * asset.price * (asset.fxRate || 1);
                    const cost = asset.quantity * asset.avgCost * (asset.fxRate || 1);
                    const txSummary = summarizeAssetTransactions(asset, state.transactions);
                    const netRealized = realizedNetFromSummary(txSummary);
                    const pl = value - cost + netRealized;
                    const plRateBase = historicalPerformanceBase(cost, txSummary);
                    const plRate = plRateBase ? (pl / plRateBase) * 100 : 0;
                    const previous = filteredAssets[index - 1];
                    const currentGroupKey = assetGroupKey(asset);
                    const showGroup = !previous || assetGroupKey(previous) !== currentGroupKey;
                    const group = groupedAssets.find((item) => item.key === currentGroupKey);
                    return (
                      <Fragment key={asset.id}>
                        {showGroup && group ? <tr className="report-group-row"><td colSpan={7}>{group.label} · {group.assets.length} varlik · Yatirilan {money(group.cost)} · <span className={group.profitLoss >= 0 ? "positive" : "negative"}>{signedMoney(group.profitLoss)}</span></td></tr> : null}
                        <tr>
                          <td>
                            <span className="report-asset-cell">
                              <AssetLogo asset={asset} color={groupColors[currentGroupKey] || "#647181"} small />
                              <span><strong>{asset.ticker}</strong><small>{asset.name}</small></span>
                            </span>
                          </td>
                          <td>{num(asset.quantity)}</td>
                          <td>{money(cost)}</td>
                          <td>{money(asset.price, asset.currency)}</td>
                          <td>{money(value)}</td>
                          <td className={pl >= 0 ? "positive" : "negative"}>{signedMoney(pl)}</td>
                          <td><span className={pl >= 0 ? "performance-badge positive" : "performance-badge negative"}>{signedPct(plRate)}</span></td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </section>

          <section className="report-page transaction-report-page">
            <div className="report-hero compact"><div><h1>Islem Gecmisi</h1><p>Alis, satis, temettu, fon dagitimi, komisyon ve vergi hareketlerinin rapor ozeti.</p></div></div>
            <section className="report-panel transaction-report-panel">
              <div className="report-panel-head"><h2>Alim Satim ve Gelir Hareketleri</h2><p>Alislarda yeni ortalama maliyet, satislarda ise gerceklesen sonuc ve kalan adet izlenir.</p></div>
              {reportTransactionRows.length ? (
                <table className="report-table transaction-report-table">
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Varlik</th>
                      <th>Islem</th>
                      <th>Adet</th>
                      <th>Tutar</th>
                      <th>Kalan</th>
                      <th>Sonuc / Ort. maliyet</th>
                      <th>K/Z %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportTransactionRows.map((row) => (
                      <tr key={row.tx.id}>
                        <td>{row.tx.date}</td>
                        <td>
                          <span className="report-asset-cell">
                            {row.asset ? <AssetLogo asset={row.asset} color={groupColors[assetGroupKey(row.asset)] || "#647181"} small /> : null}
                            <span><strong>{row.asset?.ticker || row.tx.assetTicker || row.tx.assetSymbol || "-"}</strong><small>{row.asset?.name || row.tx.assetName || row.tx.note || "-"}</small></span>
                          </span>
                        </td>
                        <td><span className={`transaction-report-type ${row.tx.type}`}>{row.typeLabel}</span></td>
                        <td>{isPositionTransaction(row.tx.type) ? num(row.tx.quantity) : "-"}</td>
                        <td>{money(row.amount)}</td>
                        <td>{isPositionTransaction(row.tx.type) ? num(row.remaining) : "-"}</td>
                        <td className={row.tx.type === "buy" ? "" : row.status}>
                          {row.tx.type === "buy" ? (
                            <span className="transaction-result neutral">{money(row.avgCostAfter)}</span>
                          ) : (
                            <span className="transaction-result">
                              <i className={`trend-triangle ${row.realized >= 0 ? "up" : "down"}`} />
                              {absoluteMoney(row.realized)}
                            </span>
                          )}
                        </td>
                        <td>
                          {row.tx.type === "sell" ? (
                            <span className={`performance-badge ${row.realized >= 0 ? "positive" : "negative"}`}>{signedPct(row.rate)}</span>
                          ) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="report-empty-state">Henuz rapora yansiyacak satis, gelir veya gider islemi yok.</div>
              )}
            </section>
          </section>

          {reportFundCards.map((fund) => (
            <section className={`report-page fund-report-page fund-detail-page ${fund.rows.length > 36 ? "dense" : ""}`} key={fund.code}>
              <div className="report-hero compact">
                <div className="fund-report-title">
                  <span className="isbank-report-logo" aria-hidden="true"><span>IS</span></span>
                  <div>
                    <h1>{fund.code} Fon Icerigi</h1>
                    <p>{fund.source}{fund.asOf ? ` - ${fund.asOf}` : ""}</p>
                  </div>
                </div>
                <strong>{pct(fund.totalsInfo.knownWeight)}</strong>
              </div>
              <section className="report-panel fund-detail-panel">
                <div className="fund-detail-kpis">
                  <article><span>Kayit sayisi</span><strong>{fund.rows.length}</strong><small>Tum pozisyonlar</small></article>
                  <article><span>Fon degeri</span><strong>{money(fund.fundRow.value)}</strong><small>{fund.fundRow.asset.name}</small></article>
                  <article><span>Acilanan agirlik</span><strong>{pct(fund.totalsInfo.knownWeight)}</strong><small>{fund.totalsInfo.missingWeight > 0.05 ? `${pct(fund.totalsInfo.missingWeight)} kalan kisim` : "Tam kapsama yakin"}</small></article>
                </div>
                <div className="fund-detail-coverage">
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.min(100, Math.max(2, fund.totalsInfo.knownWeight))}%`, background: groupColors.fund || "#3f7f8f" }} />
                  </div>
                  <span>{fund.totalsInfo.missingWeight > 0.05 ? `${pct(fund.totalsInfo.missingWeight)} diger / aciklanmayan kisim` : "Acilanan pozisyonlar fona neredeyse tam yakindir"}</span>
                </div>
                <div className="fund-detail-layout">
                  <div className="fund-position-list">
                    {fund.rows.map((holding) => (
                      <div className="fund-position-row" key={holding.id}>
                        <span>{holding.symbol}</span>
                        <strong>{holding.name}</strong>
                        <small>{holding.sector} - {holding.country}</small>
                        <b>{pct(holding.weight)}</b>
                      </div>
                    ))}
                  </div>
                  <aside className="fund-detail-side">
                    <div>
                      <h3>Sektor dagilimi</h3>
                      {fund.sectorRows.map((row) => (
                        <p key={row.label}><span>{row.label}</span><b>{pct(row.value)}</b></p>
                      ))}
                    </div>
                    <div>
                      <h3>Ulke dagilimi</h3>
                      {fund.countryRows.map((row) => (
                        <p key={row.label}><span>{row.label}</span><b>{pct(row.value)}</b></p>
                      ))}
                    </div>
                  </aside>
                </div>
              </section>
            </section>
          ))}

          <section className="report-page">
            <div className="report-hero compact"><div><h1>Gelecek Projeksiyonu</h1><p>Bugunku deger uzerine her yil 360.000 TL ek yatirim ve yillik %16 bilesik getiri varsayimi.</p></div></div>
            <section className="report-panel">
              <div className="projection-list">
                {projections.map((item) => (
                  <div className="projection-row" key={item.year}>
                    <span>{item.year}. Yil</span>
                    <div className="bar-track"><div className={item.year === 10 ? "bar-fill accent" : "bar-fill"} style={{ width: `${(item.value / maxProjection) * 100}%` }} /></div>
                    <strong>{compactMoney(item.value)}</strong>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <section className="report-page">
            <div className="report-hero compact"><div><h1>Portfoy Analitigi</h1><p>Sinif dengesi, kategori paylari ve performans ozeti.</p></div></div>
            <section className="report-panel">
              <div className="analytics-layout">
                <div className="donut-wrap">
                  <div className="donut" style={{ background: donutGradient }}><span>Varlik<br />Sinifi</span></div>
                </div>
                <div className="analytics-list">
                  {groupedAssets.map((group) => (
                    <div className="analytics-line" key={group.key}>
                      <span style={{ background: groupColors[group.key] || "#647181" }} />
                      <strong>{group.label}</strong>
                      <b>{pct(totals.totalValue ? (group.value / totals.totalValue) * 100 : 0)}</b>
                      <em>{money(group.value)}</em>
                    </div>
                  ))}
                </div>
              </div>
              <div className="callout-grid">
                <article className="callout positive-bg"><span>En cok kazandiran</span><strong>{bestAsset?.asset.ticker || "-"}</strong><b>{bestAsset ? `${pct(bestAsset.returnRate)} (${signedMoney(bestAsset.profitLoss)})` : "%0"}</b></article>
                <article className="callout negative-bg"><span>En cok kaybettiren</span><strong>{worstAsset?.asset.ticker || "-"}</strong><b>{worstAsset ? `${pct(worstAsset.returnRate)} (${signedMoney(worstAsset.profitLoss)})` : "%0"}</b></article>
              </div>
            </section>
          </section>

          <section className="report-page risk-report-page">
            <div className="report-hero compact"><div><h1>Risk & Cesitlilik Notu</h1><p>Portfoy dengesini, yogunlasmayi ve uzun vadeli buyume uyumunu ozetler.</p></div></div>
            <section className="report-panel risk-panel">
              <div className="risk-head">
                <div>
                  <h2>Risk & Cesitlilik Notu</h2>
                  <p>Portfoy dengesini, yogunlasmayi ve uzun vadeli buyume uyumunu ozetler.</p>
              </div>
              <div className="score-row">
                <div className="score-pill"><strong>{riskScore.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</strong><span>{riskLevel} Risk / 10</span></div>
                <div className="score-pill"><strong>{diversityScore.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</strong><span>Cesitlilik / 10</span></div>
              </div>
            </div>
              <div className="risk-summary-strip">
                <article><span>Oncelikli takip</span><strong>{portfolioRows[0]?.asset.ticker || "-"}</strong><small>{riskDriver}</small></article>
                <article><span>Denge hamlesi</span><strong>{biggestGroup?.label || "-"}</strong><small>Yeni yatirimlarda hedefin altinda kalan siniflara agirlik ver.</small></article>
                <article><span>Kontrol ritmi</span><strong>Aylik</strong><small>Ilk 5 agirlik ve hedef sapmasi ayda bir kontrol edilmeli.</small></article>
              </div>
              <div className="risk-metric-grid">
                {riskMetrics.map((metric) => (
                  <article className={`risk-metric ${metric.tone}`} key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <small>{metric.detail}</small>
                  </article>
                ))}
              </div>
              <div className="risk-grid">
                <article><h3>Riskin ana nedeni</h3><p>{riskDriver}</p></article>
                <article><h3>Dagilim yapisi</h3><p>Portfoy {activeGroupCount} ana sinifa dagiliyor. En buyuk sinif {biggestGroup?.label || "-"} ve payi {pct(biggestGroup?.share || 0)} seviyesinde.</p></article>
                <article><h3>Yogunlasma dengesi</h3><p>Ilk 3 varlik {pct(top3Share)}, ilk 5 varlik {pct(top5Share)} agirlik tasiyor. Bu oranlar arttikca tekil varlik etkisi guclenir.</p></article>
                <article><h3>Stratejik degerlendirme</h3><p>Hedef portfoyden en buyuk sapma {pct(maxTargetDeviation)}. Yeni yatirimlarda hedef paylara gore eksik kalan siniflara agirlik vermek dengeyi guclendirir.</p></article>
              </div>
            </section>
          </section>

          <section className="legacy-print-report">
          <div className="print-report-head">
            <div>
              <h1>Kisisel Portfoy Raporu</h1>
              <p>Rapor tarihi: {new Date().toLocaleDateString("tr-TR")} · Son kayit: {lastSync ? formatTime(lastSync) : "-"}</p>
            </div>
            <strong>{money(totals.totalValue)}</strong>
          </div>

          <div className="print-kpi-grid">
            <article><span>Toplam maliyet</span><strong>{money(totals.totalCost)}</strong></article>
            <article><span>Guncel deger</span><strong>{money(totals.totalValue)}</strong></article>
            <article><span>Kar / zarar</span><strong className={totals.pl >= 0 ? "positive" : "negative"}>{signedMoney(totals.pl)}</strong><small>{signedPct(totals.rate)}</small></article>
            <article><span>Nakit</span><strong>{money(totals.cash)}</strong></article>
          </div>

          <div className="print-two-col">
            <section>
              <h2>Varlik sinifi dagilimi</h2>
              {groupedAssets.map((group) => {
                const share = totals.totalValue ? (group.value / totals.totalValue) * 100 : 0;
                return (
                  <div className="print-bar-row" key={group.key}>
                    <div><strong>{group.label}</strong><span>{pct(share)} · {money(group.value)}</span></div>
                    <div className="print-bar-track"><div style={{ width: `${Math.max(2, share)}%`, background: groupColors[group.key] || "#647181" }} /></div>
                  </div>
                );
              })}
            </section>
            <section>
              <h2>Performans ozeti</h2>
              <div className="print-summary-list">
                <div><span>En iyi performans</span><strong className={(bestAsset?.returnRate || 0) >= 0 ? "positive" : "negative"}><i className={`trend-triangle ${(bestAsset?.returnRate || 0) >= 0 ? "up" : "down"}`} />{bestAsset?.asset.ticker || "-"} · {bestAsset ? signedPct(bestAsset.returnRate) : "%0"}</strong></div>
                <div><span>En zayif performans</span><strong className={(worstAsset?.returnRate || 0) >= 0 ? "positive" : "negative"}><i className={`trend-triangle ${(worstAsset?.returnRate || 0) >= 0 ? "up" : "down"}`} />{worstAsset?.asset.ticker || "-"} · {worstAsset ? signedPct(worstAsset.returnRate) : "%0"}</strong></div>
                <div><span>Risk notu</span><strong>{riskScore.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}/10</strong></div>
                <div><span>Cesitlilik notu</span><strong>{diversityScore.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}/10</strong></div>
              </div>
            </section>
          </div>

          <section className="print-section">
            <h2>Portfoy varliklari</h2>
            <table className="print-table">
              <thead>
                <tr><th>Varlik</th><th>Tur</th><th>Adet</th><th>Maliyet</th><th>Guncel deger</th><th>K/Z</th><th>K/Z %</th></tr>
              </thead>
              <tbody>
                {portfolioRows.map((row) => (
                  <tr key={row.asset.id}>
                    <td>{row.asset.ticker}</td>
                    <td>{groupDefinitions.find((group) => group.key === assetGroupKey(row.asset))?.label || row.asset.type}</td>
                    <td>{num(row.asset.quantity)}</td>
                    <td>{money(row.cost)}</td>
                    <td>{money(row.value)}</td>
                    <td className={row.profitLoss >= 0 ? "positive" : "negative"}>{signedMoney(row.profitLoss)}</td>
                    <td className={row.returnRate >= 0 ? "positive" : "negative"}>{signedPct(row.returnRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="print-section">
            <h2>Risk ve notlar</h2>
            <p>Portfoy {activeGroupCount} ana sinifa dagiliyor. En buyuk pozisyon {portfolioRows[0]?.asset.ticker || "-"} ve portfoy payi {pct(topShare)}. Yeni yatirimlarda hedef portfoy ekranindaki eksik siniflar takip edilerek denge guclendirilebilir.</p>
          </section>
        </section>
        </section>
      </main>

      {assetDraft ? (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={(event) => void submitAsset(event)}>
            <div className="panel-header"><h2>{state.assets.some((item) => item.id === assetDraft.id) ? "Varligi duzenle" : "Varlik ekle"}</h2></div>
            <div className="form-grid">
              <label className="wide">Kod
                <input className="input" value={assetDraft.ticker} onChange={(event) => updateDraftTicker(event.target.value)} onBlur={() => void discoverDraftAsset()} placeholder="AFT, THYAO veya SOL/TRY" required />
              </label>
              <div className={`auto-summary asset-match ${assetLookup.loading ? "loading" : assetLookup.ok ? "matched" : ""}`}>
                {assetDraft.ticker ? <><AssetLogo asset={assetDraft} color={groupColors[assetGroupKey(assetDraft)] || "#647181"} small /><span><strong>{assetDraft.name}</strong><small>{assetDraft.type} · {assetDraft.currency} · Fiyat ve simge otomatik</small></span></> : <span><strong>Varlik kodunu yaz</strong><small>Fon, BIST hissesi veya kripto otomatik taninir.</small></span>}
              </div>
              {assetLookup.message ? <div className={`lookup-message wide ${assetLookup.ok ? "success" : ""}`}>{assetLookup.message}</div> : null}
              <label>Adet
                <input className="input" inputMode="decimal" value={assetDraftInputs.quantity} onChange={(event) => {
                  const value = event.target.value;
                  setAssetDraftInputs((draft) => ({ ...draft, quantity: value }));
                  setAssetDraft({ ...assetDraft, quantity: parseAmount(value) });
                }} required />
              </label>
              <label>Ortalama alis fiyati
                <input className="input" inputMode="decimal" value={assetDraftInputs.avgCost} onChange={(event) => {
                  const value = event.target.value;
                  const amount = parseAmount(value);
                  setAssetDraftInputs((draft) => ({ ...draft, avgCost: value }));
                  setAssetDraft({ ...assetDraft, avgCost: amount, price: assetDraft.price || amount });
                }} required />
              </label>
              <label>Komisyon (TL)
                <input className="input" inputMode="decimal" value={assetDraftInputs.fee} onChange={(event) => {
                  const value = event.target.value;
                  setAssetDraftInputs((draft) => ({ ...draft, fee: value }));
                }} placeholder="Istege bagli" />
              </label>
              <label>Komisyon (adet)
                <input className="input" inputMode="decimal" value={assetDraftInputs.feeQuantity} onChange={(event) => {
                  const value = event.target.value;
                  setAssetDraftInputs((draft) => ({ ...draft, feeQuantity: value }));
                }} placeholder={assetDraft.ticker || "Varlik adedi"} />
              </label>
              <label>Hedef pay (%)
                <input className="input" inputMode="decimal" value={assetDraftInputs.target} onChange={(event) => {
                  const value = event.target.value;
                  setAssetDraftInputs((draft) => ({ ...draft, target: value }));
                  setAssetDraft({ ...assetDraft, target: parseAmount(value) });
                }} />
              </label>
              <label>Not
                <input className="input" value={assetDraft.note} onChange={(event) => setAssetDraft({ ...assetDraft, note: event.target.value })} />
              </label>
              <div className="auto-summary wide">Toplam maliyet: <strong>{money(parseAmount(assetDraftInputs.quantity) * parseAmount(assetDraftInputs.avgCost) + parseAmount(assetDraftInputs.fee), assetDraft.currency)}</strong>{parseAmount(assetDraftInputs.feeQuantity) ? <small>Net adet: {num(Math.max(0, parseAmount(assetDraftInputs.quantity) - parseAmount(assetDraftInputs.feeQuantity)))}</small> : null}</div>
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary" onClick={() => setAssetDraft(null)}>Vazgec</button>
              <button className="primary">Kaydet</button>
            </div>
          </form>
        </div>
      ) : null}

      {quickSellDraft.assetId ? (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={(event) => void submitQuickSell(event)}>
            <div className="panel-header"><h2>Varlik sat</h2></div>
            <div className="form-grid">
              <label className="wide">Varlik
                <select className="input" value={quickSellDraft.assetId} onChange={(event) => {
                  const asset = state.assets.find((item) => item.id === event.target.value);
                  setQuickSellDraft({
                    ...quickSellDraft,
                    assetId: event.target.value,
                    price: asset ? amountFieldValue(asset.price) : quickSellDraft.price,
                    amount: "",
                  });
                }}>
                  {sellableAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>{asset.ticker} - {num(asset.quantity)} adet</option>
                  ))}
                </select>
              </label>
              {state.assets.find((item) => item.id === quickSellDraft.assetId) ? (
                <div className="auto-summary asset-match">
                  {(() => {
                    const asset = state.assets.find((item) => item.id === quickSellDraft.assetId);
                    if (!asset) return null;
                    return <><AssetLogo asset={asset} color={groupColors[assetGroupKey(asset)] || "#647181"} small /><span><strong>{asset.ticker}</strong><small>Mevcut adet: {num(asset.quantity)} · Ortalama maliyet: {money(asset.avgCost, asset.currency)}</small></span></>;
                  })()}
                </div>
              ) : null}
              <label>Tarih
                <input className="input" type="date" value={quickSellDraft.date} onChange={(event) => setQuickSellDraft({ ...quickSellDraft, date: event.target.value })} required />
              </label>
              <label>Satilacak adet
                <input className="input" inputMode="decimal" value={quickSellDraft.quantity} onChange={(event) => setQuickSellDraft({ ...quickSellDraft, quantity: event.target.value })} required />
              </label>
              <label>Birim satis fiyati
                <input className="input" inputMode="decimal" value={quickSellDraft.price} onChange={(event) => setQuickSellDraft({ ...quickSellDraft, price: event.target.value })} required />
              </label>
              <label>Toplam satis tutari
                <input className="input" inputMode="decimal" value={quickSellDraft.amount} onChange={(event) => setQuickSellDraft({ ...quickSellDraft, amount: event.target.value })} placeholder="Istege bagli" />
              </label>
              <label>Komisyon
                <input className="input" inputMode="decimal" value={quickSellDraft.fee} onChange={(event) => setQuickSellDraft({ ...quickSellDraft, fee: event.target.value })} placeholder="Istege bagli" />
              </label>
              <label>Not
                <input className="input" value={quickSellDraft.note} onChange={(event) => setQuickSellDraft({ ...quickSellDraft, note: event.target.value })} placeholder="Istege bagli" />
              </label>
              <div className="auto-summary wide">Tahmini satis: <strong>{money(parseAmount(quickSellDraft.amount) || parseAmount(quickSellDraft.quantity) * parseAmount(quickSellDraft.price))}</strong></div>
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary" onClick={() => setQuickSellDraft({ assetId: "", quantity: "", price: "", amount: "", fee: "", date: plainDate(), note: "" })}>Vazgec</button>
              <button className="primary">Satisi isle</button>
            </div>
          </form>
        </div>
      ) : null}

      {selectedAssetDetail ? (
        <div className="modal-backdrop">
          <section className="modal asset-detail-modal">
            <div className="asset-detail-head">
              <div className="asset-detail-title">
                <AssetLogo asset={selectedAssetDetail.asset} color={groupColors[assetGroupKey(selectedAssetDetail.asset)] || "#647181"} />
                <div>
                  <h2>{selectedAssetDetail.asset.ticker}</h2>
                  <p>{selectedAssetDetail.asset.name} · {selectedAssetDetail.group.label}</p>
                </div>
              </div>
              <div className="row-actions">
                {selectedAssetDetail.asset.quantity > 0 && selectedAssetDetail.asset.type !== "Nakit" ? <button className="secondary" onClick={() => openQuickSell(selectedAssetDetail.asset)}>Sat</button> : null}
                <button className="secondary" onClick={() => openAsset(selectedAssetDetail.asset)}>Duzenle</button>
                <button className="secondary" onClick={() => setSelectedAssetId("")}>Kapat</button>
              </div>
            </div>

            <div className="asset-detail-grid">
              <article><span>Toplam adet</span><strong>{num(selectedAssetDetail.asset.quantity)}</strong></article>
              <article><span>Ortalama maliyet</span><strong>{money(selectedAssetDetail.asset.avgCost, selectedAssetDetail.asset.currency)}</strong></article>
              <article><span>Guncel fiyat</span><strong>{money(selectedAssetDetail.asset.price, selectedAssetDetail.asset.currency)}</strong></article>
              <article><span>Toplam maliyet</span><strong>{money(selectedAssetDetail.cost)}</strong></article>
              <article><span>Guncel deger</span><strong>{money(selectedAssetDetail.value)}</strong></article>
              <article className={selectedAssetDetail.profitLoss >= 0 ? "positive-card" : "negative-card"}><span>Kar / zarar</span><TrendValue trend={selectedAssetDetail.profitLoss}>{signedMoney(selectedAssetDetail.profitLoss)}</TrendValue><small>{signedPct(selectedAssetDetail.returnRate)}</small></article>
              <article><span>Portfoy payi</span><strong>{pct(selectedAssetDetail.portfolioShare)}</strong></article>
              <article><span>Kategori ici pay</span><strong>{pct(selectedAssetDetail.categoryShare)}</strong></article>
              <article><span>Hedef pay</span><strong>{selectedAssetDetail.asset.target ? pct(selectedAssetDetail.asset.target) : "-"}</strong><small>{selectedAssetDetail.asset.target ? `Fark ${signedPct(selectedAssetDetail.targetGap)}` : "Belirlenmedi"}</small></article>
              <article><span>Fiyat kaynagi</span><strong>{selectedAssetDetail.asset.priceSource}</strong><small>{selectedAssetDetail.asset.priceSymbol}</small></article>
              <article><span>Son guncelleme</span><strong>{selectedAssetDetail.asset.lastPriceAt ? formatTime(selectedAssetDetail.asset.lastPriceAt) : "-"}</strong><small>{selectedAssetDetail.priceStatus}</small></article>
              <article><span>Pozisyon sirasi</span><strong>{selectedAssetDetail.rank || "-"}</strong><small>Degere gore</small></article>
              <article className={selectedAssetDetail.netRealized >= 0 ? "positive-card" : "negative-card"}><span>Gerceklesmis sonuc</span><TrendValue trend={selectedAssetDetail.netRealized}>{signedMoney(selectedAssetDetail.netRealized)}</TrendValue><small>Islem gecmisinden</small></article>
              <article><span>Toplam islem</span><strong>{selectedAssetDetail.transactions.length}</strong><small>Kayitli hareket</small></article>
              <article><span>Gelir / gider</span><strong>{money(selectedAssetDetail.transactionSummary.income - selectedAssetDetail.transactionSummary.expense)}</strong><small>Temettu, dagitim, komisyon, vergi</small></article>
            </div>

            <div className="asset-detail-body">
              <section className="asset-detail-notes">
                <h3>Analiz notlari</h3>
                {selectedAssetDetail.notes.map((note) => <p key={note}>{note}</p>)}
              </section>
              <section className="asset-detail-note-box">
                <h3>Kisisel not</h3>
                <p>{selectedAssetDetail.asset.note || "Bu varlik icin not eklenmemis."}</p>
              </section>
            </div>

            <section className="position-story-panel">
              <div className="transaction-head">
                <div>
                  <h3>Pozisyon Hikayesi 2.0</h3>
                  <p>Bu varligin alis, satis, kalan maliyet ve ana para durumunu ozetler.</p>
                </div>
              </div>
              <div className="position-story-grid">
                <article><span>Ilk alis tarihi</span><strong>{selectedAssetDetail.storyMetrics.firstBuyDate || "-"}</strong><small>Portfoye ekleme / ilk islem</small></article>
                <article><span>Toplam alinan</span><strong>{num(selectedAssetDetail.storyMetrics.totalBoughtQuantity)}</strong><small>{money(selectedAssetDetail.storyMetrics.totalBuyAmount)} toplam alis</small></article>
                <article><span>Toplam satilan</span><strong>{num(selectedAssetDetail.storyMetrics.totalSoldQuantity)}</strong><small>{selectedAssetDetail.storyMetrics.avgSellPrice ? `${money(selectedAssetDetail.storyMetrics.avgSellPrice, selectedAssetDetail.asset.currency)} ort. satis` : "Satis yok"}</small></article>
                <article className={selectedAssetDetail.storyMetrics.principalStatus === "Cikti" ? "positive-card" : selectedAssetDetail.storyMetrics.totalBuyAmount ? "negative-card" : ""}>
                  <span>Ana para durumu</span>
                  <strong>{selectedAssetDetail.storyMetrics.principalStatus}</strong>
                  <small>{selectedAssetDetail.storyMetrics.principalGap ? `${money(selectedAssetDetail.storyMetrics.principalGap)} kaldi` : `${money(selectedAssetDetail.storyMetrics.principalRecovered)} geri alindi`}</small>
                </article>
                <article><span>Kalan maliyet</span><strong>{money(selectedAssetDetail.cost)}</strong><small>{num(selectedAssetDetail.asset.quantity)} adet acik</small></article>
                <article className={selectedAssetDetail.netRealized >= 0 ? "positive-card" : "negative-card"}><span>Gerceklesmis kar</span><TrendValue trend={selectedAssetDetail.netRealized}>{signedMoney(selectedAssetDetail.netRealized)}</TrendValue><small>Satis + gelir - gider</small></article>
              </div>
            </section>

            {selectedAssetDetail.asset.quantity > 0 && selectedAssetDetail.asset.type !== "Nakit" && sellStrategy ? (
              <section className="sell-strategy-panel">
                <div className="transaction-head">
                  <div>
                    <h3>Satis Stratejisi Yardimcisi</h3>
                    <p>Farkli satis senaryolarinda kasaya girecek tutari, kalan adedi ve gerceklesecek sonucu hesaplar.</p>
                  </div>
                </div>
                <div className="sell-strategy-controls">
                  <label>Birim satis fiyati
                    <input className="input" inputMode="decimal" value={sellStrategyDraft.price} onChange={(event) => setSellStrategyDraft({ ...sellStrategyDraft, price: event.target.value })} placeholder={money(selectedAssetDetail.asset.price, selectedAssetDetail.asset.currency)} />
                  </label>
                  <label>Ozel satilacak adet
                    <input className="input" inputMode="decimal" value={sellStrategyDraft.quantity} onChange={(event) => setSellStrategyDraft({ ...sellStrategyDraft, quantity: event.target.value, amount: "" })} placeholder="Istege bagli" />
                  </label>
                  <label>Ozel satis tutari
                    <input className="input" inputMode="decimal" value={sellStrategyDraft.amount} onChange={(event) => setSellStrategyDraft({ ...sellStrategyDraft, amount: event.target.value, quantity: "" })} placeholder="Istege bagli" />
                  </label>
                </div>
                <div className="sell-strategy-grid">
                  {sellStrategy.scenarios.map((scenario) => (
                    <article className={scenario.realized >= 0 ? "positive-card" : "negative-card"} key={scenario.label}>
                      <span>{scenario.label}</span>
                      <strong>{money(scenario.amount)}</strong>
                      <small>{scenario.note}</small>
                      <div className="strategy-metrics">
                        <b>{num(scenario.quantity)} adet sat</b>
                        <b>{num(scenario.remainingQuantity)} adet kalir</b>
                        <b className={scenario.realized >= 0 ? "positive" : "negative"}>{signedMoney(scenario.realized)} · {signedPct(scenario.rate)}</b>
                      </div>
                      <button
                        className="secondary"
                        disabled={!scenario.quantity || !sellStrategy.price}
                        onClick={() => {
                          setSelectedAssetId("");
                          setQuickSellDraft({
                            assetId: selectedAssetDetail.asset.id,
                            quantity: amountFieldValue(scenario.quantity),
                            price: amountFieldValue(sellStrategy.price),
                            amount: amountFieldValue(scenario.amount),
                            fee: "",
                            date: plainDate(),
                            note: scenario.label,
                          });
                        }}
                      >
                        Satis formuna aktar
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="transaction-panel">
              <div className="transaction-head">
                <div>
                  <h3>Islem gecmisi</h3>
                  <p>Alis, satis, temettu, fon dagitimi, komisyon ve vergi kayitlarini burada takip edebilirsin.</p>
                </div>
                <strong className={selectedAssetDetail.netRealized >= 0 ? "positive" : "negative"}>{signedMoney(selectedAssetDetail.netRealized)}</strong>
              </div>
              <form className={`transaction-form ${isPositionTransaction(transactionDraft.type) ? "position-mode" : "amount-mode"}`} onSubmit={(event) => void submitTransaction(event)}>
                <select value={transactionDraft.type} onChange={(event) => {
                  const nextType = event.target.value;
                  setTransactionDraft({
                    ...transactionDraft,
                    type: nextType,
                    quantity: isPositionTransaction(nextType) ? transactionDraft.quantity : "",
                    price: isPositionTransaction(nextType) ? transactionDraft.price : "",
                    fee: isPositionTransaction(nextType) ? transactionDraft.fee : "",
                  });
                }}>
                  <option value="buy">Alis</option>
                  <option value="sell">Satis</option>
                  <option value="dividend">Temettu</option>
                  <option value="distribution">Fon dagitimi</option>
                  <option value="fee">Komisyon</option>
                  <option value="tax">Vergi</option>
                  <option value="transfer">Transfer</option>
                </select>
                <input className="input" type="date" value={transactionDraft.date} onChange={(event) => setTransactionDraft({ ...transactionDraft, date: event.target.value })} />
                {isPositionTransaction(transactionDraft.type) ? (
                  <>
                    <input className="input" value={transactionDraft.quantity} onChange={(event) => setTransactionDraft({ ...transactionDraft, quantity: event.target.value })} placeholder="Adet" />
                    <input className="input" value={transactionDraft.price} onChange={(event) => setTransactionDraft({ ...transactionDraft, price: event.target.value })} placeholder="Birim fiyat" />
                    <input className="input" value={transactionDraft.amount} onChange={(event) => setTransactionDraft({ ...transactionDraft, amount: event.target.value })} placeholder={transactionDraft.type === "buy" ? "Toplam alis tutari" : transactionDraft.type === "sell" ? "Toplam satis tutari" : transactionAmountPlaceholder(transactionDraft.type)} />
                    <input className="input" value={transactionDraft.fee} onChange={(event) => setTransactionDraft({ ...transactionDraft, fee: event.target.value })} placeholder="Komisyon" />
                  </>
                ) : (
                  <input className="input" value={transactionDraft.amount} onChange={(event) => setTransactionDraft({ ...transactionDraft, amount: event.target.value })} placeholder={transactionAmountPlaceholder(transactionDraft.type)} />
                )}
                <input className="input" value={transactionDraft.note} onChange={(event) => setTransactionDraft({ ...transactionDraft, note: event.target.value })} placeholder="Not" />
                <button className="primary">Ekle</button>
              </form>
              <p className="transaction-hint">{isPositionTransaction(transactionDraft.type) ? "Alis ve satislarda adet + birim fiyat girersen toplam tutari sistem hesaplar. Toplam tutar alanini yalnizca emrin toplam TL degerini biliyorsan kullan; gecmise donuk islemler tarih sirasina gore yeniden hesaplanir." : "Bu islem turunde sadece tarih, tutar ve not yeterli. Adet, fiyat ve komisyon bilgisi gerekmez."}</p>
              {selectedAssetDetail.transactions.length ? (
                <>
                  <div className="transaction-story-summary">
                    <article>
                      <span>Acik pozisyon</span>
                      <strong>{num(selectedAssetDetail.asset.quantity)} adet</strong>
                      <small>{money(selectedAssetDetail.cost)} maliyet</small>
                    </article>
                    <article className={selectedAssetDetail.openProfitLoss >= 0 ? "positive-card" : "negative-card"}>
                      <span>Acik sonuc</span>
                      <TrendValue trend={selectedAssetDetail.openProfitLoss}>{signedMoney(selectedAssetDetail.openProfitLoss)}</TrendValue>
                      <small>Guncel fiyata gore</small>
                    </article>
                    <article className={selectedAssetDetail.netRealized >= 0 ? "positive-card" : "negative-card"}>
                      <span>Gerceklesmis</span>
                      <TrendValue trend={selectedAssetDetail.netRealized}>{signedMoney(selectedAssetDetail.netRealized)}</TrendValue>
                      <small>Satis ve gelirlerden</small>
                    </article>
                    <article>
                      <span>Toplam hareket</span>
                      <strong>{selectedAssetDetail.transactions.length}</strong>
                      <small>Alis, satis, gelir/gider</small>
                    </article>
                  </div>
                  <div className="transaction-story">
                    {selectedAssetDetail.storyRows.map((row) => (
                      <div className={`transaction-story-row ${row.tone}`} key={row.tx.id}>
                        <div className="story-index">{row.index}</div>
                        <div className="story-main">
                          <div className="story-title">
                            <span className={`transaction-type ${row.tx.type}`}>{row.label}</span>
                            <strong>{row.title}</strong>
                            <small>{row.tx.date}</small>
                          </div>
                          <div className="story-meta">
                            <span>Tutar <b>{money(row.amount)}</b></span>
                            {row.tx.price ? <span>Birim <b>{money(row.tx.price, selectedAssetDetail.asset.currency)}</b></span> : null}
                            {row.tx.fee ? <span>Komisyon <b>{money(row.tx.fee)}</b></span> : null}
                            {row.remaining !== null ? <span>Kalan <b>{num(row.remaining)} adet</b></span> : null}
                          </div>
                          {row.tx.note ? <p>{row.tx.note}</p> : null}
                        </div>
                        <div className="story-result">
                          <span>{row.resultLabel}</span>
                          <strong className={row.realized >= 0 ? "positive" : "negative"}>{row.resultText}</strong>
                        </div>
                        <button className="icon-btn" onClick={() => void deleteTransaction(row.tx.id)} title="Sil">x</button>
                      </div>
                    ))}
                  </div>
                </>
              ) : <div className="empty">Bu varlik icin henuz islem kaydi yok.</div>}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
