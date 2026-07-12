import { requirePasscode } from "../_lib/auth";

function compactBistCode(value: string) {
  return String(value || "").toUpperCase().replace(/^BIST:/, "").replace(/[^A-Z0-9]/g, "");
}

function yahooSymbol(value: string) {
  const compact = compactBistCode(value);
  if (compact === "GMSTRF") return "GMSTR.IS";
  return String(value || "").includes(".") ? value : `${compact}.IS`;
}

function tradingViewCandidates(value: string) {
  const compact = compactBistCode(value);
  const aliases: Record<string, string[]> = {
    ALTINS1: ["BIST:ALTIN", "BIST:ALTINS1", "BIST:ALTIN.S1", "BIST:ALTIN_S1"],
    GMSTRF: ["BIST:GMSTR", "BIST:GMSTRF", "BIST:GMSTR.F", "BIST:GMSTR_F"],
  };
  return [...new Set([...(aliases[compact] || []), `BIST:${compact}`])];
}

async function yahooPrice(symbol: string) {
  const finalSymbol = yahooSymbol(symbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(finalSymbol)}?interval=1m&range=1d`;
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`Yahoo ${response.status}`);
  const data = await response.json() as any;
  const result = data?.chart?.result?.[0];
  const metaPrice = Number(result?.meta?.regularMarketPrice);
  if (Number.isFinite(metaPrice) && metaPrice > 0) return { price: metaPrice, source: "Yahoo", symbol: finalSymbol };
  const closes = result?.indicators?.quote?.[0]?.close || [];
  const lastClose = [...closes].reverse().find((value) => Number.isFinite(Number(value)) && Number(value) > 0);
  if (lastClose) return { price: Number(lastClose), source: "Yahoo", symbol: finalSymbol };
  throw new Error("Yahoo fiyati okunamadi");
}

async function tradingViewPrice(symbol: string) {
  const candidates = tradingViewCandidates(symbol);
  const response = await fetch("https://scanner.tradingview.com/turkey/scan", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "Mozilla/5.0" },
    body: JSON.stringify({
      symbols: { tickers: candidates, query: { types: [] } },
      columns: ["name", "description", "close", "currency", "exchange"],
    }),
  });
  if (!response.ok) throw new Error(`TradingView ${response.status}`);
  const data = await response.json() as any;
  const row = data?.data?.find((item: any) => Number.isFinite(Number(item?.d?.[2])) && Number(item.d[2]) > 0);
  if (!row) throw new Error(`TradingView sembolu bulunamadi: ${candidates.join(", ")}`);
  return { price: Number(row.d[2]), source: "TradingView", symbol: row.s };
}

const isPortfoyFunds: Record<string, string> = {
  TMG: "is-portfoy-yabanci-hisse-senedi-fonu",
  TGE: "is-portfoy-emtia-yabanci-byf-fon-sepeti-fonu",
  KPH: "is-portfoy-kar-payi-odeyen-hisse-senedi-tl-fonu-hisse-senedi-yogun-fon",
};

function parseTurkishNumber(value: string) {
  return Number(String(value || "").replace(/\./g, "").replace(",", "."));
}

async function isPortfoyPrice(symbol: string) {
  const code = compactBistCode(symbol);
  const slug = isPortfoyFunds[code] || String(symbol || "").replace(/^isportfoy:/i, "");
  if (!slug) throw new Error("Is Portfoy fon kodu gerekli");
  const response = await fetch(`https://www.isportfoy.com.tr/${slug}`, {
    headers: { "user-agent": "Mozilla/5.0", "accept-language": "tr-TR,tr;q=0.9,en;q=0.8" },
  });
  if (!response.ok) throw new Error(`Is Portfoy ${response.status}`);
  const html = await response.text();
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const match = text.match(/Fon Birim Fiyat[\s\S]{0,160}?([0-9]{2}\.[0-9]{2}\.[0-9]{4})\s+([0-9]+,[0-9]+)/i);
  if (!match) throw new Error("Is Portfoy fon fiyati okunamadi");
  const price = parseTurkishNumber(match[2]);
  if (!Number.isFinite(price) || price <= 0) throw new Error("Is Portfoy fiyat gecersiz");
  return { price, source: "Is Portfoy", symbol: code || slug, date: match[1] };
}

async function binancePrice(symbol: string) {
  const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(symbol.toUpperCase())}`, {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error(`Binance ${response.status}`);
  const data = await response.json() as { price?: string };
  const price = Number(data.price);
  if (!Number.isFinite(price) || price <= 0) throw new Error("Binance fiyati okunamadi");
  return { price, source: "Binance", symbol: symbol.toUpperCase() };
}

export async function GET(request: Request) {
  const authError = await requirePasscode(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const source = url.searchParams.get("source") || "";
  const symbol = url.searchParams.get("symbol") || "";
  if (!symbol) return Response.json({ error: "Sembol gerekli" }, { status: 400 });

  try {
    const result = source === "binance"
      ? await binancePrice(symbol)
      : source === "yahoo"
        ? await yahooPrice(symbol)
        : source === "tradingview"
          ? await tradingViewPrice(symbol)
          : source === "isportfoy"
            ? await isPortfoyPrice(symbol)
            : await yahooPrice(symbol).catch(() => tradingViewPrice(symbol)).catch(() => isPortfoyPrice(symbol));
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Fiyat alinamadi" }, { status: 500 });
  }
}
