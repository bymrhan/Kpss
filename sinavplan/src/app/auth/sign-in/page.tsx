import Link from "next/link";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import { signIn } from "@/lib/actions/auth";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignInPage() {
  const { user } = await validateRequest();
  
  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout
      title="Giriş Yap"
      description="Hesabınıza giriş yapın"
    >
      <form action={signIn} className="space-y-4">
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
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Giriş Yap
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Hesabınız yok mu?{" "}
        <Link href="/auth/sign-up" className="text-blue-600 hover:underline">
          Kayıt olun
        </Link>
      </div>
    </AuthLayout>
  );
}