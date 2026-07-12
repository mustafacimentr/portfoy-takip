import { env } from "cloudflare:workers";

export type PortfolioState = {
  assets: unknown[];
  transactions: unknown[];
  settings: { autoRefresh: boolean };
};

export const defaultState: PortfolioState = {
  assets: [],
  transactions: [],
  settings: { autoRefresh: true },
};

type D1Result<T> = {
  results?: T[];
};

export function db() {
  if (!env.DB) throw new Error("Veritabani baglantisi hazir degil");
  return env.DB;
}

export async function ensureSchema() {
  const database = db();
  await database.batch([
    database.prepare("CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    database.prepare("CREATE TABLE IF NOT EXISTS portfolio_states (id INTEGER PRIMARY KEY, json TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
  ]);
}

export async function getSetting(key: string) {
  await ensureSchema();
  const row = await db()
    .prepare("SELECT value FROM app_settings WHERE key = ?")
    .bind(key)
    .first<{ value: string }>();
  return row?.value || null;
}

export async function setSetting(key: string, value: string) {
  await ensureSchema();
  await db()
    .prepare("INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP")
    .bind(key, value)
    .run();
}

export async function isConfigured() {
  return Boolean(await getSetting("passcode_hash"));
}

export async function readPortfolio(): Promise<PortfolioState> {
  await ensureSchema();
  const row = await db()
    .prepare("SELECT json FROM portfolio_states WHERE id = 1")
    .first<{ json: string }>();
  if (!row?.json) return defaultState;
  try {
    return { ...defaultState, ...JSON.parse(row.json) };
  } catch {
    return defaultState;
  }
}

export async function writePortfolio(state: PortfolioState) {
  await ensureSchema();
  await db()
    .prepare("INSERT INTO portfolio_states (id, json, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = CURRENT_TIMESTAMP")
    .bind(JSON.stringify(state))
    .run();
}

export async function getAllSettings() {
  await ensureSchema();
  const result = await db().prepare("SELECT key, value FROM app_settings").all<{ key: string; value: string }>() as D1Result<{ key: string; value: string }>;
  return Object.fromEntries((result.results || []).map((row) => [row.key, row.value]));
}
