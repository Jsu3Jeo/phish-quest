import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOrThrow } from "@/lib/auth";
import { generateQuestion } from "@/lib/gameGen";
import { questionHash } from "@/lib/hash";

export async function POST() {
  try {
    const userId = getUserIdOrThrow();

    // create session
    const session = await prisma.gameSession.create({
      data: { userId }
    });

    // recent questions (global) to avoid repeats
    const recent = await prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { questionText: true, options: true }
    });

    // generate unique question (retry up to 3)
    let q;
    for (let attempt = 0; attempt < 3; attempt++) {
      q = await generateQuestion({
        recentQuestions: recent.map((x) => ({ questionText: x.questionText, options: x.options as any }))
      });
      const h = questionHash(q.questionText, q.options);
      try {
        const saved = await prisma.question.create({
          data: {
            sessionId: session.id,
            order: 1,
            questionText: q.questionText,
            options: q.options as any,
            correctIndex: q.correctIndex,
            explanations: q.explanations as any,
            indicators: q.indicators as any,
            hash: h
          }
        });

        return NextResponse.json({
          sessionId: session.id,
          score: 0,
          question: {
            id: saved.id,
            order: saved.order,
            questionText: saved.questionText,
            options: saved.options as any
          }
        });
      } catch (e: any) {
        // likely unique hash clash → retry
        if (attempt === 2) throw e;
      }
    }

    return NextResponse.json({ error: "AI failed" }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unauthorized" }, { status: 401 });
  }
}
