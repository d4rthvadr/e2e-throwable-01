const encoder = new TextEncoder();

export async function hashPassword(password: string): Promise<string> {
  const normalized = password.trim();
  const payload = encoder.encode(`todos-app:${normalized}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", payload);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
