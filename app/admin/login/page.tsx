"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

export default function AdminLoginPage() {
  const { t, dir } = useI18n();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Clean up the old client-side flag if it lingers from a previous version.
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin-auth");
        }
        router.push("/admin");
        router.refresh();
        return;
      }

      setError(t("admin.incorrectCredentials"));
    } catch {
      setError(t("admin.incorrectCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4" dir={dir}>
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-semibold text-foreground">
          {t("admin.loginTitle")}
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {t("admin.signInToAccess")}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t("admin.email")}</Label>
            <Input
              id="username"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@nersyantaiba.com"
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("admin.password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin"
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
          <Button
            type="submit"
            className="mt-2 w-full"
            disabled={loading}
          >
            {loading ? t("admin.loggingIn") : t("admin.loginButton")}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {t("admin.credentialsHint")}
        </p>
      </div>
    </div>
  );
}

