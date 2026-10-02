'use client';

import React, { useState, useCallback } from 'react';
import { useResumeStore } from '@/features/resumes/store';
import { Button } from '@/components/ui/button';
import {
  FileText, Menu, Download, Globe, Eye, Upload, Sparkles, FolderOpen
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { ResumePDF } from '@/lib/pdf/ResumePDF';
import { generatePortfolioZip, downloadBlob } from '@/lib/portfolio/zip-export';
import { exportResumeToJSON, downloadJSON, importResumeFromJSON } from '@/features/export/json';
import { getAllImages, saveImage } from '@/lib/storage/indexed-db';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { PortfolioPreview } from '@/components/portfolio/PortfolioPreview';

interface Props {
  onToggleResumeList: () => void;
  mobileTab: 'form' | 'preview';
  onMobileTabChange: (tab: 'form' | 'preview') => void;
}

export function TopBar({ onToggleResumeList, mobileTab, onMobileTabChange }: Props) {
  const resume = useResumeStore((s) => s.resume);
  const resumeList = useResumeStore((s) => s.resumeList);
  const activeResumeId = useResumeStore((s) => s.activeResumeId);
  const loadAll = useResumeStore((s) => s.loadAll);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingZIP, setIsGeneratingZIP] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeEntry = resumeList.find((e) => e.id === activeResumeId);

  const handleExportPDF = useCallback(async () => {
    if (!resume) return;
    setIsGeneratingPDF(true);
    setError(null);
    try {
      const imageUrls: Record<string, string> = {};
      const allImgs = await getAllImages();
      for (const img of allImgs) {
        const url = URL.createObjectURL(img.blob);
        imageUrls[img.id] = url;
      }

      const blob = await pdf(<ResumePDF resume={resume} imageUrls={imageUrls} />).toBlob();
      downloadBlob(blob, `${resume.firstName || 'resume'}_${resume.lastName || ''}.pdf`);

      Object.values(imageUrls).forEach((u) => URL.revokeObjectURL(u));
    } catch (e) {
      setError('Ошибка генерации PDF. Попробуйте снова.');
      console.error(e);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [resume]);

  const handleExportJSON = useCallback(async () => {
    if (!resume) return;
    try {
      const json = await exportResumeToJSON(resume);
      downloadJSON(json, `${resume.firstName || 'resume'}_${resume.lastName || ''}.json`);
    } catch (e) {
      setError('Ошибка экспорта JSON');
    }
  }, [resume]);

  const handleImportJSON = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';

      try {
        const { resume: imported, images } = await importResumeFromJSON(file);
        for (const [id, base64] of Object.entries(images)) {
          const res = await fetch(base64);
          const blob = await res.blob();
          await saveImage({ id, blob, mimeType: blob.type, createdAt: new Date().toISOString() });
        }
        const { saveResume } = await import('@/lib/storage/local-storage');
        saveResume(imported);
        loadAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка импорта');
      }
    },
    [loadAll]
  );

  const handleExportZIP = useCallback(async () => {
    if (!resume) return;
    setIsGeneratingZIP(true);
    setError(null);
    try {
      const allImages = await getAllImages();
      const imageBlobs: Record<string, { blob: Blob; ext: string }> = {};
      for (const img of allImages) {
        const ext =
          img.mimeType === 'image/png' ? 'png' : img.mimeType === 'image/webp' ? 'webp' : 'jpg';
        imageBlobs[img.id] = { blob: img.blob, ext };
      }

      const zipBlob = await generatePortfolioZip({ resume, imageBlobs });
      downloadBlob(zipBlob, `${resume.name || 'portfolio'}-site.zip`);
    } catch (e) {
      setError('Ошибка создания ZIP архива');
      console.error(e);
    } finally {
      setIsGeneratingZIP(false);
    }
  }, [resume]);

  return (
    <>
      <header className="glass-panel rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg border border-white/60">
        {/* Left section: Drawer Toggle + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleResumeList}
            className="p-2 rounded-xl bg-white/70 hover:bg-white text-slate-700 hover:text-slate-950 transition-all shadow-2xs border border-white/60"
            aria-label="Список резюме"
            title="Список резюме"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/15 text-indigo-600 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-900 block truncate">
                {activeEntry?.name ?? 'Моё резюме'}
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:block">
                Конструктор резюме и портфолио
              </span>
            </div>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden bg-slate-200/50 p-1 rounded-xl border border-slate-300/40 backdrop-blur-md">
          <button
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === 'form'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => onMobileTabChange('form')}
          >
            Редактор
          </button>
          <button
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => onMobileTabChange('preview')}
          >
            Просмотр
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Portfolio Live Preview */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPortfolio(true)}
            title="Предпросмотр мини-сайта"
            className="hidden md:inline-flex gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Портфолио</span>
          </Button>

          {/* Download Portfolio Site */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportZIP}
            disabled={isGeneratingZIP}
            title="Скачать статический сайт ZIP"
            className="hidden sm:inline-flex gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>{isGeneratingZIP ? 'ZIP...' : 'ZIP-сайт'}</span>
          </Button>

          {/* JSON Import */}
          <label className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300/80 bg-white/70 hover:bg-white text-xs font-medium text-slate-700 shadow-2xs backdrop-blur-md cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Импорт</span>
            <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
          </label>

          {/* JSON Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            title="Экспорт резервной копии JSON"
            className="hidden sm:inline-flex"
          >
            JSON
          </Button>

          {/* PDF Export Main CTA */}
          <Button
            variant="default"
            size="sm"
            onClick={handleExportPDF}
            disabled={isGeneratingPDF}
            className="gap-1.5 font-semibold"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPDF ? 'PDF...' : 'PDF'}</span>
          </Button>
        </div>
      </header>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-card bg-rose-500/90 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-xl border border-rose-400">
          <span>{error}</span>
          <button className="font-bold hover:opacity-80" onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Portfolio Preview Dialog */}
      <Dialog open={showPortfolio} onOpenChange={setShowPortfolio}>
        <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span>Предпросмотр мини-сайта портфолио</span>
            </DialogTitle>
            <DialogDescription>
              Автономный статический сайт, готовый к бесплатной выгрузке на GitHub Pages или Vercel.
            </DialogDescription>
          </DialogHeader>
          {resume && <PortfolioPreview resume={resume} />}
          <div className="mt-4 flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="outline" onClick={() => setShowPortfolio(false)}>
              Закрыть
            </Button>
            <Button onClick={handleExportZIP} disabled={isGeneratingZIP} className="gap-2">
              <Download className="w-4 h-4" />
              {isGeneratingZIP ? 'Сборка...' : 'Скачать ZIP'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
