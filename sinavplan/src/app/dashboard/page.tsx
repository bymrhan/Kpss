import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserLayout } from "@/components/layouts/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const { user } = await requireAuth();
  
  // Check if user has selected an exam
  const userPref = await prisma.userPref.findUnique({
    where: { userId: user.id },
    include: { exam: true },
  });

  if (!userPref) {
    redirect("/onboarding");
  }

  // Get user's topic statuses
  const topicStatuses = await prisma.userTopicStatus.findMany({
    where: { userId: user.id },
    include: {
      topic: {
        include: {
          category: {
            include: { exam: true }
          }
        }
      }
    },
  });

  // Get all topics for the user's exam
  const allTopics = await prisma.topic.findMany({
    where: {
      category: {
        examId: userPref.examId
      }
    },
    include: {
      category: true
    }
  });

  // Calculate progress
  const totalTopics = allTopics.length;
  const completedTopics = topicStatuses.filter(status => status.status === "DONE").length;
  const inProgressTopics = topicStatuses.filter(status => status.status === "IN_PROGRESS").length;
  const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Get recent activity
  const recentTopics = topicStatuses
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Get categories with topic counts
  const categories = await prisma.category.findMany({
    where: { examId: userPref.examId },
    include: {
      topics: {
        include: {
          userTopicStatus: {
            where: { userId: user.id }
          }
        }
      }
    },
    orderBy: { order: "asc" }
  });

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {userPref.exam.name} sınavına hazırlık ilerlemeniz
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Konu</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTopics}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTopics}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Devam Eden</CardTitle>
              <Play className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inProgressTopics}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">İlerleme</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressPercentage}%</div>
              <Progress value={progressPercentage} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Categories Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Kategori İlerlemesi</CardTitle>
              <CardDescription>
                Her kategorideki konu ilerlemeniz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map((category) => {
                const categoryTopics = category.topics;
                const completedInCategory = categoryTopics.filter(topic => 
                  topic.userTopicStatus.some(status => status.status === "DONE")
                ).length;
                const categoryProgress = categoryTopics.length > 0 
                  ? Math.round((completedInCategory / categoryTopics.length) * 100) 
                  : 0;

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-gray-500">
                        {completedInCategory}/{categoryTopics.length}
                      </span>
                    </div>
                    <Progress value={categoryProgress} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
              <CardDescription>
                Son çalıştığınız konular
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTopics.length > 0 ? (
                <div className="space-y-4">
                  {recentTopics.map((status) => (
                    <div key={status.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{status.topic.name}</p>
                        <p className="text-sm text-gray-500">
                          {status.topic.category.name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          status.status === "DONE" 
                            ? "bg-green-100 text-green-800"
                            : status.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {status.status === "DONE" ? "Tamamlandı" : 
                           status.status === "IN_PROGRESS" ? "Devam Ediyor" : "Başlanmadı"}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/topic/${status.topic.id}`}>
                            Devam Et
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz aktivite yok</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Katalogdan bir konu seçerek başlayın.
                  </p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href="/catalog">Kataloga Git</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
}