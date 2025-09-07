"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, BookOpen, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Topic {
  id: string;
  name: string;
  order: number;
  userTopicStatus?: {
    status: string;
  }[];
}

interface Category {
  id: string;
  name: string;
  order: number;
  topics: Topic[];
}

interface TopicTreeProps {
  categories: Category[];
  examName: string;
}

export function TopicTree({ categories, examName }: TopicTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getTopicStatus = (topic: Topic) => {
    const status = topic.userTopicStatus?.[0]?.status;
    return status || "NOT_STARTED";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "IN_PROGRESS":
        return <Play className="h-4 w-4 text-blue-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DONE":
        return "Tamamlandı";
      case "IN_PROGRESS":
        return "Devam Ediyor";
      default:
        return "Başlanmadı";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{examName}</h2>
        <p className="text-gray-600">Konuları seçerek çalışmaya başlayın</p>
      </div>

      <div className="space-y-2">
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const completedTopics = category.topics.filter(topic => 
            getTopicStatus(topic) === "DONE"
          ).length;
          const totalTopics = category.topics.length;
          const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

          return (
            <Card key={category.id}>
              <CardContent className="p-0">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">
                        {completedTopics}/{totalTopics} konu tamamlandı ({progressPercentage}%)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200">
                    <div className="p-4 space-y-2">
                      {category.topics
                        .sort((a, b) => a.order - b.order)
                        .map((topic) => {
                          const status = getTopicStatus(topic);
                          return (
                            <div
                              key={topic.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(status)}
                                <div>
                                  <p className="font-medium text-gray-900">{topic.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {getStatusText(status)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
                                  {getStatusText(status)}
                                </span>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/topic/${topic.id}`}>
                                    {status === "NOT_STARTED" ? "Başla" : "Devam Et"}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}