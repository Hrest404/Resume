'use client';

import React from 'react';
import type { Resume } from '@/lib/resume/schema';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormSection } from './FormSection';

interface Props {
  resume: Resume;
  updateResume: (updater: (draft: Resume) => Resume | void) => void;
  imageUrls: Record<string, string>;
}

export function AboutForm({ resume, updateResume }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateResume((draft) => {
      draft.about = e.target.value;
    });
  };

  return (
    <FormSection
      title="О себе"
      description="Расскажите о вашем ключевом опыте, целях, сильных сторонах и профессиональных интересах."
    >
      <div className="space-y-2">
        <Label htmlFor="about">Текст раздела «О себе»</Label>
        <Textarea
          id="about"
          value={resume.about ?? ''}
          onChange={handleChange}
          placeholder="Например: Опытный Frontend-разработчик с фокусом на React, TypeScript и создание интуитивных интерфейсов..."
          rows={7}
          className="resize-y"
        />
        <p className="text-xs text-muted-foreground">
          Рекомендуемый объем — 3-5 предложений или 200-400 символов.
        </p>
      </div>
    </FormSection>
  );
}
