'use client';

import React from 'react';
import type { Resume, Experience } from '@/lib/resume/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { FormSection } from './FormSection';

interface Props {
  resume: Resume;
  updateResume: (updater: (draft: Resume) => Resume | void) => void;
  imageUrls: Record<string, string>;
}

export function ExperienceForm({ resume, updateResume }: Props) {
  const experiences = resume.experience || [];

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      city: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      achievements: '',
      technologies: [],
      hidden: false,
      order: experiences.length,
    };
    updateResume((draft) => {
      if (!draft.experience) draft.experience = [];
      draft.experience.push(newExp);
    });
  };

  const updateItem = (index: number, patch: Partial<Experience>) => {
    updateResume((draft) => {
      if (draft.experience && draft.experience[index]) {
        Object.assign(draft.experience[index], patch);
      }
    });
  };

  const removeItem = (index: number) => {
    updateResume((draft) => {
      if (draft.experience) {
        draft.experience.splice(index, 1);
        draft.experience.forEach((item, idx) => {
          item.order = idx;
        });
      }
    });
  };

  return (
    <FormSection
      title="Опыт работы"
      description="Укажите ваши предыдущие места работы, ключевые обязанности и достижения."
      action={
        <Button onClick={addExperience} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Добавить место
        </Button>
      }
    >
      {experiences.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground text-sm">
          Опыт работы пока не добавлен. Нажмите «Добавить место», чтобы заполнить.
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, idx) => (
            <div
              key={exp.id}
              className={`p-4 rounded-lg border transition-all ${
                exp.hidden ? 'bg-muted/40 border-muted opacity-70' : 'bg-card border-border'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Место #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => updateItem(idx, { hidden: !exp.hidden })}
                    title={exp.hidden ? 'Показать в резюме' : 'Скрыть из резюме'}
                  >
                    {exp.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeItem(idx)}
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Должность *</Label>
                  <Input
                    placeholder="Senior Frontend Developer"
                    value={exp.position}
                    onChange={(e) => updateItem(idx, { position: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Компания / Проект *</Label>
                  <Input
                    placeholder="Компания"
                    value={exp.company}
                    onChange={(e) => updateItem(idx, { company: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Город</Label>
                  <Input
                    placeholder="Москва / Удаленно"
                    value={exp.city || ''}
                    onChange={(e) => updateItem(idx, { city: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Начало работы</Label>
                    <Input
                      type="month"
                      value={exp.startDate || ''}
                      onChange={(e) => updateItem(idx, { startDate: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Окончание</Label>
                    <Input
                      type="month"
                      disabled={exp.isCurrent}
                      value={exp.isCurrent ? '' : exp.endDate || ''}
                      onChange={(e) => updateItem(idx, { endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`isCurrent-${exp.id}`}
                  checked={exp.isCurrent}
                  onChange={(e) => updateItem(idx, { isCurrent: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor={`isCurrent-${exp.id}`} className="text-sm font-normal cursor-pointer">
                  По настоящее время
                </Label>
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <Label>Обязанности и описание роли</Label>
                  <Textarea
                    placeholder="Разработка ключевых модулей, оптимизация производительности, код-ревью..."
                    rows={3}
                    value={exp.description || ''}
                    onChange={(e) => updateItem(idx, { description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Достижения</Label>
                  <Textarea
                    placeholder="Сократил время загрузки приложения на 40%, внедрил CI/CD pipeline..."
                    rows={2}
                    value={exp.achievements || ''}
                    onChange={(e) => updateItem(idx, { achievements: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Использованные технологии (через запятую)</Label>
                  <Input
                    placeholder="React, TypeScript, Next.js, Redux Toolkit, Tailwind CSS"
                    value={exp.technologies?.join(', ') || ''}
                    onChange={(e) =>
                      updateItem(idx, {
                        technologies: e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
}
