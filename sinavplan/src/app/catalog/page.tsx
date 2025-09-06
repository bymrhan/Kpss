import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserLayout } from "@/components/layouts/UserLayout";
import { TopicTree } from "@/components/TopicTree";

export default async function CatalogPage() {
  const { user } = await requireAuth();
  
  // Check if user has selected an exam
  const userPref = await prisma.userPref.findUnique({
    where: { userId: user.id },
    include: { exam: true },
  });

  if (!userPref) {
    redirect("/onboarding");
  }

  // Get categories with topics and user status
  const categories = await prisma.category.findMany({
    where: { examId: userPref.examId },
    include: {
      topics: {
        include: {
          userTopicStatus: {
            where: { userId: user.id }
          }
        },
        orderBy: { order: "asc" }
      }
    },
    orderBy: { order: "asc" }
  });

  return (
    <UserLayout>
      <TopicTree categories={categories} examName={userPref.exam.name} />
    </UserLayout>
  );
}