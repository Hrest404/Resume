import type { Resume } from '@/lib/resume/schema';
import { resumeSchema } from '@/lib/resume/schema';
import { getAllImages, imageToBase64 } from '@/lib/storage/indexed-db';

export interface ResumeExport {
  exportVersion: 1;
  exportedAt: string;
  resume: Resume;
  images: Record<string, string>; // id -> base64 data URL
}

export async function exportResumeToJSON(resume: Resume): Promise<string> {
  const allImages = await getAllImages();
  const images: Record<string, string> = {};

  // Include photo
  if (resume.photoId) {
    const b64 = await imageToBase64(resume.photoId);
    if (b64) images[resume.photoId] = b64;
  }

  // Include project images
  for (const project of resume.projects) {
    if (project.imageId && !images[project.imageId]) {
      const b64 = await imageToBase64(project.imageId);
      if (b64) images[project.imageId] = b64;
    }
  }

  const exportData: ResumeExport = {
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    resume,
    images,
  };

  return JSON.stringify(exportData, null, 2);
}

export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importResumeFromJSON(file: File): Promise<{ resume: Resume; images: Record<string, string> }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text) as unknown;

        // Try as ResumeExport
        if (
          json !== null &&
          typeof json === 'object' &&
          'resume' in json &&
          'exportVersion' in json
        ) {
          const exportData = json as ResumeExport;
          const result = resumeSchema.safeParse(exportData.resume);
          if (!result.success) {
            reject(new Error(`Неверная структура резюме: ${result.error.issues[0]?.message}`));
            return;
          }
          resolve({ resume: result.data, images: exportData.images || {} });
        } else {
          // Try as raw Resume
          const result = resumeSchema.safeParse(json);
          if (!result.success) {
            reject(new Error(`Неверный формат файла. Ожидается JSON-экспорт резюме.`));
            return;
          }
          resolve({ resume: result.data, images: {} });
        }
      } catch {
        reject(new Error('Не удалось прочитать файл. Убедитесь, что это корректный JSON.'));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
}
