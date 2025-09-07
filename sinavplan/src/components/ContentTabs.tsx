"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { Play, BookOpen, HelpCircle, RotateCcw, Clock } from "lucide-react";

interface Content {
  id: string;
  type: string;
  provider: string;
  title: string;
  url: string;
  durationSec?: number;
  metaJson?: string;
}

interface ContentTabsProps {
  contents: Content[];
  onStatusChange: (formData: FormData) => void;
  currentStatus: string;
  topicId: string;
}

export function ContentTabs({ contents, onStatusChange, currentStatus, topicId }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState("lecture_video");

  // Group contents by type
  const lectureVideos = contents.filter(c => c.type === "LECTURE_VIDEO");
  const revisionVideos = contents.filter(c => c.type === "REVISION_VIDEO");
  const quizzes = contents.filter(c => c.type === "QUIZ");
  const tests = contents.filter(c => c.type === "TEST");

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "LECTURE_VIDEO":
        return <Play className="h-4 w-4" />;
      case "REVISION_VIDEO":
        return <RotateCcw className="h-4 w-4" />;
      case "QUIZ":
        return <HelpCircle className="h-4 w-4" />;
      case "TEST":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "LECTURE_VIDEO":
        return "Konu Anlatım";
      case "REVISION_VIDEO":
        return "Tekrar Videosu";
      case "QUIZ":
        return "Quiz";
      case "TEST":
        return "Test";
      default:
        return type;
    }
  };

  const renderContent = (content: Content) => {
    if (content.provider === "YOUTUBE") {
      return <YouTubeEmbed url={content.url} title={content.title} />;
    }
    
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Desteklenmeyen içerik türü</p>
      </div>
    );
  };

  const renderContentList = (contentList: Content[], type: string) => {
    if (contentList.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            {getContentIcon(type)}
          </div>
          <p className="text-gray-500">Henüz {getContentTypeLabel(type).toLowerCase()} eklenmemiş</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {contentList.map((content) => (
          <Card key={content.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getContentIcon(content.type)}
                <span>{content.title}</span>
              </CardTitle>
              <CardDescription className="flex items-center space-x-4">
                <span>{getContentTypeLabel(content.type)}</span>
                {content.durationSec && (
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(content.durationSec)}</span>
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderContent(content)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Status Buttons */}
      <div className="flex justify-center space-x-4">
        <form action={onStatusChange}>
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="status" value="NOT_STARTED" />
          <Button
            type="submit"
            variant={currentStatus === "NOT_STARTED" ? "default" : "outline"}
          >
            Başlamadım
          </Button>
        </form>
        <form action={onStatusChange}>
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="status" value="IN_PROGRESS" />
          <Button
            type="submit"
            variant={currentStatus === "IN_PROGRESS" ? "default" : "outline"}
          >
            Başladım
          </Button>
        </form>
        <form action={onStatusChange}>
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="status" value="DONE" />
          <Button
            type="submit"
            variant={currentStatus === "DONE" ? "default" : "outline"}
          >
            Bitirdim
          </Button>
        </form>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lecture_video" className="flex items-center space-x-2">
            <Play className="h-4 w-4" />
            <span>Konu Anlatım</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Test</span>
          </TabsTrigger>
          <TabsTrigger value="revision_video" className="flex items-center space-x-2">
            <RotateCcw className="h-4 w-4" />
            <span>Tekrar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lecture_video" className="mt-6">
          {renderContentList(lectureVideos, "LECTURE_VIDEO")}
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          {renderContentList(quizzes, "QUIZ")}
        </TabsContent>

        <TabsContent value="test" className="mt-6">
          {renderContentList(tests, "TEST")}
        </TabsContent>

        <TabsContent value="revision_video" className="mt-6">
          {renderContentList(revisionVideos, "REVISION_VIDEO")}
        </TabsContent>
      </Tabs>
    </div>
  );
}