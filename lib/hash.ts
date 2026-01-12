import crypto from "crypto";

export function questionHash(questionText: string, options: string[]) {
  const normalized = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[“”"]/g, '"')
      .trim();

  const base = normalized(questionText) + "||" + options.map(normalized).join("|");
  return crypto.createHash("sha256").update(base).digest("hex");
}
