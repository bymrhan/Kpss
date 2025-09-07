import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserLayout } from "@/components/layouts/UserLayout";
import { ContentTabs } from "@/components/ContentTabs";
import { updateTopicStatus } from "@/lib/actions/topic-status";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TopicPageProps {
  params: {
    id: string;
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { user } = await requireAuth();
  
  // Get topic with all related data
  const topic = await prisma.topic.findUnique({
    where: { id: params.id },
    include: {
      category: {
        include: {
          exam: true
        }
      },
      contents: {
        orderBy: { createdAt: "asc" }
      },
      userTopicStatus: {
        where: { userId: user.id }
      }
    }
  });

  if (!topic) {
    notFound();
  }

  const currentStatus = topic.userTopicStatus[0]?.status || "NOT_STARTED";

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/catalog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
            <p className="text-gray-600">
              {topic.category.exam.name} - {topic.category.name}
            </p>
          </div>
        </div>

        {/* Content */}
        <ContentTabs
          contents={topic.contents}
          onStatusChange={updateTopicStatus}
          currentStatus={currentStatus}
          topicId={topic.id}
        />
      </div>
    </UserLayout>
  );
}