'use client';

import React from 'react';
import type { Resume, Language } from '@/lib/resume/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { FormSection } from './FormSection';

interface Props {
  resume: Resume;
  updateResume: (updater: (draft: Resume) => Resume | void) => void;
  imageUrls: Record<string, string>;
}

const LEVELS: Language['level'][] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'];
const LEVEL_LABELS: Record<Language['level'], string> = {
  A1: 'A1 — Начальный',
  A2: 'A2 — Ниже среднего',
  B1: 'B1 — Средний (Intermediate)',
  B2: 'B2 — Выше среднего (Upper-Intermediate)',
  C1: 'C1 — Продвинутый (Advanced)',
  C2: 'C2 — В совершенстве (Proficiency)',
  Native: 'Родной язык (Native)',
};

export function LanguagesForm({ resume, updateResume }: Props) {
  const languages = resume.languages || [];

  const addLanguage = () => {
    const newLang: Language = {
      id: crypto.randomUUID(),
      language: '',
      level: 'B1',
      hidden: false,
      order: languages.length,
    };
    updateResume((draft) => {
      if (!draft.languages) draft.languages = [];
      draft.languages.push(newLang);
    });
  };

  const updateItem = (index: number, patch: Partial<Language>) => {
    updateResume((draft) => {
      if (draft.languages && draft.languages[index]) {
        Object.assign(draft.languages[index], patch);
      }
    });
  };

  const removeItem = (index: number) => {
    updateResume((draft) => {
      if (draft.languages) {
        draft.languages.splice(index, 1);
        draft.languages.forEach((item, idx) => {
          item.order = idx;
        });
      }
    });
  };

  return (
    <FormSection
      title="Иностранные языки"
      description="Укажите языки, которыми владеете, и уровень владения."
      action={
        <Button onClick={addLanguage} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Добавить язык
        </Button>
      }
    >
      {languages.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground text-sm">
          Языки пока не добавлены.
        </div>
      ) : (
        <div className="space-y-3">
          {languages.map((lang, idx) => (
            <div
              key={lang.id}
              className={`p-3 rounded-lg border flex flex-col sm:flex-row items-center gap-3 transition-all ${
                lang.hidden ? 'bg-muted/40 border-muted opacity-70' : 'bg-card border-border'
              }`}
            >
              <div className="flex-1 w-full">
                <Label className="text-xs">Язык *</Label>
                <Input
                  placeholder="Русский, Английский, Немецкий..."
                  value={lang.language}
                  onChange={(e) => updateItem(idx, { language: e.target.value })}
                />
              </div>

              <div className="w-full sm:w-60">
                <Label className="text-xs">Уровень владения</Label>
                <select
                  value={lang.level}
                  onChange={(e) => updateItem(idx, { level: e.target.value as Language['level'] })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl} className="bg-popover text-popover-foreground">
                      {LEVEL_LABELS[lvl]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center mt-2 sm:mt-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => updateItem(idx, { hidden: !lang.hidden })}
                >
                  {lang.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
          ))}
        </div>
      )}
    </FormSection>
  );
}
