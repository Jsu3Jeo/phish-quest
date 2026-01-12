import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOrThrow } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const userId = getUserIdOrThrow();
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");
    const full = url.searchParams.get("full") === "1";

    if (!sessionId) return NextResponse.json({ error: "missing sessionId" }, { status: 400 });

    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: { orderBy: { order: "asc" } },
        user: { select: { id: true, profile: true } }
      }
    });

    if (!session || session.user.id !== userId) return NextResponse.json({ error: "not found" }, { status: 404 });

    const current = session.questions.find((q) => q.answeredAt === null) ?? session.questions.at(-1);
    if (!current) return NextResponse.json({ error: "no questions" }, { status: 404 });

    if (!full) {
      return NextResponse.json({
        sessionId: session.id,
        score: session.score,
        currentQuestion: {
          id: current.id,
          order: current.order,
          questionText: current.questionText,
          options: current.options as any
        }
      });
    }

    return NextResponse.json({
      session: {
        id: session.id,
        score: session.score,
        questionCount: session.questionCount,
        endedAt: session.endedAt?.toISOString() ?? null
      },
      profile: {
        username: session.user.profile?.username ?? null,
        totalScore: session.user.profile?.totalScore ?? 0,
        gamesPlayed: session.user.profile?.gamesPlayed ?? 0,
        questionsAnswered: session.user.profile?.questionsAnswered ?? 0
      },
      questions: session.questions
        .filter((q) => q.answeredAt !== null) // show only answered in result
        .map((q) => ({
          order: q.order,
          questionText: q.questionText,
          options: q.options as any,
          correctIndex: q.correctIndex,
          explanations: q.explanations as any,
          indicators: (q.indicators as any) ?? [],
          selectedIndex: q.selectedIndex,
          isCorrect: q.isCorrect
        }))
    });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
