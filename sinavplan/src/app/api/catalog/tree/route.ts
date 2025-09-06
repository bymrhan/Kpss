import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const examCode = searchParams.get("exam");

    if (!examCode) {
      return NextResponse.json(
        { error: "Exam code is required" },
        { status: 400 }
      );
    }

    // Get exam
    const exam = await prisma.exam.findUnique({
      where: { code: examCode },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    // Get categories with topics
    const categories = await prisma.category.findMany({
      where: { examId: exam.id },
      include: {
        topics: {
          include: {
            userTopicStatus: {
              where: { userId: user.id }
            }
          },
          orderBy: { order: "asc" }
        }
      },
      orderBy: { order: "asc" }
    });

    return NextResponse.json({
      exam: {
        id: exam.id,
        code: exam.code,
        name: exam.name
      },
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        order: category.order,
        topics: category.topics.map(topic => ({
          id: topic.id,
          name: topic.name,
          order: topic.order,
          status: topic.userTopicStatus[0]?.status || "NOT_STARTED"
        }))
      }))
    });
  } catch (error) {
    console.error("Catalog tree API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}