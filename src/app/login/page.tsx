"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get("from") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const data = await response.json();
        setStatus("error");
        setMessage(data?.message || "Email/password salah");
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Terjadi kesalahan, coba ulang.");
    }
  };

  return (
    <main className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-hero">
          <span className="login-pill">Clevio Admin</span>
          <h1>Masuk Ke Dashboard</h1>
          <p className="login-subtitle">
            Akses panel admin dengan kredensial yang sudah dibagikan tim. Jaga
            kerahasiaan dan keluar jika tidak aktif.
          </p>
        </div>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </label>
        {status === "error" && <p className="login-error">{message}</p>}
        <button
          type="submit"
          className="theme-btn"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Memproses..." : "Masuk"}
        </button>
        <Link href="/" className="login-back">
          {"<"} Kembali ke website
        </Link>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
