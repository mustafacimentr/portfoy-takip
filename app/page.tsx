"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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
};

type Transaction = {
  id: string;
  assetId: string;
  date: string;
  type: string;
  quantity: number;
  price: number;
  note: string;
};

type PortfolioState = {
  assets: Asset[];
  transactions: Transaction[];
  settings: { autoRefresh: boolean };
};

const emptyState: PortfolioState = {
  assets: [],
  transactions: [],
  settings: { autoRefresh: true },
};

const knownNames: Record<string, { name: string; type?: string; source?: string; symbol?: string }> = {
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
};

const types = ["Hisse", "Fon", "Kripto", "Doviz", "Altin", "Nakit", "Diger"];
const colors = ["#2f6fed", "#12805c", "#bc3d32", "#7557d6", "#c77d0e", "#0f8b8d", "#596579"];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function compactCode(value: string) {
  return String(value || "").toUpperCase().replace(/^BIST:/, "").replace(/[^A-Z0-9]/g, "");
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

function formatTime(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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
  return {
    id: asset.id || uid(),
    ticker: asset.ticker || details.ticker,
    name: asset.name || details.name,
    type: asset.type || details.type,
    currency: asset.currency || details.currency,
    priceSource: asset.priceSource || details.priceSource,
    priceSymbol: asset.priceSymbol || details.priceSymbol,
    autoUpdate: asset.autoUpdate !== false && (asset.priceSource || details.priceSource) !== "manual",
    fxRate: Number(asset.fxRate || details.fxRate || 1),
    quantity: Number(asset.quantity || 0),
    avgCost: Number(asset.avgCost || 0),
    costMode: "unit",
    price: Number(asset.price || asset.avgCost || 0),
    target: Number(asset.target || 0),
    note: asset.note || "",
    lastPriceAt: asset.lastPriceAt,
    lastPriceError: asset.lastPriceError,
  };
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [assetDraft, setAssetDraft] = useState<Asset | null>(null);
  const [lastSync, setLastSync] = useState("");

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
  }, [passcode, state.assets, state.settings.autoRefresh]);

  const totals = useMemo(() => {
    const totalValue = state.assets.reduce((sum, a) => sum + a.quantity * a.price * (a.fxRate || 1), 0);
    const totalCost = state.assets.reduce((sum, a) => sum + a.quantity * a.avgCost * (a.fxRate || 1), 0);
    const cash = state.assets.filter((a) => a.type === "Nakit").reduce((sum, a) => sum + a.quantity * a.price, 0);
    const pl = totalValue - totalCost;
    return { totalValue, totalCost, cash, pl, rate: totalCost ? (pl / totalCost) * 100 : 0 };
  }, [state.assets]);

  const filteredAssets = useMemo(() => {
    return state.assets.filter((asset) => {
      const text = `${asset.ticker} ${asset.name}`.toLowerCase();
      return text.includes(query.toLowerCase()) && (typeFilter === "all" || asset.type === typeFilter);
    });
  }, [state.assets, query, typeFilter]);

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
    setState({
      assets: (data.state.assets || []).map(normalizeAsset),
      transactions: data.state.transactions || [],
      settings: data.state.settings || { autoRefresh: true },
    });
    setLastSync(new Date().toISOString());
  }

  async function savePortfolio(nextState: PortfolioState) {
    setState(nextState);
    setSaving(true);
    try {
      await api("/api/portfolio", passcode, {
        method: "PUT",
        body: JSON.stringify({ state: nextState }),
      });
      setLastSync(new Date().toISOString());
    } finally {
      setSaving(false);
    }
  }

  async function updatePrices() {
    if (!passcode || !state.assets.length) return;
    setLoading(true);
    const updated = await Promise.all(
      state.assets.map(async (asset) => {
        if (!asset.autoUpdate || asset.priceSource === "manual") return asset;
        try {
          const url = `/api/price?source=${encodeURIComponent(asset.priceSource)}&symbol=${encodeURIComponent(asset.priceSymbol || asset.ticker)}`;
          const result = await api<{ price: number }>(url, passcode);
          return { ...asset, price: Number(result.price), lastPriceAt: new Date().toISOString(), lastPriceError: "" };
        } catch (error) {
          return { ...asset, lastPriceError: error instanceof Error ? error.message : "Fiyat alinamadi" };
        }
      }),
    );
    await savePortfolio({ ...state, assets: updated });
    setLoading(false);
  }

  async function submitAsset(event: FormEvent) {
    event.preventDefault();
    if (!assetDraft) return;
    let asset = normalizeAsset(assetDraft);
    if (asset.autoUpdate && asset.priceSource !== "manual") {
      try {
        const result = await api<{ price: number }>(
          `/api/price?source=${encodeURIComponent(asset.priceSource)}&symbol=${encodeURIComponent(asset.priceSymbol)}`,
          passcode,
        );
        asset = { ...asset, price: Number(result.price), lastPriceAt: new Date().toISOString(), lastPriceError: "" };
      } catch (error) {
        asset = { ...asset, price: asset.price || asset.avgCost, lastPriceError: error instanceof Error ? error.message : "Fiyat alinamadi" };
      }
    }
    const exists = state.assets.some((item) => item.id === asset.id);
    const assets = exists ? state.assets.map((item) => (item.id === asset.id ? asset : item)) : [...state.assets, asset];
    await savePortfolio({ ...state, assets });
    setAssetDraft(null);
  }

  function openAsset(asset?: Asset) {
    setAssetDraft(asset ? { ...asset } : normalizeAsset({ ticker: "BTC/TRY", quantity: 0, avgCost: 0, price: 0 }));
  }

  function updateDraftTicker(value: string) {
    const details = inferAssetDetails(value);
    setAssetDraft((draft) => normalizeAsset({ ...(draft || {}), ...details, ticker: details.ticker }));
  }

  async function deleteAsset(id: string) {
    if (!confirm("Bu varlik silinsin mi?")) return;
    await savePortfolio({
      ...state,
      assets: state.assets.filter((asset) => asset.id !== id),
      transactions: state.transactions.filter((tx) => tx.assetId !== id),
    });
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
      transactions: data.transactions || [],
      settings: data.settings || { autoRefresh: true },
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
    return { assets, transactions: [], settings: { autoRefresh: true } };
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

  function exportBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "portfoy-yedek.json";
    link.click();
    URL.revokeObjectURL(url);
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
        <div className="side-note">
          Bu surum lokal dosyadan ayridir. Veriler sifreli erisimle bulutta saklanir; mevcut bilgisayar surumun korunur.
        </div>
      </aside>

      <main className="dashboard">
        <section className="topbar">
          <div>
            <h1>Genel Bakis</h1>
            <p>Portfoyunun toplam degeri, dagilimi ve otomatik fiyat durumu.</p>
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
            <button className="secondary" onClick={exportBackup}>Yedek indir</button>
            <label className="file-button">
              Yedek yukle
              <input type="file" accept=".json,.csv,application/json,text/csv" onChange={(event) => event.target.files?.[0] && void importBackup(event.target.files[0])} />
            </label>
            <button className="primary" onClick={() => openAsset()}>+ Varlik ekle</button>
          </div>
        </section>

        <section className="cards">
          <article className="card"><span>Toplam deger</span><strong>{money(totals.totalValue)}</strong><small>{state.assets.length} varlik</small></article>
          <article className="card"><span>Toplam maliyet</span><strong>{money(totals.totalCost)}</strong><small>Kayitli alis maliyeti</small></article>
          <article className="card"><span>Kar / Zarar</span><strong className={totals.pl >= 0 ? "positive" : "negative"}>{money(totals.pl)}</strong><small>{pct(totals.rate)}</small></article>
          <article className="card"><span>Nakit</span><strong>{money(totals.cash)}</strong><small>Varlik tipi: Nakit</small></article>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Portfoy Varliklari</h2>
            <div className="toolbar">
              <input className="input" placeholder="Varlik ara" value={query} onChange={(event) => setQuery(event.target.value)} />
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="all">Tum turler</option>
                {types.map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Varlik</th><th>Adet</th><th>Toplam Maliyet</th><th>Guncel</th><th>Deger</th><th>K/Z</th><th>Pay</th><th />
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length ? filteredAssets.map((asset, index) => {
                  const value = asset.quantity * asset.price * (asset.fxRate || 1);
                  const cost = asset.quantity * asset.avgCost * (asset.fxRate || 1);
                  const pl = value - cost;
                  const share = totals.totalValue ? (value / totals.totalValue) * 100 : 0;
                  return (
                    <tr key={asset.id}>
                      <td>
                        <div className="asset-name">
                          <span className="dot" style={{ background: colors[index % colors.length] }} />
                          <div>
                            <strong>{asset.ticker}</strong>
                            <small>{asset.name} · {asset.priceSource} oto {asset.lastPriceAt ? `· ${formatTime(asset.lastPriceAt)}` : ""}{asset.lastPriceError ? ` · Hata: ${asset.lastPriceError}` : ""}</small>
                          </div>
                        </div>
                      </td>
                      <td>{num(asset.quantity)}</td>
                      <td>{money(cost)}</td>
                      <td>{money(asset.price, asset.currency)}</td>
                      <td>{money(value)}</td>
                      <td className={pl >= 0 ? "positive" : "negative"}>{money(pl)}</td>
                      <td>{pct(share)}</td>
                      <td className="row-actions">
                        <button className="icon-btn" onClick={() => openAsset(asset)} title="Duzenle">✎</button>
                        <button className="icon-btn" onClick={() => void deleteAsset(asset.id)} title="Sil">×</button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={8}><div className="empty">Ilk varligini ekleyerek baslayabilirsin.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {assetDraft ? (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={(event) => void submitAsset(event)}>
            <div className="panel-header"><h2>{state.assets.some((item) => item.id === assetDraft.id) ? "Varligi duzenle" : "Varlik ekle"}</h2></div>
            <div className="form-grid">
              <label className="wide">Kod
                <input className="input" value={assetDraft.ticker} onChange={(event) => updateDraftTicker(event.target.value)} placeholder="BTC/TRY, THYAO, TMG" />
              </label>
              <div className="auto-summary">{assetDraft.name} · {assetDraft.type} · {assetDraft.currency} · {assetDraft.priceSource} · {assetDraft.priceSymbol}</div>
              <label>Adet
                <input className="input" value={assetDraft.quantity || ""} onChange={(event) => setAssetDraft({ ...assetDraft, quantity: parseAmount(event.target.value) })} required />
              </label>
              <label>Ortalama alis fiyati
                <input className="input" value={assetDraft.avgCost || ""} onChange={(event) => setAssetDraft({ ...assetDraft, avgCost: parseAmount(event.target.value), price: assetDraft.price || parseAmount(event.target.value) })} required />
              </label>
              <label>Hedef pay (%)
                <input className="input" value={assetDraft.target || ""} onChange={(event) => setAssetDraft({ ...assetDraft, target: parseAmount(event.target.value) })} />
              </label>
              <label>Not
                <input className="input" value={assetDraft.note} onChange={(event) => setAssetDraft({ ...assetDraft, note: event.target.value })} />
              </label>
              <div className="auto-summary wide">Toplam maliyet: <strong>{money(assetDraft.quantity * assetDraft.avgCost, assetDraft.currency)}</strong></div>
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary" onClick={() => setAssetDraft(null)}>Vazgec</button>
              <button className="primary">Kaydet</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
