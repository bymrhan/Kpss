import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, FileText, Play } from "lucide-react";

export default async function AdminDashboardPage() {
  const { user } = await requireAdmin();

  // Get statistics
  const [
    examCount,
    categoryCount,
    topicCount,
    contentCount,
    userCount,
    recentUsers
  ] = await Promise.all([
    prisma.exam.count(),
    prisma.category.count(),
    prisma.topic.count(),
    prisma.content.count(),
    prisma.user.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Hoş geldiniz, {user.email}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sınavlar</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{examCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kategoriler</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Konular</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topicCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">İçerikler</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contentCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Son Kayıt Olan Kullanıcılar</CardTitle>
              <CardDescription>
                Son 5 kullanıcı
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === "ADMIN" 
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {user.role === "ADMIN" ? "Admin" : "Kullanıcı"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Henüz kullanıcı yok</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
              <CardDescription>
                Sık kullanılan admin işlemleri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/admin/exams"
                  className="p-3 border rounded-lg hover:bg-gray-50 text-center"
                >
                  <BookOpen className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Sınavlar</span>
                </a>
                <a
                  href="/admin/categories"
                  className="p-3 border rounded-lg hover:bg-gray-50 text-center"
                >
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Kategoriler</span>
                </a>
                <a
                  href="/admin/topics"
                  className="p-3 border rounded-lg hover:bg-gray-50 text-center"
                >
                  <BookOpen className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Konular</span>
                </a>
                <a
                  href="/admin/bulk-import"
                  className="p-3 border rounded-lg hover:bg-gray-50 text-center"
                >
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Toplu Yükleme</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}