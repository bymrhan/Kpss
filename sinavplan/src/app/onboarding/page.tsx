import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { selectExam } from "@/lib/actions/onboarding";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default async function OnboardingPage() {
  const { user } = await requireAuth();
  
  // Check if user already has a preference
  const userPref = await prisma.userPref.findUnique({
    where: { userId: user.id },
    include: { exam: true },
  });

  if (userPref) {
    redirect("/dashboard");
  }

  // Get all exams
  const exams = await prisma.exam.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Hoş Geldiniz!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hangi sınava hazırlanmak istiyorsunuz?
          </p>
        </div>

        <form action={selectExam} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {exams.map((exam) => (
              <Card key={exam.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <label htmlFor={exam.id} className="block cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{exam.name}</CardTitle>
                    <CardDescription>
                      {exam.code} sınavına hazırlık
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <input
                      type="radio"
                      id={exam.id}
                      name="examId"
                      value={exam.id}
                      className="sr-only"
                      required
                    />
                    <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                      <span className="text-sm text-gray-500">Seç</span>
                    </div>
                  </CardContent>
                </label>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full" size="lg">
            Devam Et
          </Button>
        </form>
      </div>
    </div>
  );
}