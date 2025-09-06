"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface CsvPreviewTableProps {
  csvData: string;
  onImport: (data: string, createMissingCategories: boolean) => void;
  isLoading?: boolean;
}

interface ParsedRow {
  exam_code: string;
  category_name: string;
  topic_name: string;
  order: number;
  isValid: boolean;
  errors: string[];
}

export function CsvPreviewTable({ csvData, onImport, isLoading = false }: CsvPreviewTableProps) {
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [createMissingCategories, setCreateMissingCategories] = useState(false);

  useEffect(() => {
    if (!csvData.trim()) {
      setParsedData([]);
      return;
    }

    try {
      // Simple CSV parsing (for preview)
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const requiredHeaders = ['exam_code', 'category_name', 'topic_name'];
      const hasAllHeaders = requiredHeaders.every(header => headers.includes(header));

      if (!hasAllHeaders) {
        setParsedData([]);
        return;
      }

      const data: ParsedRow[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: ParsedRow = {
          exam_code: values[0] || '',
          category_name: values[1] || '',
          topic_name: values[2] || '',
          order: parseInt(values[3]) || 0,
          isValid: true,
          errors: []
        };

        // Validate row
        if (!row.exam_code) {
          row.errors.push('Exam code is required');
          row.isValid = false;
        }
        if (!row.category_name) {
          row.errors.push('Category name is required');
          row.isValid = false;
        }
        if (!row.topic_name) {
          row.errors.push('Topic name is required');
          row.isValid = false;
        }
        if (isNaN(row.order) || row.order < 0) {
          row.errors.push('Order must be a non-negative number');
          row.isValid = false;
        }

        data.push(row);
      }

      setParsedData(data);
    } catch (error) {
      console.error('CSV parsing error:', error);
      setParsedData([]);
    }
  }, [csvData]);

  const validRows = parsedData.filter(row => row.isValid);
  const invalidRows = parsedData.filter(row => !row.isValid);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Önizleme</CardTitle>
          <CardDescription>
            Yüklenecek verilerin önizlemesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Geçerli: {validRows.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">Hatalı: {invalidRows.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium">Toplam: {parsedData.length}</span>
            </div>
          </div>

          {invalidRows.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {invalidRows.length} satırda hata bulundu. Lütfen hataları düzeltin.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center space-x-2 mt-4">
            <input
              type="checkbox"
              id="createMissingCategories"
              checked={createMissingCategories}
              onChange={(e) => setCreateMissingCategories(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="createMissingCategories" className="text-sm">
              Eksik kategorileri otomatik oluştur
            </label>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={() => onImport(csvData, createMissingCategories)}
              disabled={isLoading || validRows.length === 0}
            >
              {isLoading ? "Yükleniyor..." : `${validRows.length} Kayıt Yükle`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Veri Önizleme</CardTitle>
            <CardDescription>
              İlk 10 satır gösteriliyor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Durum</TableHead>
                    <TableHead>Sınav Kodu</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Konu</TableHead>
                    <TableHead>Sıra</TableHead>
                    <TableHead>Hatalar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant={row.isValid ? "default" : "destructive"}>
                          {row.isValid ? "Geçerli" : "Hatalı"}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.exam_code}</TableCell>
                      <TableCell>{row.category_name}</TableCell>
                      <TableCell>{row.topic_name}</TableCell>
                      <TableCell>{row.order}</TableCell>
                      <TableCell>
                        {row.errors.length > 0 ? (
                          <div className="text-sm text-red-600">
                            {row.errors.join(', ')}
                          </div>
                        ) : (
                          <span className="text-sm text-green-600">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {parsedData.length > 10 && (
              <p className="text-sm text-gray-500 mt-2">
                ... ve {parsedData.length - 10} satır daha
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}