import { requirePasscode } from "../_lib/auth";
import { readPortfolio, writePortfolio } from "../_lib/store";

type LogoCatalogEntry = {
  url?: string;
  source?: string;
  updatedAt?: string;
  deleted?: boolean;
};

function normalizeLogoKey(value: string) {
  return String(value || "").toUpperCase().replace(/^BIST:/, "").replace(/\.IS$/, "").replace(/[^A-Z0-9]/g, "");
}

function normalizeLogoCatalog(input: unknown) {
  if (!input || typeof input !== "object") return {};
  return Object.entries(input as Record<string, LogoCatalogEntry | string>).reduce<Record<string, LogoCatalogEntry>>((catalog, [rawKey, rawValue]) => {
    const key = normalizeLogoKey(rawKey);
    if (!key) return catalog;
    const value = rawValue as LogoCatalogEntry | string;
    if (typeof value === "string") {
      if (value.trim()) catalog[key] = { url: value.trim(), source: "Katalog" };
      return catalog;
    }
    if (value?.deleted) {
      catalog[key] = { deleted: true, updatedAt: value.updatedAt };
      return catalog;
    }
    const url = String(value?.url || "").trim();
    if (!url) return catalog;
    catalog[key] = {
      url,
      source: value.source || "Katalog",
      updatedAt: value.updatedAt,
    };
    return catalog;
  }, {});
}

function mergeLogoCatalogs(existing: unknown, incoming: unknown) {
  const merged = normalizeLogoCatalog(existing);
  const next = normalizeLogoCatalog(incoming);
  Object.entries(next).forEach(([key, entry]) => {
    if (entry.deleted) {
      delete merged[key];
    } else if (entry.url) {
      merged[key] = entry;
    }
  });
  return merged;
}

export async function GET(request: Request) {
  const authError = await requirePasscode(request);
  if (authError) return authError;
  return Response.json({ state: await readPortfolio() });
}

export async function PUT(request: Request) {
  const authError = await requirePasscode(request);
  if (authError) return authError;
  const body = await request.json().catch(() => ({}));
  const existingState = await readPortfolio();
  await writePortfolio({
    assets: Array.isArray(body.state?.assets) ? body.state.assets : [],
    watchlist: Array.isArray(body.state?.watchlist) ? body.state.watchlist : [],
    transactions: Array.isArray(body.state?.transactions) ? body.state.transactions : [],
    history: Array.isArray(body.state?.history) ? body.state.history : [],
    cashFlows: Array.isArray(body.state?.cashFlows) ? body.state.cashFlows : [],
    benchmarkHistory: Array.isArray(body.state?.benchmarkHistory) ? body.state.benchmarkHistory : [],
    logoCatalog: mergeLogoCatalogs(existingState.logoCatalog, body.state?.logoCatalog),
    settings: body.state?.settings || { autoRefresh: true },
  });
  return Response.json({ ok: true });
}
