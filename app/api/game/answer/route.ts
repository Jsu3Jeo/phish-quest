import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOrThrow } from "@/lib/auth";
import { z } from "zod";
import { generateQuestion } from "@/lib/gameGen";
import { questionHash } from "@/lib/hash";

const Body = z.object({
  sessionId: z.string().min(5),
  selectedIndex: z.number().int().min(0).max(3)
});

export async function POST(req: Request) {
  try {
    const userId = getUserIdOrThrow();
    const body = Body.parse(await req.json());

    const session = await prisma.gameSession.findUnique({
      where: { id: body.sessionId },
      include: { user: { select: { id: true } } }
    });
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }
    if (session.endedAt) {
      return NextResponse.json({ error: "session ended" }, { status: 400 });
    }

    // current question = last question in this session that is not answered
    const current = await prisma.question.findFirst({
      where: { sessionId: body.sessionId, answeredAt: null },
      orderBy: { order: "desc" }
    });
    if (!current) return NextResponse.json({ error: "no active question" }, { status: 400 });

    const correct = current.correctIndex === body.selectedIndex;

    // update question
    await prisma.question.update({
      where: { id: current.id },
      data: {
        answeredAt: new Date(),
        selectedIndex: body.selectedIndex,
        isCorrect: correct
      }
    });

    // update session score (simple scoring: +10 correct, +0 wrong)
    const delta = correct ? 10 : 0;
    const nextOrder = current.order + 1;

    const updated = await prisma.gameSession.update({
      where: { id: body.sessionId },
      data: {
        score: { increment: delta },
        questionCount: { increment: 1 }
      }
    });

    // generate next question (avoid repeats)
    const recent = await prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { questionText: true, options: true }
    });

    let q;
    for (let attempt = 0; attempt < 3; attempt++) {
      q = await generateQuestion({
        recentQuestions: recent.map((x) => ({ questionText: x.questionText, options: x.options as any }))
      });
      const h = questionHash(q.questionText, q.options);
      try {
        const saved = await prisma.question.create({
          data: {
            sessionId: body.sessionId,
            order: nextOrder,
            questionText: q.questionText,
            options: q.options as any,
            correctIndex: q.correctIndex,
            explanations: q.explanations as any,
            indicators: q.indicators as any,
            hash: h
          }
        });

        return NextResponse.json({
          sessionId: body.sessionId,
          score: updated.score,
          questionNumber: current.order,
          correct,
          correctIndex: current.correctIndex,
          explanations: current.explanations as any,
          indicators: (current.indicators as any) ?? [],
          nextQuestion: {
            id: saved.id,
            order: saved.order,
            questionText: saved.questionText,
            options: saved.options as any
          }
        });
      } catch (e: any) {
        if (attempt === 2) throw e;
      }
    }

    return NextResponse.json({ error: "AI failed" }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "bad request" }, { status: 400 });
  }
}
