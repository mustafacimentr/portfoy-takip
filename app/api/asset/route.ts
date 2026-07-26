import { requirePasscode } from "../_lib/auth";

function compact(value: string) {
  return String(value || "").toUpperCase().replace(/^BIST:/, "").replace(/\.IS$/, "").replace(/[^A-Z0-9]/g, "");
}

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

const knownFunds: Record<string, { name: string; domain: string; priceSource: string }> = {
  AFT: { name: "Ak Portfoy Yeni Teknolojiler Yabanci Hisse Senedi Fonu", domain: "akportfoy.com.tr", priceSource: "akportfoy" },
  AFA: { name: "Ak Portfoy Amerika Yabanci Hisse Senedi Fonu", domain: "akportfoy.com.tr", priceSource: "tefas" },
  AFO: { name: "Ak Portfoy Alternatif Enerji Yabanci Hisse Senedi Fonu", domain: "akportfoy.com.tr", priceSource: "tefas" },
  AFS: { name: "Ak Portfoy Saglik Sektoru Yabanci Hisse Senedi Fonu", domain: "akportfoy.com.tr", priceSource: "tefas" },
  TMG: { name: "Is Portfoy Yabanci Hisse Senedi Fonu", domain: "isportfoy.com.tr", priceSource: "isportfoy" },
  TGE: { name: "Is Portfoy Emtia Yabanci BYF Fon Sepeti Fonu", domain: "isportfoy.com.tr", priceSource: "isportfoy" },
  KPH: { name: "Is Portfoy Kar Payi Odeyen Hisse Senedi TL Fonu", domain: "isportfoy.com.tr", priceSource: "isportfoy" },
  IPB: { name: "Is Portfoy Blockchain Teknolojileri Karma Fon", domain: "isportfoy.com.tr", priceSource: "tefas" },
  IHK: { name: "Is Portfoy Hisse Senedi Fonu", domain: "isportfoy.com.tr", priceSource: "tefas" },
  GMR: { name: "Garanti Portfoy Metaverse ve Yeni Teknolojiler Degisken Fon", domain: "garantiportfoy.com.tr", priceSource: "tefas" },
  GSP: { name: "Garanti Portfoy S&P 500 Yabanci BYF Fon Sepeti Fonu", domain: "garantiportfoy.com.tr", priceSource: "tefas" },
  DVT: { name: "Deniz Portfoy Teknoloji Sirketleri Hisse Senedi Fonu", domain: "denizportfoy.com", priceSource: "tefas" },
  ZBJ: { name: "Ziraat Portfoy Birinci Hisse Senedi Fonu", domain: "ziraatportfoy.com.tr", priceSource: "tefas" },
  MAC: { name: "Marmara Capital Portfoy Hisse Senedi Fonu", domain: "marmaracapital.com.tr", priceSource: "tefas" },
  TTE: { name: "TEB Portfoy Teknoloji Degisken Fon", domain: "tebportfoy.com.tr", priceSource: "tefas" },
  TCD: { name: "Tacirler Portfoy Degisken Fon", domain: "tacirlerportfoy.com.tr", priceSource: "tefas" },
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
  PETKM: "petkim.com.tr",
  PGSUS: "flypgs.com",
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

function coinCapIcon(symbol: string) {
  return `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
}

function logoApi(code: string, type: string, source: string) {
  const params = new URLSearchParams({ code, type, source, v: "6" });
  return `/api/logo?${params.toString()}`;
}

async function discoverFund(code: string) {
  const known = knownFunds[code];
  let name = known?.name || code;
  try {
    if (known) throw new Error("Bilinen fon");
    const response = await fetch(`https://www.tefas.gov.tr/tr/fon-detayli-analiz/${code}`, {
      headers: { "user-agent": "Mozilla/5.0", "accept-language": "tr-TR,tr;q=0.9" },
    });
    if (!response.ok) throw new Error("Fon bulunamadi");
    const html = await response.text();
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
      || html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1];
    if (title && !/javascript|support id|request rejected/i.test(title)) name = title.replace(/\s*[-|].*$/, "").trim();
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
    logoUrl: logoApi(code, "Hisse", "yahoo"),
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
    logoUrl: logoUrl || coinCapIcon(base),
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
