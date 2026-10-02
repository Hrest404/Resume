'use client';

import React, { useState } from 'react';
import type { Resume } from '@/lib/resume/schema';
import { Button } from '@/components/ui/button';
import { FileText, Download, Globe, Code } from 'lucide-react';
import { exportResumeToJSON, downloadJSON } from '@/features/export/json';
import { generatePortfolioZip, downloadBlob } from '@/lib/portfolio/zip-export';
import { pdf } from '@react-pdf/renderer';
import { ResumePDF } from '@/lib/pdf/ResumePDF';
import { FormSection } from './FormSection';

interface Props {
  resume: Resume;
  updateResume: (updater: (draft: Resume) => Resume | void) => void;
  imageUrls: Record<string, string>;
}

export function ExportForm({ resume, imageUrls }: Props) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const blob = await pdf(<ResumePDF resume={resume} imageUrls={imageUrls} />).toBlob();
      downloadBlob(blob, `${resume.name || 'resume'}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Ошибка при экспорте в PDF. Проверьте консоль разработчика.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportZip = async () => {
    try {
      setIsExportingZip(true);
      const { getAllImages } = await import('@/lib/storage/indexed-db');
      const allImages = await getAllImages();
      const imageBlobs: Record<string, { blob: Blob; ext: string }> = {};
      for (const img of allImages) {
        const ext = img.mimeType === 'image/png' ? 'png' : img.mimeType === 'image/webp' ? 'webp' : 'jpg';
        imageBlobs[img.id] = { blob: img.blob, ext };
      }
      const zipBlob = await generatePortfolioZip({ resume, imageBlobs });
      downloadBlob(zipBlob, `${resume.name || 'portfolio'}-site.zip`);
    } catch (err) {
      console.error('ZIP export error:', err);
      alert('Ошибка при генерации архива портфолио.');
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleExportJson = async () => {
    try {
      setIsExportingJson(true);
      const jsonString = await exportResumeToJSON(resume);
      downloadJSON(jsonString, `${resume.name || 'resume'}-backup.json`);
    } catch (err) {
      console.error('JSON export error:', err);
      alert('Ошибка при экспорте в JSON.');
    } finally {
      setIsExportingJson(false);
    }
  };

  return (
    <FormSection
      title="Экспорт и публикация"
      description="Сохраните резюме в PDF, скачайте архив готового сайта-портфолио или сделайте резервную копию в JSON."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* PDF Export */}
        <div className="p-4 bg-card border border-border rounded-lg flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">PDF Резюме</h3>
            <p className="text-xs text-muted-foreground">
              Готовый документ формата A4 для отправки рекрутерам и печати.
            </p>
          </div>
          <Button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="w-full gap-2"
          >
            <Download className="w-4 h-4" />
            {isExportingPdf ? 'Генерация PDF...' : 'Скачать PDF'}
          </Button>
        </div>

        {/* Static Portfolio ZIP */}
        <div className="p-4 bg-card border border-border rounded-lg flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">Сайт-портфолио (ZIP)</h3>
            <p className="text-xs text-muted-foreground">
              Автономный статический сайт (HTML+CSS+JS), готовый к хостингу на GitHub Pages / Vercel.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExportZip}
            disabled={isExportingZip}
            className="w-full gap-2"
          >
            <Download className="w-4 h-4" />
            {isExportingZip ? 'Сборка архива...' : 'Скачать ZIP-сайт'}
          </Button>
        </div>

        {/* JSON Backup */}
        <div className="p-4 bg-card border border-border rounded-lg flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">Резервная копия (JSON)</h3>
            <p className="text-xs text-muted-foreground">
              Полный дамп структуры резюме с изображениями (Base64) для переноса на другое устройство.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExportJson}
            disabled={isExportingJson}
            className="w-full gap-2"
          >
            <Download className="w-4 h-4" />
            {isExportingJson ? 'Экспорт JSON...' : 'Скачать JSON'}
          </Button>
        </div>
      </div>
    </FormSection>
  );
}
