import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setAuthCookie, signToken } from "@/lib/auth";
import { z } from "zod";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());

    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return NextResponse.json({ ok: false, error: "อีเมลนี้ถูกใช้แล้ว" }, { status: 400 });

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        profile: { create: {} }
      },
      include: { profile: true }
    });

    const token = signToken(user.id);
    setAuthCookie(token);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "สมัครไม่สำเร็จ" }, { status: 400 });
  }
}
