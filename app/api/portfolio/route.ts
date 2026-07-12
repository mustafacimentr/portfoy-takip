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
    settings: body.state?.settings || { autoRefresh: true },
  });
  return Response.json({ ok: true });
}
