"use client";

const ACCOUNTS_KEY = "nersian-accounts";

type StoredAccount = {
  email: string;
  fullName: string;
  password: string;
  createdAt: string;
};

const BLOCKED_TEST_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
]);

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isLikelyRealEmail(value: string): boolean {
  const email = normalizeEmail(value);
  if (!email || email.length > 254) return false;
  if (email.includes("..")) return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (local.length > 64) return false;
  if (!/^[a-z0-9._%+-]+$/i.test(local)) return false;
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) return false;
  if (domain.startsWith("-") || domain.endsWith("-")) return false;
  if (BLOCKED_TEST_DOMAINS.has(domain)) return false;
  return true;
}

function readAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((a) => {
        const x = a as Partial<StoredAccount>;
        const email = normalizeEmail(String(x.email ?? ""));
        const fullName = String(x.fullName ?? "").trim();
        const password = String(x.password ?? "");
        const createdAt = String(x.createdAt ?? "");
        if (!email || !fullName || !password) return null;
        return { email, fullName, password, createdAt };
      })
      .filter((v): v is StoredAccount => Boolean(v));
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function registerLocalAccount(input: {
  fullName: string;
  email: string;
  password: string;
}): { ok: true } | { ok: false; error: "invalid_email" | "already_exists" | "weak_password" } {
  const fullName = String(input.fullName ?? "").trim();
  const email = normalizeEmail(String(input.email ?? ""));
  const password = String(input.password ?? "");
  if (!isLikelyRealEmail(email)) return { ok: false, error: "invalid_email" };
  if (password.length < 8) return { ok: false, error: "weak_password" };
  const accounts = readAccounts();
  if (accounts.some((a) => a.email === email)) return { ok: false, error: "already_exists" };
  accounts.push({ email, fullName, password, createdAt: new Date().toISOString() });
  writeAccounts(accounts);
  return { ok: true };
}

export function authenticateLocalAccount(emailInput: string, passwordInput: string): {
  email: string;
  fullName: string;
} | null {
  const email = normalizeEmail(String(emailInput ?? ""));
  const password = String(passwordInput ?? "");
  const accounts = readAccounts();
  const account = accounts.find((a) => a.email === email && a.password === password);
  if (!account) return null;
  return { email: account.email, fullName: account.fullName };
}

