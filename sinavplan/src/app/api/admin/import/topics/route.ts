import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import { z } from "zod";

const topicImportSchema = z.object({
  exam_code: z.string().min(1, "Exam code is required"),
  category_name: z.string().min(1, "Category name is required"),
  topic_name: z.string().min(1, "Topic name is required"),
  order: z.coerce.number().int().min(0, "Order must be non-negative").default(0),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { csvData, createMissingCategories = false } = body;

    if (!csvData) {
      return NextResponse.json(
        { error: "CSV data is required" },
        { status: 400 }
      );
    }

    // Parse CSV data
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      return NextResponse.json(
        { error: "No data found in CSV" },
        { status: 400 }
      );
    }

    // Validate CSV structure
    const requiredColumns = ['exam_code', 'category_name', 'topic_name'];
    const csvColumns = Object.keys(records[0]);
    const missingColumns = requiredColumns.filter(col => !csvColumns.includes(col));
    
    if (missingColumns.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required columns: ${missingColumns.join(', ')}`,
          requiredColumns,
          foundColumns: csvColumns
        },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      errors: [] as string[],
      createdCategories: [] as string[],
      createdTopics: [] as string[],
    };

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        const validatedRecord = topicImportSchema.parse(record);
        const { exam_code, category_name, topic_name, order } = validatedRecord;

        // Find exam
        const exam = await prisma.exam.findUnique({
          where: { code: exam_code },
        });

        if (!exam) {
          results.errors.push(`Row ${i + 1}: Exam '${exam_code}' not found`);
          continue;
        }

        // Find or create category
        let category = await prisma.category.findFirst({
          where: {
            examId: exam.id,
            name: category_name,
          },
        });

        if (!category) {
          if (!createMissingCategories) {
            results.errors.push(`Row ${i + 1}: Category '${category_name}' not found for exam '${exam_code}'`);
            continue;
          }

          // Create category
          category = await prisma.category.create({
            data: {
              examId: exam.id,
              name: category_name,
              order: 0,
            },
          });
          results.createdCategories.push(category_name);
        }

        // Check if topic already exists
        const existingTopic = await prisma.topic.findFirst({
          where: {
            categoryId: category.id,
            name: topic_name,
          },
        });

        if (existingTopic) {
          results.errors.push(`Row ${i + 1}: Topic '${topic_name}' already exists in category '${category_name}'`);
          continue;
        }

        // Create topic
        await prisma.topic.create({
          data: {
            categoryId: category.id,
            name: topic_name,
            order: order,
          },
        });
        
        results.createdTopics.push(topic_name);
        results.success++;
      } catch (error) {
        if (error instanceof z.ZodError) {
          results.errors.push(`Row ${i + 1}: ${error.errors.map(e => e.message).join(', ')}`);
        } else {
          results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: records.length,
        successful: results.success,
        errors: results.errors.length,
        createdCategories: results.createdCategories.length,
        createdTopics: results.createdTopics.length,
      }
    });
  } catch (error) {
    console.error("Bulk import topics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}