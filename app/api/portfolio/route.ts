import { requirePasscode } from "../_lib/auth";
import { readPortfolio, writePortfolio } from "../_lib/store";

export async function GET(request: Request) {
  const authError = await requirePasscode(request);
  if (authError) return authError;
  return Response.json({ state: await readPortfolio() });
}

export async function PUT(request: Request) {
  const authError = await requirePasscode(request);
  if (authError) return authError;
  const body = await request.json().catch(() => ({}));
  await writePortfolio({
    assets: Array.isArray(body.state?.assets) ? body.state.assets : [],
    transactions: Array.isArray(body.state?.transactions) ? body.state.transactions : [],
    history: Array.isArray(body.state?.history) ? body.state.history : [],
    cashFlows: Array.isArray(body.state?.cashFlows) ? body.state.cashFlows : [],
    settings: body.state?.settings || { autoRefresh: true },
  });
  return Response.json({ ok: true });
}
