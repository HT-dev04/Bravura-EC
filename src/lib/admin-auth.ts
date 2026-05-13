import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "bravura_admin";

type AdminAuthConfigOptions = {
  requireCredentials?: boolean;
};

export function getAdminAuthConfigError({ requireCredentials = false }: AdminAuthConfigOptions = {}) {
  const missing: string[] = [];

  if (requireCredentials) {
    if (!process.env.ADMIN_EMAIL) missing.push("ADMIN_EMAIL");
    if (!process.env.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
  }

  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_SESSION_SECRET) {
    missing.push("ADMIN_SESSION_SECRET");
  }

  return missing.length ? `Configuração do admin incompleta. Defina: ${missing.join(", ")}.` : null;
}

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-bravura-secret";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) return false;
  return safeEqual(email, expectedEmail) && safeEqual(password, expectedPassword);
}

export function createSessionValue(email: string) {
  const payload = Buffer.from(JSON.stringify({ email, iat: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function isValidSession(value?: string) {
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  return safeEqual(signature, sign(payload));
}

export async function getAdminSession() {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return isValidSession(value) ? value : null;
}

export async function setAdminSession(email: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionValue(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
