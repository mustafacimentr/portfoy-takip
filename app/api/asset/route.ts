import { requirePasscode } from "../_lib/auth";

function compact(value: string) {
  return String(value || "").toUpperCase().replace(/^BIST:/, "").replace(/[^A-Z0-9]/g, "");
}

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

const knownFunds: Record<string, { name: string; domain: string; priceSource: string }> = {
  AFT: { name: "Ak Portfoy Yeni Teknolojiler Yabanci Hisse Senedi Fonu", domain: "akportfoy.com.tr", priceSource: "akportfoy" },
  TMG: { name: "Is Portfoy Yabanci Hisse Senedi Fonu", domain: "isportfoy.com.tr", priceSource: "isportfoy" },
  TGE: { name: "Is Portfoy Emtia Yabanci BYF Fon Sepeti Fonu", domain: "isportfoy.com.tr", priceSource: "isportfoy" },
  KPH: { name: "Is Portfoy Kar Payi Odeyen Hisse Senedi TL Fonu", domain: "isportfoy.com.tr", priceSource: "isportfoy" },
};

async function discoverFund(code: string) {
  const known = knownFunds[code];
  let name = known?.name || code;
  try {
    const response = await fetch(`https://www.tefas.gov.tr/tr/fon-detayli-analiz/${code}`, {
      headers: { "user-agent": "Mozilla/5.0", "accept-language": "tr-TR,tr;q=0.9" },
    });
    if (!response.ok) throw new Error("Fon bulunamadi");
    const html = await response.text();
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
      || html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1];
    if (title && !/javascript|support id/i.test(title)) name = title.replace(/\s*[-|].*$/, "").trim();
  } catch {
    if (!known) name = `${code} Yatirim Fonu`;
  }
  return {
    ticker: code,
    name,
    type: "Fon",
    currency: "TRY",
    priceSource: known?.priceSource || "tefas",
    priceSymbol: code,
    autoUpdate: true,
    logoUrl: favicon(known?.domain || "tefas.gov.tr"),
  };
}

async function discoverStock(code: string) {
  const symbol = `${code}.IS`;
  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`, {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error("BIST varligi bulunamadi");
  const data = await response.json() as any;
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error("BIST varligi bulunamadi");
  return {
    ticker: code,
    name: meta.longName || meta.shortName || code,
    type: "Hisse",
    currency: meta.currency || "TRY",
    priceSource: "yahoo",
    priceSymbol: symbol,
    autoUpdate: true,
  };
}

async function discoverCrypto(raw: string) {
  const parts = raw.toUpperCase().split(/[\/-]/).filter(Boolean);
  const base = compact(parts[0]);
  const quote = compact(parts[1] || "TRY");
  let name = base;
  let logoUrl = "";
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(base)}`, {
      headers: { accept: "application/json", "user-agent": "Mozilla/5.0" },
    });
    if (response.ok) {
      const data = await response.json() as { coins?: Array<{ symbol?: string; name?: string; large?: string; thumb?: string }> };
      const match = data.coins?.find((coin) => coin.symbol?.toUpperCase() === base) || data.coins?.[0];
      name = match?.name || name;
      logoUrl = match?.large || match?.thumb || "";
    }
  } catch {
    // The price sources still work when optional metadata discovery is unavailable.
  }
  return {
    ticker: `${base}/${quote}`,
    name,
    type: "Kripto",
    currency: quote,
    priceSource: "binance",
    priceSymbol: `${base === "RNDR" ? "RENDER" : base}${quote}`,
    autoUpdate: true,
    logoUrl,
  };
}

export async function GET(request: Request) {
  const authError = await requirePasscode(request);
  if (authError) return authError;
  const raw = new URL(request.url).searchParams.get("code")?.trim() || "";
  if (!raw) return Response.json({ error: "Varlik kodu gerekli" }, { status: 400 });
  const code = compact(raw);
  try {
    const result = /[\/-]/.test(raw)
      ? await discoverCrypto(raw)
      : code.length === 3
        ? await discoverFund(code)
        : await discoverStock(code);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Varlik bulunamadi" }, { status: 404 });
  }
}
