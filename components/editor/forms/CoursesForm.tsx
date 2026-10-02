'use client';

import React from 'react';
import type { Resume, Course } from '@/lib/resume/schema';
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

export function CoursesForm({ resume, updateResume }: Props) {
  const courses = resume.courses || [];

  const addCourse = () => {
    const newCourse: Course = {
      id: crypto.randomUUID(),
      name: '',
      organization: '',
      date: '',
      url: '',
      description: '',
      hidden: false,
      order: courses.length,
    };
    updateResume((draft) => {
      if (!draft.courses) draft.courses = [];
      draft.courses.push(newCourse);
    });
  };

  const updateItem = (index: number, patch: Partial<Course>) => {
    updateResume((draft) => {
      if (draft.courses && draft.courses[index]) {
        Object.assign(draft.courses[index], patch);
      }
    });
  };

  const removeItem = (index: number) => {
    updateResume((draft) => {
      if (draft.courses) {
        draft.courses.splice(index, 1);
        draft.courses.forEach((item, idx) => {
          item.order = idx;
        });
      }
    });
  };

  return (
    <FormSection
      title="Курсы и сертификаты"
      description="Дополнительное обучение, сертификации и пройденные программы."
      action={
        <Button onClick={addCourse} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Добавить курс
        </Button>
      }
    >
      {courses.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground text-sm">
          Курсы пока не добавлены.
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course, idx) => (
            <div
              key={course.id}
              className={`p-4 rounded-lg border transition-all ${
                course.hidden ? 'bg-muted/40 border-muted opacity-70' : 'bg-card border-border'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Курс #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => updateItem(idx, { hidden: !course.hidden })}
                  >
                    {course.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  <Label>Название курса / сертификации *</Label>
                  <Input
                    placeholder="AWS Certified Solutions Architect / React Advanced"
                    value={course.name}
                    onChange={(e) => updateItem(idx, { name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Организация / Платформа</Label>
                  <Input
                    placeholder="Coursera, Udemy, Яндекс Практикум"
                    value={course.organization || ''}
                    onChange={(e) => updateItem(idx, { organization: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Дата прохождения</Label>
                  <Input
                    placeholder="2023"
                    value={course.date || ''}
                    onChange={(e) => updateItem(idx, { date: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Ссылка на сертификат</Label>
                  <Input
                    placeholder="https://..."
                    value={course.url || ''}
                    onChange={(e) => updateItem(idx, { url: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-3">
                <Label>Описание или изучаемые темы</Label>
                <Textarea
                  placeholder="Изученные инструменты и выполненные практические проекты..."
                  rows={2}
                  value={course.description || ''}
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
