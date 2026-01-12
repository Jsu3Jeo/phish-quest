import { z } from "zod";
import { openai, getModel } from "@/lib/openai";
import { zodTextFormat } from "openai/helpers/zod";

export const PhishQuestion = z.object({
  questionText: z.string().min(80).max(900),
  options: z.array(z.string().min(2).max(220)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanations: z.array(z.string().min(10).max(360)).length(4),
  indicators: z.array(z.string().min(2).max(40)).min(2).max(6)
});

export type PhishQuestionT = z.infer<typeof PhishQuestion>;

export async function generateQuestion(params: {
  recentQuestions: { questionText: string; options: string[] }[];
}) {
  const avoid = params.recentQuestions
    .slice(0, 10)
    .map((q, i) => `#${i + 1}\nQ: ${q.questionText}\nOptions: ${q.options.join(" | ")}`)
    .join("\n\n");

  const system = [
    "คุณคือครู Cybersecurity ที่อธิบายชัด เข้าใจง่าย และสร้างโจทย์เกม Phishing Quiz",
    "งาน: สร้างโจทย์ 1 ข้อ (ภาษาไทย) แบบ Multiple choice A/B/C/D (แต่ใน JSON ให้ส่งเป็น options 4 ตัว)",
    "โจทย์ต้องเกี่ยวกับ 'การแยกแยะ phishing' จากอีเมล/ข้อความ/ลิงก์/โดเมน/การขอข้อมูลส่วนตัว/ความเร่งด่วน ฯลฯ",
    "ต้องมี 'ข้อความตัวอย่าง' ที่ดูสมจริง เช่น จาก: support@..., ลิงก์ https://..., subject, snippet",
    "ตัวเลือกต้องมี 4 ข้อ และต้องมีทั้งตัวเลือกที่ลวงๆใกล้เคียง (distractors)",
    "หลังตอบ: ต้องอธิบายทีละตัวเลือกว่าทำไมถูก/ทำไมผิด (explanations 4 ตัว)",
    "โจทย์/ตัวเลือก ต้องไม่ซ้ำกับตัวอย่างที่ผ่านมา (ดูรายการด้านล่าง) และห้ามก็อปปี้วรรคเดิมๆ",
    "ห้ามใส่ลิงก์อันตรายจริง: ใช้โดเมนปลอม เช่น example.com, secure-login[.]com หรือ domain ที่แต่งขึ้น",
    "เน้นการสอน: ชี้ 'สัญญาณ phishing' เป็นแท็กใน indicators (เช่น domain-mismatch, urgency, attachment, credential-harvest, misspelling, lookalike-domain)",
    "",
    "รายการโจทย์ที่ห้ามซ้ำ/คล้าย:",
    avoid || "(ยังไม่มี)"
  ].join("\n");

  const user = "สร้างโจทย์ใหม่ 1 ข้อ (ต้องไม่ซ้ำ/ไม่คล้าย).";

  const response = await openai.responses.parse({
    model: getModel(),
    input: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    text: {
      format: zodTextFormat(PhishQuestion, "phish_question")
    }
  });

  return response.output_parsed;
}
