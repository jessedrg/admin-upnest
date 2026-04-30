/**
 * Shared fetch wrapper. Edit ONE file when wiring real backends.
 *
 * Today: returns mocks if NEXT_PUBLIC_USE_MOCKS=true (default in dev).
 * Real:  point at API_URL, attach auth header, throw on !ok.
 */

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
const BASE = process.env.API_URL ?? "";

export const ApiClient = {
  useMocks: USE_MOCKS,

  async get<T>(path: string, init?: RequestInit): Promise<T> {
    if (USE_MOCKS) throw new Error("Real fetch called while mocks are on");
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${await getToken()}`, // wire NextAuth
        ...init?.headers,
      },
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    if (USE_MOCKS) throw new Error("Real fetch called while mocks are on");
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  },
};

export const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));
