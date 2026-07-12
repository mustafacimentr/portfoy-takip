import { requirePasscode } from "../_lib/auth";

function compactBistCode(value: string) {
  return String(value || "").toUpperCase().replace(/^BIST:/, "").replace(/[^A-Z0-9]/g, "");
}

function yahooSymbol(value: string) {
  if (String(value || "").includes("=") || String(value || "").startsWith("^")) return value;
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
  const finalSymbol = symbol.toUpperCase();
  const endpoints = [
    "https://api.binance.com",
    "https://api1.binance.com",
    "https://api2.binance.com",
    "https://api3.binance.com",
    "https://data-api.binance.vision",
  ];
  let lastError = "Binance fiyati okunamadi";

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}/api/v3/ticker/price?symbol=${encodeURIComponent(finalSymbol)}`, {
        headers: { "user-agent": "Mozilla/5.0" },
      });
      if (!response.ok) {
        lastError = `Binance ${response.status}`;
        continue;
      }
      const data = await response.json() as { price?: string };
      const price = Number(data.price);
      if (Number.isFinite(price) && price > 0) return { price, source: "Binance", symbol: finalSymbol };
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }
  }

  for (const fallback of [cryptoCompareTryPrice, coinGeckoTryPrice, coinPaprikaTryPrice]) {
    try {
      return await fallback(finalSymbol);
    } catch {
      // Try the next public crypto source. Some providers block cloud egress.
    }
  }

  throw new Error(`${lastError}; kripto yedek kaynak da okunamadi`);
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

const cryptoCompareSymbols: Record<string, string[]> = {
  RNDR: ["RNDR", "RENDER"],
  RENDER: ["RENDER", "RNDR"],
};

function cryptoBaseFromSymbol(symbol: string) {
  const compact = compactBistCode(symbol);
  const quote = ["TRY", "USDT", "USD", "EUR"].find((suffix) => compact.endsWith(suffix));
  return quote ? compact.slice(0, -quote.length) : compact;
}

async function coinGeckoTryPrice(symbol: string) {
  const base = cryptoBaseFromSymbol(symbol);
  const id = coinGeckoIds[base];
  if (!id) throw new Error(`Kripto yedek kaynakta ${base} tanimli degil`);
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=try`, {
    headers: { "accept": "application/json", "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error(`CoinGecko ${response.status}`);
  const data = await response.json() as Record<string, { try?: number }>;
  const price = Number(data[id]?.try);
  if (!Number.isFinite(price) || price <= 0) throw new Error("Kripto yedek fiyat okunamadi");
  return { price, source: "CoinGecko", symbol: `${base}TRY` };
}

async function cryptoCompareTryPrice(symbol: string) {
  const base = cryptoBaseFromSymbol(symbol);
  const candidates = cryptoCompareSymbols[base] || [base];
  for (const candidate of candidates) {
    const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${encodeURIComponent(candidate)}&tsyms=TRY`, {
      headers: { "accept": "application/json", "user-agent": "Mozilla/5.0" },
    });
    if (!response.ok) continue;
    const data = await response.json() as { TRY?: number; Response?: string };
    const price = Number(data.TRY);
    if (Number.isFinite(price) && price > 0) return { price, source: "CryptoCompare", symbol: `${candidate}TRY` };
  }
  throw new Error("CryptoCompare fiyati okunamadi");
}

async function coinPaprikaTryPrice(symbol: string) {
  const base = cryptoBaseFromSymbol(symbol);
  const id = coinPaprikaIds[base];
  if (!id) throw new Error(`CoinPaprika'da ${base} tanimli degil`);
  const response = await fetch(`https://api.coinpaprika.com/v1/tickers/${encodeURIComponent(id)}?quotes=TRY`, {
    headers: { "accept": "application/json", "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error(`CoinPaprika ${response.status}`);
  const data = await response.json() as { quotes?: { TRY?: { price?: number } } };
  const price = Number(data.quotes?.TRY?.price);
  if (!Number.isFinite(price) || price <= 0) throw new Error("CoinPaprika fiyati okunamadi");
  return { price, source: "CoinPaprika", symbol: `${base}TRY` };
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
