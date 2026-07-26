function compact(value: string) {
  return String(value || "").toUpperCase().replace(/^BIST:/, "").replace(/\.IS$/, "").replace(/[^A-Z0-9]/g, "");
}

function favicon(domain: string, size = 128) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

function redirectImage(url: string) {
  return Response.redirect(url, 302);
}

function absoluteUrl(value: string, base: string) {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed.startsWith("data:")) return "";
  try {
    return new URL(trimmed, base).toString();
  } catch {
    return "";
  }
}

function readAttr(tag: string, name: string) {
  return tag.match(new RegExp(`${name}=["']([^"']+)`, "i"))?.[1] || "";
}

function bestWebsiteLogo(html: string, baseUrl: string) {
  const candidates: Array<{ url: string; score: number }> = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const rel = readAttr(tag, "rel").toLowerCase();
    const href = absoluteUrl(readAttr(tag, "href"), baseUrl);
    if (!href || (!rel.includes("icon") && !rel.includes("apple-touch"))) continue;
    const text = `${rel} ${href}`.toLowerCase();
    const score = (rel.includes("apple-touch") ? 40 : 0)
      + (text.includes("logo") ? 25 : 0)
      + (text.includes("192") || text.includes("180") || text.includes("512") ? 15 : 0)
      + (href.endsWith(".svg") ? 10 : 0)
      - (rel.includes("mask-icon") ? 20 : 0);
    candidates.push({ url: href, score });
  }
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const key = `${readAttr(tag, "property")} ${readAttr(tag, "name")}`.toLowerCase();
    const content = absoluteUrl(readAttr(tag, "content"), baseUrl);
    if (content && /og:image|twitter:image/.test(key)) {
      candidates.push({ url: content, score: content.toLowerCase().includes("logo") ? 30 : 8 });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.url || "";
}

function svgImage(svg: string) {
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

function seededColor(code: string) {
  let hash = 0;
  for (const char of code) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const palette = ["#123a6f", "#006b5f", "#a0183f", "#d18b00", "#145c9e", "#2f6b3f", "#6d4fc2", "#b43b2d"];
  return palette[hash % palette.length];
}

function brandedFallback(code: string) {
  const label = code.slice(0, Math.min(3, Math.max(2, code.length)));
  const color = seededColor(code);
  return svgImage(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="58" fill="#f4f7fb" stroke="${color}" stroke-width="7"/>
      <circle cx="64" cy="64" r="44" fill="${color}"/>
      <text x="64" y="72" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800" fill="#fff">${label}</text>
    </svg>
  `);
}

function qnbLogo() {
  return svgImage(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="58" fill="#f4f7fb"/>
      <g transform="translate(64 64)">
        <path d="M0-43 10-24 30-37 23-14 45-10 24 0 45 10 23 14 30 37 10 24 0 43-10 24-30 37-23 14-45 10-24 0-45-10-23-14-30-37-10-24Z" fill="#0a4f86"/>
        <path d="M-29-44-6-19 0-30 6-19 29-44 41-32 10 1H-10L-41-32Z" fill="#b00555"/>
        <circle r="14" fill="#f4f7fb"/>
      </g>
    </svg>
  `);
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
  AEFES: "anadoluefes.com.tr",
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
  KCHOL: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Ko%C3%A7_Holding_-_logo_%28Turkey%2C_1984%29.svg/250px-Ko%C3%A7_Holding_-_logo_%28Turkey%2C_1984%29.svg.png",
  KTLEV: "https://www.katilimevim.com.tr/katilimyeni/cdn/uploads/000004883_logo.svg",
  QNBTR: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/QNB_Logo.svg/128px-QNB_Logo.svg.png",
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
  return host ? await websiteLogo(host) : "";
}

async function websiteLogo(domain: string) {
  const home = `https://${domain}`;
  try {
    const response = await fetch(home, {
      headers: { accept: "text/html,application/xhtml+xml", "user-agent": "Mozilla/5.0" },
    });
    if (response.ok) {
      const html = await response.text();
      const logo = bestWebsiteLogo(html, response.url || home);
      if (logo) return logo;
    }
  } catch {
    // Favicon fallback below keeps the logo slot populated when the website blocks scraping.
  }
  return favicon(domain);
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

  try {
    if (code === "QNBTR") return qnbLogo();

    if (type.includes("kripto") || source === "binance") {
      const base = code.replace(/(TRY|USDT|USD|EUR)$/i, "");
      const logo = await coinGeckoLogo(base);
      return redirectImage(logo || coinCapIcon(base));
    }
    if (type.includes("fon") || source.includes("portfoy") || source === "tefas") {
      const domain = fundLogoDomains[code] || (source === "akportfoy" ? "akportfoy.com.tr" : source === "isportfoy" ? "isportfoy.com.tr" : "tefas.gov.tr");
      return redirectImage(favicon(domain));
    }
    if (directStockLogos[code]) return redirectImage(directStockLogos[code]);

    if (stockLogoDomains[code]) return redirectImage(await websiteLogo(stockLogoDomains[code]));

    const yahoo = await yahooCompanyLogo(code);
    if (yahoo) return redirectImage(yahoo);

    const tradingView = await tradingViewLogo(code);
    if (tradingView) return redirectImage(tradingView);
  } catch {
    // Keep the UI fallback visible if every external logo source fails.
  }

  return brandedFallback(code);
}
