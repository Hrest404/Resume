'use client';

import React from 'react';
import type { Resume, Education } from '@/lib/resume/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { FormSection } from './FormSection';

interface Props {
  resume: Resume;
  updateResume: (updater: (draft: Resume) => Resume | void) => void;
  imageUrls: Record<string, string>;
}

export function EducationForm({ resume, updateResume }: Props) {
  const educations = resume.education || [];

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      institution: '',
      specialty: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: '',
      hidden: false,
      order: educations.length,
    };
    updateResume((draft) => {
      if (!draft.education) draft.education = [];
      draft.education.push(newEdu);
    });
  };

  const updateItem = (index: number, patch: Partial<Education>) => {
    updateResume((draft) => {
      if (draft.education && draft.education[index]) {
        Object.assign(draft.education[index], patch);
      }
    });
  };

  const removeItem = (index: number) => {
    updateResume((draft) => {
      if (draft.education) {
        draft.education.splice(index, 1);
        draft.education.forEach((item, idx) => {
          item.order = idx;
        });
      }
    });
  };

  return (
    <FormSection
      title="Образование"
      description="Укажите высшее или среднее специальное образование."
      action={
        <Button onClick={addEducation} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Добавить образование
        </Button>
      }
    >
      {educations.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground text-sm">
          Образование пока не добавлено.
        </div>
      ) : (
        <div className="space-y-4">
          {educations.map((edu, idx) => (
            <div
              key={edu.id}
              className={`p-4 rounded-lg border transition-all ${
                edu.hidden ? 'bg-muted/40 border-muted opacity-70' : 'bg-card border-border'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Образование #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => updateItem(idx, { hidden: !edu.hidden })}
                  >
                    {edu.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label>Учебное заведение *</Label>
                  <Input
                    placeholder="МГТУ им. Н.Э. Баумана"
                    value={edu.institution}
                    onChange={(e) => updateItem(idx, { institution: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Специальность / Факультет</Label>
                  <Input
                    placeholder="Информатика и вычислительная техника"
                    value={edu.specialty || ''}
                    onChange={(e) => updateItem(idx, { specialty: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Степень / Квалификация</Label>
                  <Input
                    placeholder="Бакалавр / Магистр / Специалист"
                    value={edu.degree || ''}
                    onChange={(e) => updateItem(idx, { degree: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 md:col-span-2">
                  <div className="flex-1">
                    <Label>Год начала</Label>
                    <Input
                      placeholder="2018"
                      value={edu.startDate || ''}
                      onChange={(e) => updateItem(idx, { startDate: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Год окончания</Label>
                    <Input
                      placeholder="2022"
                      value={edu.endDate || ''}
                      onChange={(e) => updateItem(idx, { endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <Label>Дополнительная информация (дипломная работа, профильные предметы)</Label>
                <Textarea
                  placeholder="Тема диплома, научные публикации или дополнительные достижения..."
                  rows={2}
                  value={edu.description || ''}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
}
