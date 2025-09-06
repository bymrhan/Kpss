import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTopicStatusSchema = z.object({
  topicId: z.string().min(1, "Topic ID is required"),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "DONE"], {
    errorMap: () => ({ message: "Invalid status" })
  }),
});

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth();
    
    const body = await request.json();
    
    const validatedFields = updateTopicStatusSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { 
          error: "Invalid data",
          fieldErrors: validatedFields.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { topicId, status } = validatedFields.data;

    // Check if topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    // Update or create user topic status
    const userTopicStatus = await prisma.userTopicStatus.upsert({
      where: {
        userId_topicId: {
          userId: user.id,
          topicId: topicId,
        },
      },
      update: {
        status: status,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        topicId: topicId,
        status: status,
      },
    });

    return NextResponse.json({
      success: true,
      status: userTopicStatus.status
    });
  } catch (error) {
    console.error("Update topic status API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}