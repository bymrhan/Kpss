import { z } from "zod";

// YouTube URL validation
export const youtubeUrlSchema = z.string().regex(
  /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]+/,
  "Geçerli bir YouTube URL'si giriniz"
);

// Email validation
export const emailSchema = z.string().email("Geçerli bir email adresi giriniz");

// Password validation
export const passwordSchema = z.string().min(6, "Şifre en az 6 karakter olmalıdır");

// User schemas
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Şifre gerekli"),
});

// Exam schemas
export const examSchema = z.object({
  code: z.string().min(1, "Sınav kodu gerekli").max(10, "Sınav kodu çok uzun"),
  name: z.string().min(1, "Sınav adı gerekli").max(100, "Sınav adı çok uzun"),
});

// Category schemas
export const categorySchema = z.object({
  examId: z.string().min(1, "Sınav seçimi gerekli"),
  name: z.string().min(1, "Kategori adı gerekli").max(100, "Kategori adı çok uzun"),
  order: z.coerce.number().int().min(0, "Sıra 0 veya pozitif olmalı").default(0),
});

// Topic schemas
export const topicSchema = z.object({
  categoryId: z.string().min(1, "Kategori seçimi gerekli"),
  name: z.string().min(1, "Konu adı gerekli").max(100, "Konu adı çok uzun"),
  order: z.coerce.number().int().min(0, "Sıra 0 veya pozitif olmalı").default(0),
});

// Content schemas
export const contentSchema = z.object({
  topicId: z.string().min(1, "Konu seçimi gerekli"),
  type: z.enum(["LECTURE_VIDEO", "QUIZ", "TEST", "REVISION_VIDEO"], {
    errorMap: () => ({ message: "Geçersiz içerik türü" })
  }),
  provider: z.enum(["YOUTUBE", "VIMEO", "LINK", "PDF"], {
    errorMap: () => ({ message: "Geçersiz sağlayıcı" })
  }).default("YOUTUBE"),
  title: z.string().min(1, "Başlık gerekli").max(200, "Başlık çok uzun"),
  url: z.string().min(1, "URL gerekli"),
  durationSec: z.coerce.number().int().min(0, "Süre pozitif olmalı").optional(),
  metaJson: z.string().optional(),
}).refine((data) => {
  if (data.provider === "YOUTUBE") {
    return youtubeUrlSchema.safeParse(data.url).success;
  }
  return true;
}, {
  message: "YouTube URL'si geçersiz",
  path: ["url"],
});

// Question schemas
export const choiceSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Seçenek metni gerekli"),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  topicId: z.string().min(1, "Konu seçimi gerekli"),
  stem: z.string().min(1, "Soru metni gerekli"),
  explanation: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
    errorMap: () => ({ message: "Geçersiz zorluk seviyesi" })
  }).default("MEDIUM"),
  choices: z.array(choiceSchema).min(2, "En az 2 seçenek gerekli").max(10, "En fazla 10 seçenek olabilir"),
}).refine((data) => {
  const correctChoices = data.choices.filter(choice => choice.isCorrect);
  return correctChoices.length === 1;
}, {
  message: "Tam olarak 1 doğru seçenek işaretlenmeli",
  path: ["choices"],
});

// Test schemas
export const testSchema = z.object({
  topicId: z.string().min(1, "Konu seçimi gerekli"),
  name: z.string().min(1, "Test adı gerekli").max(100, "Test adı çok uzun"),
  durationMin: z.coerce.number().int().min(1, "Süre en az 1 dakika olmalı").optional(),
  settingsJson: z.string().optional(),
});

// Topic status schema
export const topicStatusSchema = z.object({
  topicId: z.string().min(1, "Konu ID gerekli"),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "DONE"], {
    errorMap: () => ({ message: "Geçersiz durum" })
  }),
});

// CSV import schemas
export const csvImportSchema = z.object({
  exam_code: z.string().min(1, "Sınav kodu gerekli"),
  category_name: z.string().min(1, "Kategori adı gerekli"),
  topic_name: z.string().min(1, "Konu adı gerekli"),
  order: z.coerce.number().int().min(0, "Sıra 0 veya pozitif olmalı").default(0),
});

// User preference schema
export const userPrefSchema = z.object({
  examId: z.string().min(1, "Sınav seçimi gerekli"),
});

// Validation helper functions
export function validateYouTubeUrl(url: string): boolean {
  return youtubeUrlSchema.safeParse(url).success;
}

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}

// CSV validation
export function validateCsvHeaders(headers: string[]): { isValid: boolean; missingHeaders: string[] } {
  const requiredHeaders = ['exam_code', 'category_name', 'topic_name'];
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  
  return {
    isValid: missingHeaders.length === 0,
    missingHeaders
  };
}

export function validateCsvRow(row: Record<string, string>): { isValid: boolean; errors: string[] } {
  const result = csvImportSchema.safeParse(row);
  
  if (result.success) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: result.error.errors.map(err => err.message)
  };
}