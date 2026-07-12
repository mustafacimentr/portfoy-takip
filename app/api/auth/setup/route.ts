import { setPasscode } from "../../_lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { passcode?: string };
    await setPasscode(String(body.passcode || ""));
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Sifre olusturulamadi" }, { status: 400 });
  }
}
