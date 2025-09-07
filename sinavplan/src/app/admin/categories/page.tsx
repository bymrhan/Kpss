import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/admin/categories";
import { Plus, Edit, Trash2 } from "lucide-react";

interface CategoriesPageProps {
  searchParams: {
    examId?: string;
  };
}

export default async function AdminCategoriesPage({ searchParams }: CategoriesPageProps) {
  await requireAdmin();

  const exams = await prisma.exam.findMany({
    orderBy: { name: "asc" }
  });

  const selectedExamId = searchParams.examId;

  const categories = await prisma.category.findMany({
    where: selectedExamId ? { examId: selectedExamId } : {},
    include: {
      exam: true,
      topics: true
    },
    orderBy: { order: "asc" }
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
            <p className="text-gray-600">
              Kategorileri yönetin ve yeni kategoriler ekleyin
            </p>
          </div>
        </div>

        {/* Exam Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Sınav Filtresi</CardTitle>
            <CardDescription>
              Belirli bir sınavın kategorilerini görüntüleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Select defaultValue={selectedExamId || "all"}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Sınav seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Sınavlar</SelectItem>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" asChild>
                <a href="/admin/categories">Tümünü Göster</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add New Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Yeni Kategori Ekle</span>
            </CardTitle>
            <CardDescription>
              Yeni bir kategori oluşturun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCategory} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="examId">Sınav</Label>
                  <Select name="examId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sınav seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Kategori Adı</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Türkçe, Matematik"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Sıra</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    placeholder="0"
                    defaultValue="0"
                  />
                </div>
              </div>
              <Button type="submit">Kategori Ekle</Button>
            </form>
          </CardContent>
        </Card>

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      {category.exam.name} - Sıra: {category.order}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{category.topics.length} konu</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/topics?categoryId=${category.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Konular
                      </a>
                    </Button>
                    <form action={deleteCategory} className="inline">
                      <input type="hidden" name="id" value={category.id} />
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

        {categories.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">
                {selectedExamId ? "Bu sınav için kategori bulunamadı" : "Henüz kategori eklenmemiş"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}