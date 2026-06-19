// Low-level HTTP client for the admin API: base-URL validation, the auth-token
// getter, request timeout/abort handling, and error extraction. Endpoint
// definitions (./endpoints) build on top of `adminFetch`.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function assertApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is required");
  }
  if (
    process.env.NODE_ENV === "production" &&
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    !API_BASE_URL.startsWith("https://")
  ) {
    throw new Error("NEXT_PUBLIC_API_URL must use HTTPS in production");
  }
  return API_BASE_URL;
}

const DEFAULT_TIMEOUT_MS = 30_000;

function extractErrorMessage(body: unknown): string {
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
  ) {
    return (body as { message: string }).message;
  }
  return "Request failed";
}

let getAuthToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null>) {
  getAuthToken = getter;
}

/** Returns the registered token getter, or null if one hasn't been set yet. */
export function getTokenGetter(): (() => Promise<string | null>) | null {
  return getAuthToken;
}

export async function adminFetch<T>(
  endpoint: string,
  options?: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const token = getAuthToken ? await getAuthToken() : null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const baseUrl = assertApiBaseUrl();
    const res = await fetch(`${baseUrl}/admin${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-auth-token": token } : {}),
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      // Only log the raw response body in development. Admin endpoints can echo
      // PII (emails, full bank account numbers) inside error payloads, which we
      // never want surfaced in a production browser console / log pipeline.
      if (process.env.NODE_ENV === "development") {
        console.error("API error", res.status, body);
      } else {
        console.error("API error", res.status);
      }
      throw new Error(extractErrorMessage(body));
    }

    return res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("The request took too long. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
