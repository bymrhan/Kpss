import Link from "next/link";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import { signUp } from "@/lib/actions/auth";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignUpPage() {
  const { user } = await validateRequest();
  
  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout
      title="Kayıt Ol"
      description="Yeni hesap oluşturun"
    >
      <form action={signUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="ornek@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="En az 6 karakter"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Kayıt Ol
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Zaten hesabınız var mı?{" "}
        <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
          Giriş yapın
        </Link>
      </div>
    </AuthLayout>
  );
}