'use client';

import React, { useState } from 'react';
import type { Resume, Skill } from '@/lib/resume/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { FormSection } from './FormSection';

interface Props {
  resume: Resume;
  updateResume: (updater: (draft: Resume) => Resume | void) => void;
  imageUrls: Record<string, string>;
}

const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Node.js',
  'HTML5 / CSS3', 'Tailwind CSS', 'Redux', 'GraphQL', 'REST API',
  'Git', 'Docker', 'PostgreSQL', 'Figma', 'Jest / Vitest', 'CI/CD',
];

export function SkillsForm({ resume, updateResume }: Props) {
  const [quickInput, setQuickInput] = useState('');
  const skills = resume.skills || [];

  const addSkill = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;

    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: trimmed,
      hidden: false,
      order: skills.length,
    };

    updateResume((draft) => {
      if (!draft.skills) draft.skills = [];
      draft.skills.push(newSkill);
    });
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    quickInput.split(/[,;\n]/).forEach((s) => addSkill(s));
    setQuickInput('');
  };

  const removeSkill = (index: number) => {
    updateResume((draft) => {
      if (draft.skills) {
        draft.skills.splice(index, 1);
        draft.skills.forEach((s, idx) => {
          s.order = idx;
        });
      }
    });
  };

  const toggleHidden = (index: number) => {
    updateResume((draft) => {
      if (draft.skills && draft.skills[index]) {
        draft.skills[index].hidden = !draft.skills[index].hidden;
      }
    });
  };

  return (
    <FormSection
      title="Навыки и стек"
      description="Перечислите ключевые технологии, инструменты и профессиональные компетенции."
    >
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <Input
          placeholder="Введите навык или несколько через запятую (например: React, TypeScript, Redux)"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
        />
        <Button type="submit" className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" /> Добавить
        </Button>
      </form>

      {/* Suggested popular skills */}
      <div>
        <span className="text-xs text-muted-foreground block mb-2">Популярные подсказки:</span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SKILLS.filter(
            (p) => !skills.some((s) => s.name.toLowerCase() === p.toLowerCase())
          ).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addSkill(s)}
              className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-primary/15 hover:text-primary transition-colors border border-border"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Active skills list */}
      <div className="pt-2">
        {skills.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground text-sm">
            Список навыков пуст. Добавьте навыки вручную или кликнув по подсказкам.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <div
                key={skill.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-all ${
                  skill.hidden
                    ? 'bg-muted/40 text-muted-foreground line-through opacity-60 border-muted'
                    : 'bg-card text-foreground border-border shadow-xs'
                }`}
              >
                <span>{skill.name}</span>
                <button
                  type="button"
                  onClick={() => toggleHidden(idx)}
                  className="text-muted-foreground hover:text-foreground p-0.5 ml-1"
                  title={skill.hidden ? 'Включить' : 'Скрыть'}
                >
                  {skill.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => removeSkill(idx)}
                  className="text-muted-foreground hover:text-destructive p-0.5"
                  title="Удалить"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormSection>
  );
}
