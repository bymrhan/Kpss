"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCategorySchema = z.object({
  examId: z.string().min(1, "Sınav seçimi gerekli"),
  name: z.string().min(1, "Kategori adı gerekli").max(100, "Kategori adı çok uzun"),
  order: z.coerce.number().int().min(0, "Sıra 0 veya pozitif olmalı").default(0),
});

const updateCategorySchema = z.object({
  id: z.string().min(1, "Kategori ID gerekli"),
  examId: z.string().min(1, "Sınav seçimi gerekli"),
  name: z.string().min(1, "Kategori adı gerekli").max(100, "Kategori adı çok uzun"),
  order: z.coerce.number().int().min(0, "Sıra 0 veya pozitif olmalı"),
});

const deleteCategorySchema = z.object({
  id: z.string().min(1, "Kategori ID gerekli"),
});

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const examId = formData.get("examId") as string;
  const name = formData.get("name") as string;
  const order = formData.get("order") as string;

  const validatedFields = createCategorySchema.safeParse({ examId, name, order });

  if (!validatedFields.success) {
    return {
      error: "Geçersiz veri",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { examId: validatedExamId, name: validatedName, order: validatedOrder } = validatedFields.data;

  try {
    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: validatedExamId },
    });

    if (!exam) {
      return {
        error: "Seçilen sınav bulunamadı",
      };
    }

    await prisma.category.create({
      data: {
        examId: validatedExamId,
        name: validatedName,
        order: validatedOrder,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Create category error:", error);
    return {
      error: "Kategori oluşturulurken bir hata oluştu",
    };
  }
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const examId = formData.get("examId") as string;
  const name = formData.get("name") as string;
  const order = formData.get("order") as string;

  const validatedFields = updateCategorySchema.safeParse({ id, examId, name, order });

  if (!validatedFields.success) {
    return {
      error: "Geçersiz veri",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id: validatedId, examId: validatedExamId, name: validatedName, order: validatedOrder } = validatedFields.data;

  try {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedId },
    });

    if (!category) {
      return {
        error: "Kategori bulunamadı",
      };
    }

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: validatedExamId },
    });

    if (!exam) {
      return {
        error: "Seçilen sınav bulunamadı",
      };
    }

    await prisma.category.update({
      where: { id: validatedId },
      data: {
        examId: validatedExamId,
        name: validatedName,
        order: validatedOrder,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update category error:", error);
    return {
      error: "Kategori güncellenirken bir hata oluştu",
    };
  }
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;

  const validatedFields = deleteCategorySchema.safeParse({ id });

  if (!validatedFields.success) {
    return {
      error: "Geçersiz veri",
    };
  }

  const { id: validatedId } = validatedFields.data;

  try {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedId },
      include: {
        topics: true
      }
    });

    if (!category) {
      return {
        error: "Kategori bulunamadı",
      };
    }

    // Check if category has topics
    if (category.topics.length > 0) {
      return {
        error: "Bu kategorinin konuları var. Önce konuları silin.",
      };
    }

    await prisma.category.delete({
      where: { id: validatedId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return {
      error: "Kategori silinirken bir hata oluştu",
    };
  }
}