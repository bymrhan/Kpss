import Link from "next/link";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, BarChart3, Award } from "lucide-react";

export default async function HomePage() {
  const { user } = await validateRequest();
  
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">SinavPlan</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" asChild>
                <Link href="/auth/sign-in">Giriş Yap</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Kayıt Ol</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Sınav Hazırlık
            <span className="text-blue-600"> Platformu</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            KPSS, YKS, ALES ve diğer sınavlara hazırlanın. Konu anlatımları, testler ve quizlerle kendinizi geliştirin.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">Hemen Başla</Link>
              </Button>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/sign-in">Giriş Yap</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-blue-600" />
                <CardTitle>Konu Anlatımları</CardTitle>
                <CardDescription>
                  Detaylı video anlatımları ile konuları öğrenin
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-green-600" />
                <CardTitle>Testler & Quizler</CardTitle>
                <CardDescription>
                  Bilginizi test edin ve eksiklerinizi görün
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-purple-600" />
                <CardTitle>İlerleme Takibi</CardTitle>
                <CardDescription>
                  Çalışma ilerlemenizi takip edin
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Award className="h-8 w-8 text-yellow-600" />
                <CardTitle>Sertifikalar</CardTitle>
                <CardDescription>
                  Başarılarınızı belgelendirin
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
