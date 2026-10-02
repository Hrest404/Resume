'use client';

import React from 'react';
import { useResumeStore } from '@/features/resumes/store';
import { calculateProgress } from '@/lib/resume/selectors';
import {
  FileText, List, CheckSquare, BookOpen, Award,
  Globe, Briefcase, User, Palette, Download, Undo2, Redo2, Check,
} from 'lucide-react';

export type EditorStep =
  | 'personal'
  | 'about'
  | 'experience'
  | 'skills'
  | 'education'
  | 'courses'
  | 'languages'
  | 'contacts'
  | 'projects'
  | 'design'
  | 'export';

interface SidebarItem {
  step: EditorStep;
  label: string;
  icon: React.ReactNode;
}

const STEPS: SidebarItem[] = [
  { step: 'personal', label: 'Основное', icon: <User className="w-3.5 h-3.5" /> },
  { step: 'about', label: 'О себе', icon: <FileText className="w-3.5 h-3.5" /> },
  { step: 'experience', label: 'Опыт', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { step: 'skills', label: 'Навыки', icon: <CheckSquare className="w-3.5 h-3.5" /> },
  { step: 'education', label: 'Образование', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { step: 'courses', label: 'Курсы', icon: <Award className="w-3.5 h-3.5" /> },
  { step: 'languages', label: 'Языки', icon: <Globe className="w-3.5 h-3.5" /> },
  { step: 'contacts', label: 'Контакты', icon: <List className="w-3.5 h-3.5" /> },
  { step: 'projects', label: 'Проекты', icon: <FileText className="w-3.5 h-3.5" /> },
  { step: 'design', label: 'Дизайн', icon: <Palette className="w-3.5 h-3.5" /> },
  { step: 'export', label: 'Экспорт', icon: <Download className="w-3.5 h-3.5" /> },
];

const ActiveStepContext = React.createContext<{
  activeStep: EditorStep;
  setActiveStep: (s: EditorStep) => void;
}>({ activeStep: 'personal', setActiveStep: () => {} });

export function useActiveStep() {
  return React.useContext(ActiveStepContext);
}

export function ActiveStepProvider({ children }: { children: React.ReactNode }) {
  const [activeStep, setActiveStep] = React.useState<EditorStep>('personal');
  return <ActiveStepContext.Provider value={{ activeStep, setActiveStep }}>{children}</ActiveStepContext.Provider>;
}

export function EditorSidebar() {
  const { activeStep, setActiveStep } = useActiveStep();
  const resume = useResumeStore((s) => s.resume);
  const saveStatus = useResumeStore((s) => s.saveStatus);
  const undo = useResumeStore((s) => s.undo);
  const redo = useResumeStore((s) => s.redo);
  const canUndo = useResumeStore((s) => s.canUndo());
  const canRedo = useResumeStore((s) => s.canRedo());

  const progress = resume ? calculateProgress(resume) : 0;

  return (
      <div className="flex flex-col border-b border-slate-200/60 bg-white/40 backdrop-blur-md">
        {/* Progress & Undo/Redo Header */}
        <div className="px-5 py-3 border-b border-slate-200/50 flex items-center justify-between gap-3">
          <div className="flex-1 max-w-[200px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-slate-600">Готовность резюме</span>
              <span className="text-xs font-bold text-indigo-600 font-mono">{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SaveStatusBadge status={saveStatus} />
            <div className="flex items-center gap-1 bg-white/70 p-1 rounded-lg border border-slate-200/70 shadow-2xs backdrop-blur-sm">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-1 rounded-md hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Отменить"
                title="Отменить (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-1 rounded-md hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Повторить"
                title="Повторить (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Step Tabs */}
        <div className="flex overflow-x-auto scrollbar-thin px-3 py-1.5 gap-1.5">
          {STEPS.map((item) => {
            const isActive = activeStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => setActiveStep(item.step)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/70'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
  );
}

function SaveStatusBadge({ status }: { status: string }) {
  if (status === 'saving') {
    return (
      <span className="text-[11px] text-amber-600 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
        Сохранение...
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
        <Check className="w-3 h-3" /> Автосохранено
      </span>
    );
  }
  if (status === 'error') {
    return <span className="text-[11px] text-rose-500 font-medium">Ошибка сохранения</span>;
  }
  return null;
}
