import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOrThrow } from "@/lib/auth";
import { z } from "zod";

const Body = z.object({
  sessionId: z.string().min(5)
});

export async function POST(req: Request) {
  try {
    const userId = getUserIdOrThrow();
    const body = Body.parse(await req.json());

    const session = await prisma.gameSession.findUnique({ where: { id: body.sessionId } });
    if (!session || session.userId !== userId) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (session.endedAt) return NextResponse.json({ ok: true });

    // end session
    const ended = await prisma.gameSession.update({
      where: { id: body.sessionId },
      data: { endedAt: new Date() }
    });

    // add to profile totals (scoreboard)
    await prisma.profile.update({
      where: { userId },
      data: {
        totalScore: { increment: ended.score },
        gamesPlayed: { increment: 1 },
        questionsAnswered: { increment: ended.questionCount }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "bad request" }, { status: 400 });
  }
}
