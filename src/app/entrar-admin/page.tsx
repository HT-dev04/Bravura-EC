"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { bravuraLogo } from "@/lib/asset-url";

export default function EntrarAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Email ou senha inválidos.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-brand-black-2 border border-brand-border rounded-sm p-8 space-y-5"
      >
        <div className="flex items-center gap-3">
          <Image
            src={bravuraLogo}
            alt="Bravura Futebol Clube"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <div>
            <p className="text-brand-gold uppercase text-[10px] tracking-widest">Acesso restrito</p>
            <h1 className="font-display text-3xl uppercase">Admin Bravura</h1>
          </div>
        </div>

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label>Senha</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-1"
            required
          />
        </div>

        {error && <p className="text-sm text-brand-red">{error}</p>}

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>

        <Button asChild type="button" variant="outline" className="w-full">
          <Link href="/">Voltar para o site</Link>
        </Button>
      </form>
    </main>
  );
}
