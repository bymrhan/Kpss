"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

const createExamSchema = z.object({
  code: z.string().min(1, "Sınav kodu gerekli").max(10, "Sınav kodu çok uzun"),
  name: z.string().min(1, "Sınav adı gerekli").max(100, "Sınav adı çok uzun"),
});

const updateExamSchema = z.object({
  id: z.string().min(1, "Sınav ID gerekli"),
  code: z.string().min(1, "Sınav kodu gerekli").max(10, "Sınav kodu çok uzun"),
  name: z.string().min(1, "Sınav adı gerekli").max(100, "Sınav adı çok uzun"),
});

const deleteExamSchema = z.object({
  id: z.string().min(1, "Sınav ID gerekli"),
});

export async function createExam(formData: FormData) {
  await requireAdmin();

  const code = formData.get("code") as string;
  const name = formData.get("name") as string;

  const validatedFields = createExamSchema.safeParse({ code, name });

  if (!validatedFields.success) {
    return {
      error: "Geçersiz veri",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { code: validatedCode, name: validatedName } = validatedFields.data;

  try {
    // Check if exam code already exists
    const existingExam = await prisma.exam.findUnique({
      where: { code: validatedCode },
    });

    if (existingExam) {
      return {
        error: "Bu sınav kodu zaten kullanılıyor",
      };
    }

    await prisma.exam.create({
      data: {
        code: validatedCode,
        name: validatedName,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Create exam error:", error);
    return {
      error: "Sınav oluşturulurken bir hata oluştu",
    };
  }
}

export async function updateExam(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;

  const validatedFields = updateExamSchema.safeParse({ id, code, name });

  if (!validatedFields.success) {
    return {
      error: "Geçersiz veri",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id: validatedId, code: validatedCode, name: validatedName } = validatedFields.data;

  try {
    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: validatedId },
    });

    if (!exam) {
      return {
        error: "Sınav bulunamadı",
      };
    }

    // Check if exam code already exists (excluding current exam)
    const existingExam = await prisma.exam.findFirst({
      where: { 
        code: validatedCode,
        id: { not: validatedId }
      },
    });

    if (existingExam) {
      return {
        error: "Bu sınav kodu zaten kullanılıyor",
      };
    }

    await prisma.exam.update({
      where: { id: validatedId },
      data: {
        code: validatedCode,
        name: validatedName,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update exam error:", error);
    return {
      error: "Sınav güncellenirken bir hata oluştu",
    };
  }
}

export async function deleteExam(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;

  const validatedFields = deleteExamSchema.safeParse({ id });

  if (!validatedFields.success) {
    return {
      error: "Geçersiz veri",
    };
  }

  const { id: validatedId } = validatedFields.data;

  try {
    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: validatedId },
      include: {
        categories: true,
        userPrefs: true
      }
    });

    if (!exam) {
      return {
        error: "Sınav bulunamadı",
      };
    }

    // Check if exam has categories or users
    if (exam.categories.length > 0) {
      return {
        error: "Bu sınavın kategorileri var. Önce kategorileri silin.",
      };
    }

    if (exam.userPrefs.length > 0) {
      return {
        error: "Bu sınavı kullanan kullanıcılar var. Önce kullanıcı tercihlerini güncelleyin.",
      };
    }

    await prisma.exam.delete({
      where: { id: validatedId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete exam error:", error);
    return {
      error: "Sınav silinirken bir hata oluştu",
    };
  }
}