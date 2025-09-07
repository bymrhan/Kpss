import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create KPSS exam
  const kpssExam = await prisma.exam.upsert({
    where: { code: 'KPSS' },
    update: {},
    create: {
      code: 'KPSS',
      name: 'Kamu Personeli Seçme Sınavı',
    },
  });

  // Create YKS exam
  const yksExam = await prisma.exam.upsert({
    where: { code: 'YKS' },
    update: {},
    create: {
      code: 'YKS',
      name: 'Yükseköğretim Kurumları Sınavı',
    },
  });

  // Create categories for KPSS
  const turkceCategory = await prisma.category.upsert({
    where: { id: 'kpss-turkce' },
    update: {},
    create: {
      id: 'kpss-turkce',
      examId: kpssExam.id,
      name: 'Türkçe',
      order: 1,
    },
  });

  const matematikCategory = await prisma.category.upsert({
    where: { id: 'kpss-matematik' },
    update: {},
    create: {
      id: 'kpss-matematik',
      examId: kpssExam.id,
      name: 'Matematik',
      order: 2,
    },
  });

  // Create topics for Türkçe
  const topics = [
    { name: 'Ses Bilgisi', order: 1, categoryId: turkceCategory.id },
    { name: 'Kelime Bilgisi', order: 2, categoryId: turkceCategory.id },
    { name: 'Cümle Bilgisi', order: 3, categoryId: turkceCategory.id },
    { name: 'Paragraf', order: 4, categoryId: turkceCategory.id },
    { name: 'Anlatım Bozuklukları', order: 5, categoryId: turkceCategory.id },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { id: `topic-${topic.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `topic-${topic.name.toLowerCase().replace(/\s+/g, '-')}`,
        categoryId: topic.categoryId,
        name: topic.name,
        order: topic.order,
      },
    });
  }

  // Create topics for Matematik
  const matematikTopics = [
    { name: 'Temel Kavramlar', order: 1, categoryId: matematikCategory.id },
    { name: 'Sayılar', order: 2, categoryId: matematikCategory.id },
    { name: 'Cebir', order: 3, categoryId: matematikCategory.id },
    { name: 'Geometri', order: 4, categoryId: matematikCategory.id },
  ];

  for (const topic of matematikTopics) {
    await prisma.topic.upsert({
      where: { id: `topic-${topic.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `topic-${topic.name.toLowerCase().replace(/\s+/g, '-')}`,
        categoryId: topic.categoryId,
        name: topic.name,
        order: topic.order,
      },
    });
  }

  // Create sample content for first topic
  const firstTopic = await prisma.topic.findFirst({
    where: { name: 'Ses Bilgisi' }
  });

  if (firstTopic) {
    await prisma.content.upsert({
      where: { id: 'content-ses-bilgisi-1' },
      update: {},
      create: {
        id: 'content-ses-bilgisi-1',
        topicId: firstTopic.id,
        type: 'LECTURE_VIDEO',
        provider: 'YOUTUBE',
        title: 'Ses Bilgisi - Temel Kavramlar',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Sample URL
        durationSec: 1800, // 30 minutes
      },
    });

    await prisma.content.upsert({
      where: { id: 'content-ses-bilgisi-2' },
      update: {},
      create: {
        id: 'content-ses-bilgisi-2',
        topicId: firstTopic.id,
        type: 'REVISION_VIDEO',
        provider: 'YOUTUBE',
        title: 'Ses Bilgisi - Tekrar Videosu',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Sample URL
        durationSec: 900, // 15 minutes
      },
    });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });