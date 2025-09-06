"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTopicStatusSchema = z.object({
  topicId: z.string().min(1, "Konu ID gerekli"),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "DONE"], {
    errorMap: () => ({ message: "Geçersiz durum" })
  }),
});

export async function updateTopicStatus(formData: FormData) {
  const { user } = await requireAuth();
  
  const topicId = formData.get("topicId") as string;
  const status = formData.get("status") as string;
  
  const validatedFields = updateTopicStatusSchema.safeParse({ topicId, status });

  if (!validatedFields.success) {
    return {
      error: "Geçersiz veri",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { topicId: validatedTopicId, status: validatedStatus } = validatedFields.data;

  try {
    // Check if topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: validatedTopicId },
    });

    if (!topic) {
      return {
        error: "Konu bulunamadı",
      };
    }

    // Update or create user topic status
    await prisma.userTopicStatus.upsert({
      where: {
        userId_topicId: {
          userId: user.id,
          topicId: validatedTopicId,
        },
      },
      update: {
        status: validatedStatus,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        topicId: validatedTopicId,
        status: validatedStatus,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update topic status error:", error);
    return {
      error: "Durum güncellenirken bir hata oluştu",
    };
  }
}