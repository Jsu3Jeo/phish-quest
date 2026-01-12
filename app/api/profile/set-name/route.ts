import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOrThrow } from "@/lib/auth";
import { z } from "zod";

const Body = z.object({
  username: z.string().trim().min(3).max(20)
});

export async function POST(req: Request) {
  try {
    const userId = getUserIdOrThrow();
    const body = Body.parse(await req.json());

    const existing = await prisma.profile.findUnique({ where: { username: body.username } });
    if (existing) return NextResponse.json({ ok: false, error: "ชื่อนี้มีคนใช้แล้ว" }, { status: 400 });

    await prisma.profile.update({
      where: { userId },
      data: { username: body.username }
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "ตั้งชื่อไม่สำเร็จ" }, { status: 400 });
  }
}
