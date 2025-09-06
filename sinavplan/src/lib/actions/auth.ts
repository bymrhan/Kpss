"use server";

import { lucia, validateRequest } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/hash";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

const signInSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
  password: z.string().min(1, "Şifre gerekli"),
});

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = signUpSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      error: "Geçersiz veri",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email: validatedEmail, password: validatedPassword } = validatedFields.data;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedEmail },
    });

    if (existingUser) {
      return {
        error: "Bu email adresi zaten kullanılıyor",
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedPassword);

    // Determine role based on initial admin email
    const role = validatedEmail === process.env.INITIAL_ADMIN_EMAIL ? "ADMIN" : "USER";

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedEmail,
        hashedPassword,
        role,
      },
    });

    // Create session
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return { success: true };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      error: "Kayıt olurken bir hata oluştu",
    };
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = signInSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      error: "Geçersiz veri",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email: validatedEmail, password: validatedPassword } = validatedFields.data;

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedEmail },
    });

    if (!user) {
      return {
        error: "Geçersiz email veya şifre",
      };
    }

    // Verify password
    const validPassword = await verifyPassword(validatedPassword, user.hashedPassword);
    if (!validPassword) {
      return {
        error: "Geçersiz email veya şifre",
      };
    }

    // Create session
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return { success: true };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      error: "Giriş yaparken bir hata oluştu",
    };
  }
}

export async function signOut() {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Oturum bulunamadı",
    };
  }

  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  redirect("/auth/sign-in");
}