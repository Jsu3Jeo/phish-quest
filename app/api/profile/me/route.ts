import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOrThrow } from "@/lib/auth";

export async function GET() {
  try {
    const userId = getUserIdOrThrow();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, profile: true }
    });
    if (!user || !user.profile) return NextResponse.json({ error: "not found" }, { status: 404 });

    return NextResponse.json({
      user: { email: user.email },
      profile: {
        username: user.profile.username,
        totalScore: user.profile.totalScore,
        gamesPlayed: user.profile.gamesPlayed,
        questionsAnswered: user.profile.questionsAnswered
      }
    });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
