import { configuredStatus } from "../../_lib/auth";

export async function GET() {
  return Response.json({ configured: await configuredStatus() });
}
