import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export function getModel() {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}
