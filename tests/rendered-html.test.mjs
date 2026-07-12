import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appRoot = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, appRoot), "utf8");
}

test("portfolio state keeps history and cash flow data in backups", async () => {
  const [page, route, store] = await Promise.all([
    source("app/page.tsx"),
    source("app/api/portfolio/route.ts"),
    source("app/api/_lib/store.ts"),
  ]);

  assert.match(page, /type PortfolioSnapshot/);
  assert.match(page, /type CashFlow/);
  assert.match(page, /type BenchmarkPoint/);
  assert.match(page, /normalizeTransaction/);
  assert.match(page, /defaultTargetAllocations/);
  assert.match(page, /history:\s*\[\]/);
  assert.match(page, /cashFlows:\s*\[\]/);
  assert.match(page, /benchmarkHistory:\s*\[\]/);
  assert.match(page, /parseJsonBackup/);
  assert.match(page, /data\.history/);
  assert.match(page, /data\.cashFlows/);
  assert.match(route, /body\.state\?\.history/);
  assert.match(route, /body\.state\?\.cashFlows/);
  assert.match(store, /history\?: unknown\[\]/);
  assert.match(store, /cashFlows\?: unknown\[\]/);
});

test("performance history screen is wired into the portfolio dashboard", async () => {
  const [page, css] = await Promise.all([
    source("app/page.tsx"),
    source("app/globals.css"),
  ]);

  assert.match(page, /Performans Gecmisi/);
  assert.match(page, /Portfoy Deger Gecmisi/);
  assert.match(page, /Nakit Akisi/);
  assert.match(page, /Gercek Getiri Hesabi/);
  assert.match(page, /Hedef Portfoy/);
  assert.match(page, /Yeni Yatirim Dagitim Onerisi/);
  assert.match(page, /Benchmark Karsilastirmasi/);
  assert.match(page, /Veri Durumu/);
  assert.match(page, /Fiyat Guncelleme Merkezi/);
  assert.match(page, /Uyarilar/);
  assert.match(page, /Uyari Merkezi/);
  assert.match(page, /alertRows/);
  assert.match(page, /dismissAlert/);
  assert.match(page, /clearActiveAlerts/);
  assert.match(page, /dismissedAlertIds/);
  assert.match(page, /PDF raporu/);
  assert.match(page, /report-page/);
  assert.match(page, /assets-page/);
  assert.match(page, /Portfoy Varliklari/);
  assert.match(page, /Gelecek Projeksiyonu/);
  assert.match(page, /Portfoy Analitigi/);
  assert.match(page, /Risk & Cesitlilik Notu/);
  assert.match(page, /printPortfolioReport/);
  assert.match(page, /selectedAssetDetail/);
  assert.match(page, /Islem gecmisi/);
  assert.match(page, /Gerceklesmis sonuc/);
  assert.match(page, /submitTransaction/);
  assert.match(page, /deleteTransaction/);
  assert.match(page, /Analiz notlari/);
  assert.match(page, /Kategori ici pay/);
  assert.match(page, /benchmarkDefinitions/);
  assert.match(page, /comparisonRows/);
  assert.match(page, /cashFlowSummary/);
  assert.match(page, /targetRows/);
  assert.match(page, /dataStatusRows/);
  assert.match(page, /dataStatusSummary/);
  assert.match(page, /refreshAssetPrice/);
  assert.match(page, /rebalanceSuggestions/);
  assert.match(page, /realReturnRate/);
  assert.match(page, /editCashFlow/);
  assert.match(page, /rangeOptions/);
  assert.match(page, /withTodaySnapshot/);
  assert.match(page, /chartPoints\("totalValue"\)/);
  assert.match(css, /\.history-chart/);
  assert.match(css, /\.cash-flow-form/);
  assert.match(css, /\.return-grid/);
  assert.match(css, /\.target-settings-grid/);
  assert.match(css, /\.rebalance-row/);
  assert.match(css, /\.benchmark-grid/);
  assert.match(css, /\.comparison-table/);
  assert.match(css, /\.source-grid/);
  assert.match(css, /\.data-status-table/);
  assert.match(css, /\.data-status-badge/);
  assert.match(css, /\.alerts-list/);
  assert.match(css, /\.alert-row/);
  assert.match(css, /\.alert-level/);
  assert.match(css, /\.print-report/);
  assert.match(css, /\.report-page/);
  assert.match(css, /\.assets-page \.report-panel/);
  assert.match(css, /\.report-cards/);
  assert.match(css, /\.report-table/);
  assert.match(css, /@media print/);
  assert.match(css, /\.print-table/);
  assert.match(css, /\.asset-detail-modal/);
  assert.match(css, /\.asset-detail-grid/);
  assert.match(css, /\.transaction-form/);
  assert.match(css, /\.transaction-row/);
  assert.match(css, /\.transaction-type/);
  assert.match(css, /\.range-tabs/);
});
