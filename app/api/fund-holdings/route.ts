import { requirePasscode } from "../_lib/auth";

type Holding = {
  id: string;
  fundCode: string;
  symbol: string;
  name: string;
  weight: number;
  sector: string;
  country: string;
  source: string;
  asOf: string;
};

function compact(value: string) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function row(fundCode: string, symbol: string, name: string, weight: number, sector: string, country: string, source: string, asOf: string): Holding {
  return { id: `${fundCode}-${symbol}`, fundCode, symbol, name, weight, sector, country, source, asOf };
}

const catalogAsOf = "2026-07";
const sourceLabel = "Uygulama katalogu";
const isPortfoyTmgSource = "Is Portfoy resmi Haziran 2026 portfoy dokumu";
const isPortfoyTgeSource = "Is Portfoy resmi Haziran 2026 portfoy dokumu";
const isPortfoyKphSource = "Is Portfoy resmi Haziran 2026 portfoy dokumu";

const fundHoldingCatalog: Record<string, Holding[]> = {
  TMG: [
    row("TMG", "AAPL", "Apple", 8.88, "Teknoloji", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "NVDA", "Nvidia", 7.97, "Yari iletken", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "AMZN", "Amazon", 5.48, "Tuketim", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "GOOGL", "Alphabet Class A", 4.94, "Iletisim", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "MSFT", "Microsoft", 4.28, "Teknoloji", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "AVGO", "Broadcom", 4.1, "Yari iletken", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "GOOG", "Alphabet Class C", 3.94, "Iletisim", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "JPM", "JPMorgan Chase", 2.73, "Banka", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "SMSN", "Samsung Electronics", 2.67, "Teknoloji", "Guney Kore", isPortfoyTmgSource, "2026-06"),
    row("TMG", "LLY", "Eli Lilly", 2.2, "Saglik", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "ASML", "ASML Holding", 1.96, "Yari iletken", "Hollanda", isPortfoyTmgSource, "2026-06"),
    row("TMG", "MA", "Mastercard", 1.95, "Finans", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "INTC", "Intel", 1.51, "Yari iletken", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "NVDL", "GraniteShares 2x Long NVDA ETF", 1.49, "ETF", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "TREASURY", "ABD Hazine Bonosu", 1.42, "Tahvil", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "JNJ", "Johnson & Johnson", 1.4, "Saglik", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "XOM", "Exxon Mobil", 1.31, "Enerji", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "WMT", "Walmart", 1.25, "Perakende", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "GS", "Goldman Sachs", 1.24, "Finans", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "CAT", "Caterpillar", 1.2, "Sanayi", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "C", "Citigroup", 1.2, "Banka", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "V", "Visa", 1.02, "Finans", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "GE", "General Electric", 1.01, "Sanayi", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "MSFU", "Direxion Daily MSFT Bull 2x", 1, "ETF", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "NESN", "Nestle", 0.94, "Tuketim", "Isvicre", isPortfoyTmgSource, "2026-06"),
    row("TMG", "SIE", "Siemens Energy", 0.9, "Sanayi", "Almanya", isPortfoyTmgSource, "2026-06"),
    row("TMG", "PG", "Procter & Gamble", 0.85, "Tuketim", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "MRK", "Merck", 0.84, "Saglik", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "MUFG", "Mitsubishi UFJ Financial", 0.84, "Banka", "Japonya", isPortfoyTmgSource, "2026-06"),
    row("TMG", "SAN", "Banco Santander", 0.83, "Banka", "Ispanya", isPortfoyTmgSource, "2026-06"),
    row("TMG", "NOVN", "Novartis", 0.72, "Saglik", "Isvicre", isPortfoyTmgSource, "2026-06"),
    row("TMG", "6525", "Kokusai Electric", 0.68, "Yari iletken", "Japonya", isPortfoyTmgSource, "2026-06"),
    row("TMG", "MS", "Morgan Stanley", 0.65, "Finans", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "KO", "Coca-Cola", 0.63, "Icecek", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "RTX", "RTX", 0.63, "Savunma", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "TXN", "Texas Instruments", 0.63, "Yari iletken", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "CSCO", "Cisco Systems", 0.6, "Teknoloji", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "HSBC", "HSBC Holdings", 0.6, "Banka", "Birlesik Krallik", isPortfoyTmgSource, "2026-06"),
    row("TMG", "IBM", "IBM", 0.59, "Teknoloji", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "LIN", "Linde", 0.52, "Kimya", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "CVX", "Chevron", 0.51, "Enerji", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "QCOM", "Qualcomm", 0.48, "Yari iletken", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "SAP", "SAP", 0.47, "Teknoloji", "Almanya", isPortfoyTmgSource, "2026-06"),
    row("TMG", "PEP", "PepsiCo", 0.45, "Icecek", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "AAPB", "GraniteShares 2x Long AAPL ETF", 0.43, "ETF", "ABD", isPortfoyTmgSource, "2026-06"),
    row("TMG", "SU", "Schneider Electric", 0.42, "Sanayi", "Fransa", isPortfoyTmgSource, "2026-06"),
    row("TMG", "IAG", "Is Portfoy Fon", 0.41, "Yatirim Fonu", "Turkiye", isPortfoyTmgSource, "2026-06"),
    row("TMG", "SONY", "Sony", 0.41, "Teknoloji", "Japonya", isPortfoyTmgSource, "2026-06"),
    row("TMG", "SHEL", "Shell", 0.4, "Enerji", "Birlesik Krallik", isPortfoyTmgSource, "2026-06"),
    row("TMG", "SANOFI", "Sanofi", 0.38, "Saglik", "Fransa", isPortfoyTmgSource, "2026-06"),
    row("TMG", "ISZ", "Is Portfoy Fon", 0.36, "Yatirim Fonu", "Turkiye", isPortfoyTmgSource, "2026-06"),
  ],
  TGE: [
    row("TGE", "AIGI", "ETFS Industrial Metals", 17.01, "Endustriyel metal", "Kuresel", isPortfoyTgeSource, "2026-06"),
    row("TGE", "AIGE", "WT Energy", 13.4, "Enerji emtiasi", "Kuresel", isPortfoyTgeSource, "2026-06"),
    row("TGE", "COPA", "ETFS Copper", 13.37, "Bakir", "Kuresel", isPortfoyTgeSource, "2026-06"),
    row("TGE", "OILK", "ProShares K-1 Free Crude Oil Strategy ETF", 8.52, "Petrol", "ABD", isPortfoyTgeSource, "2026-06"),
    row("TGE", "PHAU", "ETFS Physical Gold", 7.92, "Altin", "Kuresel", isPortfoyTgeSource, "2026-06"),
    row("TGE", "CRUD", "ETFS WTI Crude Oil", 7.72, "Petrol", "Kuresel", isPortfoyTgeSource, "2026-06"),
    row("TGE", "NGAS", "WisdomTree Natural Gas Fund", 7.25, "Dogalgaz", "Kuresel", isPortfoyTgeSource, "2026-06"),
    row("TGE", "USD", "ABD Dolari", 6.39, "Doviz", "ABD", isPortfoyTgeSource, "2026-06"),
    row("TGE", "ALUM", "WisdomTree Commodity Securities", 5.99, "Aluminyum", "Kuresel", isPortfoyTgeSource, "2026-06"),
    row("TGE", "NICK", "WisdomTree Nickel Fund", 3.02, "Nikel", "Kuresel", isPortfoyTgeSource, "2026-06"),
    row("TGE", "GLD", "SPDR Gold Shares", 2.8, "Altin", "ABD", isPortfoyTgeSource, "2026-06"),
    row("TGE", "XLE", "Energy Select Sector SPDR Fund", 1.95, "Enerji hisseleri", "ABD", isPortfoyTgeSource, "2026-06"),
    row("TGE", "SLV", "iShares Silver Trust", 1.62, "Gumus", "ABD", isPortfoyTgeSource, "2026-06"),
    row("TGE", "ONSU", "Is Portfoy Altin Fonu", 1.52, "Altin fonu", "Turkiye", isPortfoyTgeSource, "2026-06"),
    row("TGE", "GMSTR", "Gumus BYF", 0.72, "Gumus", "Turkiye", isPortfoyTgeSource, "2026-06"),
    row("TGE", "IOO", "Is Portfoy Fon", 0.38, "Yatirim Fonu", "Turkiye", isPortfoyTgeSource, "2026-06"),
    row("TGE", "CAD", "Kanada Dolari", 0.01, "Doviz", "Kanada", isPortfoyTgeSource, "2026-06"),
  ],
  KPH: [
    row("KPH", "AEFES", "Anadolu Efes", 4.91, "Icecek", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "AGESA", "AgeSA Hayat ve Emeklilik", 3.85, "Sigorta", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "AKBNK", "Akbank", 4.71, "Banka", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "AKSA", "Aksa Akrilik", 0.68, "Kimya", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "AKSGY", "Akis GYO", 4.46, "GYO", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "ALARK", "Alarko Holding", 1.89, "Holding", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "ANHYT", "Anadolu Hayat Emeklilik", 5.07, "Sigorta", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "ANSGR", "Anadolu Sigorta", 2.18, "Sigorta", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "ARASE", "Dogu Aras Enerji", 4.81, "Enerji", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "AYGAZ", "Aygaz", 1.35, "Enerji", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "BASGZ", "Baskent Dogalgaz", 4.86, "Enerji", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "BIMAS", "Bim Birlesik Magazalar", 5.13, "Perakende", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "CCOLA", "Coca-Cola Icecek", 1.06, "Icecek", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "EKGYO", "Emlak Konut GYO", 1.16, "GYO", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "ENJSA", "Enerjisa Enerji", 4.08, "Enerji", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "GARAN", "Garanti Bankasi", 5.03, "Banka", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "GLRMK", "Gulermak Agir Sanayi", 0.58, "Insaat", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "ISCTR", "Is Bankasi", 1.78, "Banka", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "KCHOL", "Koc Holding", 4.14, "Holding", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "LKMNH", "Lokman Hekim", 0.42, "Saglik", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "MGROS", "Migros Ticaret", 5.5, "Perakende", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "NTGAZ", "Naturelgaz", 1.34, "Enerji", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "SAHOL", "Sabanci Holding", 5.66, "Holding", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "TAVHL", "TAV Havalimanlari", 4.5, "Ulastirma", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "TCELL", "Turkcell", 5.14, "Iletisim", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "THYAO", "Turk Hava Yollari", 3.23, "Ulastirma", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "TOASO", "Tofas", 1.72, "Otomotiv", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "TRALT", "Turk Altin Isletmeleri", 1.12, "Maden", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "TURSG", "Turkiye Sigorta", 1.08, "Sigorta", "Turkiye", isPortfoyKphSource, "2026-06"),
    row("KPH", "YKBNK", "Yapi ve Kredi Bankasi", 3.22, "Banka", "Turkiye", isPortfoyKphSource, "2026-06"),
  ],
  AFT: [
    row("AFT", "NVDA", "Nvidia", 9.4, "Yari iletken", "ABD", sourceLabel, catalogAsOf),
    row("AFT", "MSFT", "Microsoft", 8.1, "Teknoloji", "ABD", sourceLabel, catalogAsOf),
    row("AFT", "AAPL", "Apple", 6.4, "Teknoloji", "ABD", sourceLabel, catalogAsOf),
    row("AFT", "META", "Meta Platforms", 5.2, "Iletisim", "ABD", sourceLabel, catalogAsOf),
    row("AFT", "AVGO", "Broadcom", 4.8, "Yari iletken", "ABD", sourceLabel, catalogAsOf),
    row("AFT", "AMZN", "Amazon", 4.4, "Tuketim", "ABD", sourceLabel, catalogAsOf),
    row("AFT", "TSLA", "Tesla", 3.6, "Otomotiv", "ABD", sourceLabel, catalogAsOf),
  ],
};

export async function GET(request: Request) {
  const authError = await requirePasscode(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const code = compact(url.searchParams.get("code") || "");
  const codes = url.searchParams.get("codes")?.split(",").map(compact).filter(Boolean) || [];
  const requested = code ? [code] : codes;
  if (!requested.length) return Response.json({ error: "Fon kodu gerekli" }, { status: 400 });

  const results = requested.map((fundCode) => {
    const holdings = fundHoldingCatalog[fundCode] || [];
    return {
      fundCode,
      ok: holdings.length > 0,
      source: holdings[0]?.source || "",
      asOf: holdings[0]?.asOf || "",
      holdings,
      message: holdings.length ? "Fon icerigi bulundu" : "Bu fon icin otomatik icerik katalogu yok",
    };
  });

  return Response.json({ ok: true, funds: results });
}
