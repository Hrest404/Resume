'use client';

import React, { useEffect, useState } from 'react';
import { useResumeStore } from '@/features/resumes/store';
import { useAutosave } from '@/features/autosave/useAutosave';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { EditorSidebar, ActiveStepProvider } from './EditorSidebar';
import { EditorForm } from './EditorForm';
import { ResumeListPanel } from './ResumeListPanel';
import { TopBar } from './TopBar';
import { getImageAsObjectUrl } from '@/lib/storage/indexed-db';
import { ZoomIn, ZoomOut, Sparkles } from 'lucide-react';

export default function EditorClient() {
  const loadAll = useResumeStore((s) => s.loadAll);
  const resume = useResumeStore((s) => s.resume);
  const [initialized, setInitialized] = useState(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [showResumeList, setShowResumeList] = useState(false);

  // Autosave
  useAutosave();

  // Initialize
  useEffect(() => {
    loadAll();
    setInitialized(true);
  }, [loadAll]);

  // Load image URLs
  useEffect(() => {
    if (!resume) return;

    const imageIds = new Set<string>();
    if (resume.photoId) imageIds.add(resume.photoId);
    resume.projects.forEach((p) => { if (p.imageId) imageIds.add(p.imageId); });

    let cancelled = false;
    const newUrls: Record<string, string> = {};

    Promise.all(
      Array.from(imageIds).map(async (id) => {
        const url = await getImageAsObjectUrl(id);
        if (url) newUrls[id] = url;
      })
    ).then(() => {
      if (!cancelled) {
        Object.values(imageUrls).forEach((url) => {
          if (!Object.values(newUrls).includes(url)) {
            URL.revokeObjectURL(url);
          }
        });
        setImageUrls(newUrls);
      }
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume?.photoId, JSON.stringify(resume?.projects.map((p) => p.imageId))]);

  if (!initialized || !resume) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Ambient Gradient Background */}
        <div className="glass-ambient-background">
          <div className="glass-ambient-orb-1" />
          <div className="glass-ambient-orb-2" />
        </div>
        <div className="relative z-10 glass-panel p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 animate-pulse">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Загрузка конструктора</h2>
            <p className="text-xs text-slate-600 mt-1">Инициализация локального хранилища данных...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex flex-col overflow-hidden select-none">
      {/* Ambient background with bleeding colors */}
      <div className="glass-ambient-background">
        <div className="glass-ambient-orb-1" />
        <div className="glass-ambient-orb-2" />
        <div className="glass-ambient-orb-3" />
      </div>

      {/* Main Glass Workspace Shell */}
      <div className="relative z-10 flex flex-col h-full p-2 md:p-3 gap-2 md:gap-3">
        {/* Top bar floating glass header */}
        <TopBar
          onToggleResumeList={() => setShowResumeList((v) => !v)}
          mobileTab={mobileTab}
          onMobileTabChange={setMobileTab}
        />

        {/* Split Glass Layout */}
        <div className="flex flex-1 min-h-0 gap-3 relative">
          {/* Resume list drawer / overlay */}
          {showResumeList && (
            <div className="absolute inset-0 z-40 flex lg:relative lg:z-auto lg:inset-auto">
              <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm lg:hidden"
                onClick={() => setShowResumeList(false)}
              />
              <div className="relative w-80 glass-panel rounded-2xl shadow-2xl z-10 overflow-y-auto flex flex-col border border-white/60">
                <ResumeListPanel onClose={() => setShowResumeList(false)} />
              </div>
            </div>
          )}

          {/* Left Panel: Form & Stepper */}
          <ActiveStepProvider>
            <div
              className={`w-full lg:w-[480px] xl:w-[530px] flex-shrink-0 glass-panel rounded-2xl flex flex-col overflow-hidden shadow-xl border border-white/60 ${
                mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <EditorSidebar />
              <div className="flex-1 overflow-y-auto scrollbar-thin select-text">
                <EditorForm imageUrls={imageUrls} />
              </div>
            </div>
          </ActiveStepProvider>

          {/* Right Panel: Live Preview Sheet */}
          <div
            className={`flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden shadow-xl border border-white/60 ${
              mobileTab === 'form' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <PreviewPanel resume={resume} imageUrls={imageUrls} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewPanel({
  resume,
  imageUrls,
}: {
  resume: import('@/lib/resume/schema').Resume;
  imageUrls: Record<string, string>;
}) {
  const [scale, setScale] = useState(0.62);

  return (
    <div className="flex flex-col h-full select-text">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-200/60 bg-white/40 backdrop-blur-md text-xs">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Живой предпросмотр (A4)</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg border border-slate-200/80 shadow-2xs backdrop-blur-md">
          <button
            onClick={() => setScale((s) => Math.max(0.35, +(s - 0.05).toFixed(2)))}
            className="p-1 rounded hover:bg-slate-200/70 text-slate-600 transition-colors"
            title="Уменьшить масштаб"
            aria-label="Уменьшить"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono font-semibold text-slate-700 px-1 text-[11px] min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(1.2, +(s + 0.05).toFixed(2)))}
            className="p-1 rounded hover:bg-slate-200/70 text-slate-600 transition-colors"
            title="Увеличить масштаб"
            aria-label="Увеличить"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start scrollbar-thin bg-slate-900/10">
        <div
          className="transition-transform duration-150 ease-out origin-top shadow-[0_20px_50px_rgba(0,0,0,0.25)] rounded-sm overflow-hidden ring-1 ring-black/10"
          style={{ transform: `scale(${scale})` }}
        >
          <ResumePreview resume={resume} imageUrls={imageUrls} scale={1} />
        </div>
      </div>
    </div>
  );
}
