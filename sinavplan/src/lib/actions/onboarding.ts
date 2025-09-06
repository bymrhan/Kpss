"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

const selectExamSchema = z.object({
  examId: z.string().min(1, "Sınav seçimi gerekli"),
});

export async function selectExam(formData: FormData) {
  const { user } = await requireAuth();
  
  const examId = formData.get("examId") as string;
  
  const validatedFields = selectExamSchema.safeParse({ examId });

  if (!validatedFields.success) {
    return {
      error: "Geçersiz veri",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return {
        error: "Seçilen sınav bulunamadı",
      };
    }

    // Create or update user preference
    await prisma.userPref.upsert({
      where: { userId: user.id },
      update: { examId },
      create: {
        userId: user.id,
        examId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Select exam error:", error);
    return {
      error: "Sınav seçimi sırasında bir hata oluştu",
    };
  }
}