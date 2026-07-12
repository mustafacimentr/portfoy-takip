import { getAllSettings, getSetting, isConfigured, setSetting } from "./store";

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string) {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function setPasscode(passcode: string) {
  if (passcode.length < 6) throw new Error("Sifre en az 6 karakter olmali");
  if (await isConfigured()) throw new Error("Sifre daha once olusturulmus");
  const salt = randomSalt();
  await setSetting("passcode_salt", salt);
  await setSetting("passcode_hash", await sha256(`${salt}:${passcode}`));
}

export async function verifyPasscode(passcode: string) {
  const settings = await getAllSettings();
  const salt = settings.passcode_salt;
  const hash = settings.passcode_hash;
  if (!salt || !hash) return false;
  return (await sha256(`${salt}:${passcode}`)) === hash;
}

export async function requirePasscode(request: Request) {
  const configured = await isConfigured();
  if (!configured) {
    return Response.json({ error: "Once portfoy sifresi olusturulmali" }, { status: 401 });
  }
  const passcode = request.headers.get("x-portfolio-passcode") || "";
  if (!(await verifyPasscode(passcode))) {
    return Response.json({ error: "Sifre hatali" }, { status: 401 });
  }
  return null;
}

export async function configuredStatus() {
  return Boolean(await getSetting("passcode_hash"));
}
