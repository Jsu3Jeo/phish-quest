import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOrThrow } from "@/lib/auth";

export async function GET() {
  // require login so random bots don't hammer
  try {
    getUserIdOrThrow();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rows = await prisma.profile.findMany({
    where: { username: { not: null } },
    orderBy: [{ totalScore: "desc" }, { gamesPlayed: "desc" }],
    take: 50,
    select: { username: true, totalScore: true, gamesPlayed: true, questionsAnswered: true }
  });

  return NextResponse.json({
    rows: rows.map((r) => ({
      username: r.username!,
      totalScore: r.totalScore,
      gamesPlayed: r.gamesPlayed,
      questionsAnswered: r.questionsAnswered
    }))
  });
}
