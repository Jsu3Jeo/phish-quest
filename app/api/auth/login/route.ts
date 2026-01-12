import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setAuthCookie, signToken } from "@/lib/auth";
import { z } from "zod";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200)
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: body.email }, include: { profile: true } });
    if (!user) return NextResponse.json({ ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 400 });

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return NextResponse.json({ ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 400 });

    const token = signToken(user.id);
    setAuthCookie(token);

    return NextResponse.json({ ok: true, needsName: !user.profile?.username });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "login ไม่สำเร็จ" }, { status: 400 });
  }
}
