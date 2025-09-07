"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Check } from "lucide-react";

interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionEditorProps {
  onSubmit: (question: {
    stem: string;
    explanation?: string;
    difficulty: string;
    choices: Choice[];
  }) => void;
  onCancel?: () => void;
  initialData?: {
    stem: string;
    explanation?: string;
    difficulty: string;
    choices: Choice[];
  };
}

export function QuestionEditor({ onSubmit, onCancel, initialData }: QuestionEditorProps) {
  const [stem, setStem] = useState(initialData?.stem || "");
  const [explanation, setExplanation] = useState(initialData?.explanation || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "MEDIUM");
  const [choices, setChoices] = useState<Choice[]>(
    initialData?.choices || [
      { id: "1", text: "", isCorrect: false },
      { id: "2", text: "", isCorrect: false },
      { id: "3", text: "", isCorrect: false },
      { id: "4", text: "", isCorrect: false },
    ]
  );

  const addChoice = () => {
    const newId = (choices.length + 1).toString();
    setChoices([...choices, { id: newId, text: "", isCorrect: false }]);
  };

  const removeChoice = (id: string) => {
    if (choices.length > 2) {
      setChoices(choices.filter(choice => choice.id !== id));
    }
  };

  const updateChoice = (id: string, field: keyof Choice, value: string | boolean) => {
    setChoices(choices.map(choice => 
      choice.id === id ? { ...choice, [field]: value } : choice
    ));
  };

  const setCorrectChoice = (id: string) => {
    setChoices(choices.map(choice => ({
      ...choice,
      isCorrect: choice.id === id
    })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stem.trim()) {
      alert("Soru metni gerekli");
      return;
    }

    const validChoices = choices.filter(choice => choice.text.trim());
    if (validChoices.length < 2) {
      alert("En az 2 seçenek gerekli");
      return;
    }

    const correctChoices = validChoices.filter(choice => choice.isCorrect);
    if (correctChoices.length !== 1) {
      alert("Tam olarak 1 doğru seçenek işaretlenmeli");
      return;
    }

    onSubmit({
      stem: stem.trim(),
      explanation: explanation.trim() || undefined,
      difficulty,
      choices: validChoices,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Soru Düzenleyici</CardTitle>
        <CardDescription>
          Yeni bir soru oluşturun veya mevcut soruyu düzenleyin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Stem */}
          <div className="space-y-2">
            <Label htmlFor="stem">Soru Metni *</Label>
            <Textarea
              id="stem"
              value={stem}
              onChange={(e) => setStem(e.target.value)}
              placeholder="Sorunuzu buraya yazın..."
              rows={4}
              required
            />
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="explanation">Açıklama</Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Soru açıklaması (opsiyonel)..."
              rows={3}
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Zorluk Seviyesi</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Zorluk seviyesi seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Kolay</SelectItem>
                <SelectItem value="MEDIUM">Orta</SelectItem>
                <SelectItem value="HARD">Zor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Choices */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Seçenekler *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChoice}
              >
                <Plus className="h-4 w-4 mr-2" />
                Seçenek Ekle
              </Button>
            </div>

            <div className="space-y-3">
              {choices.map((choice, index) => (
                <div key={choice.id} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <Input
                      value={choice.text}
                      onChange={(e) => updateChoice(choice.id, "text", e.target.value)}
                      placeholder={`Seçenek ${index + 1}`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant={choice.isCorrect ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCorrectChoice(choice.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  {choices.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeChoice(choice.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                İptal
              </Button>
            )}
            <Button type="submit">
              Soruyu Kaydet
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}