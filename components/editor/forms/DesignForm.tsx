'use client';

import React from 'react';
import type { Resume, ResumeDesign } from '@/lib/resume/schema';
import { Label } from '@/components/ui/label';
import { FormSection } from './FormSection';

interface Props {
  resume: Resume;
  updateResume: (updater: (draft: Resume) => Resume | void) => void;
  imageUrls: Record<string, string>;
}

const TEMPLATES: { id: ResumeDesign['template']; name: string; desc: string }[] = [
  { id: 'classic', name: 'Классический', desc: 'Строгий двухколоночный макет с темным сайдбаром' },
  { id: 'modern', name: 'Современный', desc: 'Светлый макет с цветными акцентами и тегами' },
  { id: 'minimal', name: 'Минималистичный', desc: 'Одноколоночный элегантный стиль с чистой типографикой' },
];

const FONTS: { id: ResumeDesign['font']; name: string }[] = [
  { id: 'inter', name: 'Inter (Sans-serif)' },
  { id: 'roboto', name: 'Roboto' },
  { id: 'geist', name: 'Geist' },
  { id: 'source-sans', name: 'Source Sans' },
  { id: 'merriweather', name: 'Merriweather (Serif)' },
];

const DENSITIES: { id: ResumeDesign['density']; name: string; desc: string }[] = [
  { id: 'compact', name: 'Компактная', desc: 'Умещает больше информации на одной странице' },
  { id: 'standard', name: 'Стандартная', desc: 'Сбалансированные отступы и читаемость' },
  { id: 'spacious', name: 'Просторная', desc: 'Увеличенные интервалы и воздух' },
];

const COLOR_PRESETS = [
  { name: 'Синий индиго', color: '#2563eb' },
  { name: 'Изумрудный', color: '#059669' },
  { name: 'Фиолетовый', color: '#7c3aed' },
  { name: 'Графитовый', color: '#334155' },
  { name: 'Теплый янтарь', color: '#d97706' },
  { name: 'Бордовый', color: '#dc2626' },
  { name: 'Морская волна', color: '#0891b2' },
];

export function DesignForm({ resume, updateResume }: Props) {
  const design = resume.design;

  const updateDesign = (patch: Partial<ResumeDesign>) => {
    updateResume((draft) => {
      draft.design = { ...draft.design, ...patch };
    });
  };

  return (
    <FormSection
      title="Оформление и тема"
      description="Настройте шаблон, цветовую гамму, шрифты и плотность отображения резюме."
    >
      {/* Template selection */}
      <div className="space-y-2">
        <Label>Шаблон резюме</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => updateDesign({ template: tmpl.id })}
              className={`p-3 text-left rounded-lg border transition-all ${
                design.template === tmpl.id
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5 font-medium'
                  : 'border-border bg-card hover:bg-accent/40'
              }`}
            >
              <div className="text-sm font-semibold">{tmpl.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{tmpl.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-2 pt-2">
        <Label>Акцентный цвет</Label>
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.color}
              type="button"
              onClick={() => updateDesign({ accentColor: preset.color })}
              className={`w-8 h-8 rounded-full transition-transform border-2 ${
                design.accentColor === preset.color
                  ? 'scale-115 border-foreground shadow-md'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            />
          ))}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <input
              type="color"
              value={design.accentColor}
              onChange={(e) => updateDesign({ accentColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-input p-0 bg-transparent"
              title="Выбрать свой цвет"
            />
            <span className="text-xs text-muted-foreground font-mono">{design.accentColor}</span>
          </div>
        </div>
      </div>

      {/* Font & Density */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <Label>Основной шрифт</Label>
          <select
            value={design.font}
            onChange={(e) => updateDesign({ font: e.target.value as ResumeDesign['font'] })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            {FONTS.map((f) => (
              <option key={f.id} value={f.id} className="bg-popover text-popover-foreground">
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Плотность (интервалы)</Label>
          <select
            value={design.density}
            onChange={(e) => updateDesign({ density: e.target.value as ResumeDesign['density'] })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            {DENSITIES.map((d) => (
              <option key={d.id} value={d.id} className="bg-popover text-popover-foreground">
                {d.name} ({d.desc})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Show Photo Toggle */}
      <div className="pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={design.showPhoto}
            onChange={(e) => updateDesign({ showPhoto: e.target.checked })}
            className="rounded border-input text-primary focus:ring-primary h-4 w-4"
          />
          <span className="text-sm">Отображать фото в резюме</span>
        </label>
      </div>
    </FormSection>
  );
}
