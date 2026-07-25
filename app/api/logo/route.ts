function compact(value: string) {
  return String(value || "").toUpperCase().replace(/^BIST:/, "").replace(/\.IS$/, "").replace(/[^A-Z0-9]/g, "");
}

function favicon(domain: string, size = 128) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

function redirectImage(url: string) {
  return Response.redirect(url, 302);
}

function hostFromUrl(value?: string) {
  if (!value) return "";
  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const fundLogoDomains: Record<string, string> = {
  AFT: "akportfoy.com.tr",
  AFA: "akportfoy.com.tr",
  AFO: "akportfoy.com.tr",
  AFS: "akportfoy.com.tr",
  TMG: "isportfoy.com.tr",
  TGE: "isportfoy.com.tr",
  KPH: "isportfoy.com.tr",
  IPB: "isportfoy.com.tr",
  IHK: "isportfoy.com.tr",
  GMR: "garantiportfoy.com.tr",
  GSP: "garantiportfoy.com.tr",
  DVT: "denizportfoy.com",
  ZBJ: "ziraatportfoy.com.tr",
  MAC: "marmaracapital.com.tr",
  TTE: "tebportfoy.com.tr",
  TCD: "tacirlerportfoy.com.tr",
};

const stockLogoDomains: Record<string, string> = {
  AKBNK: "akbank.com",
  AKSA: "aksa.com",
  AKSEN: "aksen.com.tr",
  ALARK: "alarko.com.tr",
  ARCLK: "arcelikglobal.com",
  ASELS: "aselsan.com",
  ASTOR: "astoras.com.tr",
  BIMAS: "bim.com.tr",
  CCOLA: "cci.com.tr",
  CIMSA: "cimsa.com.tr",
  DOAS: "dogusotomotiv.com.tr",
  EKGYO: "emlakkonut.com.tr",
  ENJSA: "enerjisaenerji.com.tr",
  ENKAI: "enka.com",
  EREGL: "erdemir.com.tr",
  FROTO: "fordotosan.com.tr",
  GARAN: "garantibbva.com.tr",
  GUBRF: "gubretas.com.tr",
  HALKB: "halkbank.com.tr",
  HEKTS: "hektas.com.tr",
  ISCTR: "isbank.com.tr",
  KCHOL: "koc.com.tr",
  KRDMD: "kardemir.com",
  KTLEV: "katilimevim.com.tr",
  MGROS: "migroskurumsal.com",
  OYAKC: "oyakcimento.com",
  PETKM: "petkim.com.tr",
  PGSUS: "flypgs.com",
  QNBTR: "qnb.com.tr",
  SAHOL: "sabanci.com",
  SASA: "sasa.com.tr",
  SISE: "sisecam.com.tr",
  TAVHL: "tavhavalimanlari.com.tr",
  TCELL: "turkcell.com.tr",
  THYAO: "thy.com",
  TKFEN: "tekfen.com.tr",
  TOASO: "tofas.com.tr",
  TTKOM: "turktelekom.com.tr",
  TUPRS: "tupras.com.tr",
  ULKER: "ulker.com.tr",
  VAKBN: "vakifbank.com.tr",
  YKBNK: "yapikredi.com.tr",
  ZOREN: "zorluenerji.com.tr",
};

const directStockLogos: Record<string, string> = {
  FROTO: "https://companieslogo.com/img/orig/FROTO.IS-0beb2e34.png?t=1720244491",
  ULKER: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/%C3%9Clker_logo_%282%29.svg/250px-%C3%9Clker_logo_%282%29.svg.png",
};

const cryptoDirectLogos: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  XRP: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  ADA: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  TRX: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  SUI: "https://assets.coingecko.com/coins/images/26375/small/sui-ocean-square.png",
  NEAR: "https://assets.coingecko.com/coins/images/10365/small/near.jpg",
  ALGO: "https://assets.coingecko.com/coins/images/4380/small/download.png",
  ONDO: "https://assets.coingecko.com/coins/images/26580/small/ONDO.png",
  RENDER: "https://assets.coingecko.com/coins/images/11636/small/rndr.png",
  RNDR: "https://assets.coingecko.com/coins/images/11636/small/rndr.png",
};

function coinCapIcon(symbol: string) {
  return `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
}

async function tradingViewLogo(code: string) {
  const params = new URLSearchParams({ text: code, exchange: "BIST", type: "stock" });
  const response = await fetch(`https://symbol-search.tradingview.com/symbol_search/?${params.toString()}`, {
    headers: { accept: "application/json", "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) return "";
  const rows = await response.json() as Array<{ symbol?: string; exchange?: string; logoid?: string }>;
  const match = rows.find((row) => compact(row.symbol || "") === code && String(row.exchange || "").toUpperCase() === "BIST")
    || rows.find((row) => compact(row.symbol || "") === code)
    || rows[0];
  return match?.logoid ? `https://s3-symbol-logo.tradingview.com/${match.logoid}.svg` : "";
}

async function yahooCompanyLogo(code: string) {
  const symbol = `${code}.IS`;
  const response = await fetch(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=assetProfile`, {
    headers: { accept: "application/json", "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) return "";
  const data = await response.json() as any;
  const website = data?.quoteSummary?.result?.[0]?.assetProfile?.website;
  const host = hostFromUrl(website);
  return host ? favicon(host) : "";
}

async function coinGeckoLogo(symbol: string) {
  const direct = cryptoDirectLogos[symbol] || cryptoDirectLogos[symbol === "RNDR" ? "RENDER" : symbol];
  if (direct) return direct;
  const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`, {
    headers: { accept: "application/json", "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) return "";
  const data = await response.json() as { coins?: Array<{ symbol?: string; large?: string; thumb?: string }> };
  const match = data.coins?.find((coin) => coin.symbol?.toUpperCase() === symbol) || data.coins?.[0];
  return match?.large || match?.thumb || "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = compact(searchParams.get("code") || searchParams.get("symbol") || "");
  const source = String(searchParams.get("source") || "").toLowerCase();
  const type = String(searchParams.get("type") || "").toLowerCase();
  if (!code) return new Response("Logo code required", { status: 400 });

  const headers = { "cache-control": "public, max-age=86400, stale-while-revalidate=604800" };
  try {
    if (type.includes("kripto") || source === "binance") {
      const base = code.replace(/(TRY|USDT|USD|EUR)$/i, "");
      const logo = await coinGeckoLogo(base);
      return redirectImage(logo || coinCapIcon(base));
    }
    if (type.includes("fon") || source.includes("portfoy") || source === "tefas") {
      const domain = fundLogoDomains[code] || (source === "akportfoy" ? "akportfoy.com.tr" : source === "isportfoy" ? "isportfoy.com.tr" : "tefas.gov.tr");
      return redirectImage(favicon(domain));
    }
    const tradingView = await tradingViewLogo(code);
    if (tradingView) return redirectImage(tradingView);

    const yahoo = await yahooCompanyLogo(code);
    if (yahoo) return redirectImage(yahoo);

    if (directStockLogos[code]) return redirectImage(directStockLogos[code]);
    if (stockLogoDomains[code]) return redirectImage(favicon(stockLogoDomains[code]));
  } catch {
    // Keep the UI fallback visible if every external logo source fails.
  }

  return new Response("Logo not found", { status: 404, headers });
}
