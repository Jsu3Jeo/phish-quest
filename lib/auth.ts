import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { TOKEN_NAME } from "@/lib/constants";

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function signToken(userId: string) {
  const secret = requireEnv("JWT_SECRET");
  // Use "sub" as user id
  return jwt.sign({}, secret, { subject: userId, expiresIn: "30d" });
}

export function setAuthCookie(token: string) {
  cookies().set(TOKEN_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export function clearAuthCookie() {
  cookies().set(TOKEN_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export function getUserIdOrNull(): string | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const token = cookies().get(TOKEN_NAME)?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;
    const sub = payload.sub;
    return typeof sub === "string" ? sub : null;
  } catch {
    return null;
  }
}

export function getUserIdOrThrow(): string {
  const userId = getUserIdOrNull();
  if (!userId) throw new Error("UNAUTHORIZED");
  return userId;
}
