import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createExam, updateExam, deleteExam } from "@/lib/actions/admin/exams";
import { Plus, Edit, Trash2 } from "lucide-react";

export default async function AdminExamsPage() {
  await requireAdmin();

  const exams = await prisma.exam.findMany({
    include: {
      categories: {
        include: {
          topics: true
        }
      },
      _count: {
        select: {
          userPrefs: true
        }
      }
    },
    orderBy: { name: "asc" }
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sınavlar</h1>
            <p className="text-gray-600">
              Sınavları yönetin ve yeni sınavlar ekleyin
            </p>
          </div>
        </div>

        {/* Add New Exam */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Yeni Sınav Ekle</span>
            </CardTitle>
            <CardDescription>
              Yeni bir sınav oluşturun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createExam} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="code">Sınav Kodu</Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="KPSS, YKS, ALES"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Sınav Adı</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Kamu Personeli Seçme Sınavı"
                    required
                  />
                </div>
              </div>
              <Button type="submit">Sınav Ekle</Button>
            </form>
          </CardContent>
        </Card>

        {/* Exams List */}
        <div className="space-y-4">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{exam.name}</h3>
                    <p className="text-sm text-gray-500">Kod: {exam.code}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{exam.categories.length} kategori</span>
                      <span>
                        {exam.categories.reduce((acc, cat) => acc + cat.topics.length, 0)} konu
                      </span>
                      <span>{exam._count.userPrefs} kullanıcı</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/categories?examId=${exam.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Kategoriler
                      </a>
                    </Button>
                    <form action={deleteExam} className="inline">
                      <input type="hidden" name="id" value={exam.id} />
                      <Button variant="outline" size="sm" type="submit">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {exams.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Henüz sınav eklenmemiş</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}