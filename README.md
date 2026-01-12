# PhishQuest — AI Phishing Quiz (MVP)

เว็บเกมฝึกจับ phishing แบบเข้าใจง่าย (เด็ก-ผู้ใหญ่-ผู้สูงอายุเล่นได้)  
AI สร้างโจทย์ไม่ซ้ำ, มีตัวเลือก A/B/C/D, เฉลย+คำอธิบายทุกข้อ, และมี Scoreboard รวมคะแนน

## Features
- Signup / Login (email + password)
- ตั้งชื่อ (username) ห้ามซ้ำ (แสดงใน Scoreboard)
- Game: AI gen โจทย์ต่อเนื่อง “ไม่ซ้ำ” (ตรวจด้วย hash + retry)
- หลังตอบ: อธิบายทุกตัวเลือกว่าทำไมถูก/ผิด + แท็กสัญญาณ phishing
- End game: สรุปคะแนน + tips + บวกคะแนนเข้ารวม (คะแนนรวมสะสม)
- Scoreboard: แสดงชื่อไม่ซ้ำ, เล่นใหม่ = เพิ่มคะแนน ไม่เพิ่มชื่อซ้ำ

## Tech Stack
- Next.js (App Router) + TypeScript + Tailwind
- Prisma + SQLite (local)  
  > ตอน Deploy แนะนำเปลี่ยนเป็น PostgreSQL (Render/Neon/Supabase) แล้วเปลี่ยน `DATABASE_URL`
- OpenAI API (Responses API + Structured Outputs)

## Run locally
1) ติดตั้ง Node.js 20+
2) สร้างไฟล์ `.env` จาก `.env.example`
   - `JWT_SECRET` ตั้งยาวๆสุ่มๆ
   - `OPENAI_API_KEY` ใส่ key ของคุณ
3) ติดตั้ง deps
```bash
npm install
```
4) สร้าง DB
```bash
npx prisma migrate dev --name init
```
5) รัน
```bash
npm run dev
```
เปิด http://localhost:3000

## Deploy (Render แบบง่าย)
- สร้าง Render Web Service (Node)
- สร้าง Render PostgreSQL แล้วเอา `DATABASE_URL` มาใส่ env
- ตั้ง env:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL` (เช่น `gpt-4o-mini`)

Build command:
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```
Start command:
```bash
npm run start
```

## Security notes
- ไม่เก็บ plaintext password (ใช้ bcrypt hash)
- JWT เก็บใน HttpOnly cookie
- OpenAI key ต้องอยู่ server เท่านั้น (อย่าเอาไปไว้ฝั่ง client)

## Scoring
- ถูก +10, ผิด +0 (แก้ได้ใน `/app/api/game/answer/route.ts`)

---
Made for education. Do not use the generated examples to attack real users.
