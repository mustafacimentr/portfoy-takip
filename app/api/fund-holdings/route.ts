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

const fundHoldingCatalog: Record<string, Holding[]> = {
  TMG: [
    row("TMG", "MSFT", "Microsoft", 8.5, "Teknoloji", "ABD", sourceLabel, catalogAsOf),
    row("TMG", "NVDA", "Nvidia", 7.8, "Yari iletken", "ABD", sourceLabel, catalogAsOf),
    row("TMG", "AAPL", "Apple", 7.2, "Teknoloji", "ABD", sourceLabel, catalogAsOf),
    row("TMG", "GOOGL", "Alphabet", 5.6, "Iletisim", "ABD", sourceLabel, catalogAsOf),
    row("TMG", "AMZN", "Amazon", 4.8, "Tuketim", "ABD", sourceLabel, catalogAsOf),
    row("TMG", "META", "Meta Platforms", 4.2, "Iletisim", "ABD", sourceLabel, catalogAsOf),
    row("TMG", "AVGO", "Broadcom", 3.7, "Yari iletken", "ABD", sourceLabel, catalogAsOf),
  ],
  TGE: [
    row("TGE", "ALTIN", "Altin ve altin fonlari", 35, "Emtia", "Kuresel", sourceLabel, catalogAsOf),
    row("TGE", "GUMUS", "Gumus ve degerli metaller", 18, "Emtia", "Kuresel", sourceLabel, catalogAsOf),
    row("TGE", "ENERJI", "Enerji emtialari", 14, "Emtia", "Kuresel", sourceLabel, catalogAsOf),
    row("TGE", "MADEN", "Maden sirketleri", 10, "Maden", "Kuresel", sourceLabel, catalogAsOf),
    row("TGE", "TARIM", "Tarim emtialari", 7, "Emtia", "Kuresel", sourceLabel, catalogAsOf),
  ],
  KPH: [
    row("KPH", "TUPRS", "Tupras", 8.2, "Enerji", "Turkiye", sourceLabel, catalogAsOf),
    row("KPH", "BIMAS", "Bim Birlesik Magazalar", 7.6, "Perakende", "Turkiye", sourceLabel, catalogAsOf),
    row("KPH", "FROTO", "Ford Otosan", 6.9, "Otomotiv", "Turkiye", sourceLabel, catalogAsOf),
    row("KPH", "AKBNK", "Akbank", 5.8, "Banka", "Turkiye", sourceLabel, catalogAsOf),
    row("KPH", "ASELS", "Aselsan", 4.7, "Savunma", "Turkiye", sourceLabel, catalogAsOf),
    row("KPH", "THYAO", "Turk Hava Yollari", 4.3, "Ulastirma", "Turkiye", sourceLabel, catalogAsOf),
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
