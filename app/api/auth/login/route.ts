import { verifyPasscode } from "../../_lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { passcode?: string };
  if (await verifyPasscode(String(body.passcode || ""))) {
    return Response.json({ ok: true });
  }
  return Response.json({ error: "Sifre hatali" }, { status: 401 });
}
