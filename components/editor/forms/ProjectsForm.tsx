'use client';

import React from 'react';
import type { Resume, Project } from '@/lib/resume/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye, EyeOff, Camera, X } from 'lucide-react';
import { saveImage, deleteImage } from '@/lib/storage/indexed-db';
import { FormSection } from './FormSection';

interface Props {
  resume: Resume;
  updateResume: (updater: (draft: Resume) => Resume | void) => void;
  imageUrls: Record<string, string>;
}

export function ProjectsForm({ resume, updateResume, imageUrls }: Props) {
  const projects = resume.projects || [];

  const addProject = () => {
    const newProj: Project = {
      id: crypto.randomUUID(),
      name: '',
      imageId: null,
      shortDescription: '',
      description: '',
      technologies: [],
      projectUrl: '',
      repoUrl: '',
      additionalLinks: [],
      hidden: false,
      order: projects.length,
    };
    updateResume((draft) => {
      if (!draft.projects) draft.projects = [];
      draft.projects.push(newProj);
    });
  };

  const updateItem = (index: number, patch: Partial<Project>) => {
    updateResume((draft) => {
      if (draft.projects && draft.projects[index]) {
        Object.assign(draft.projects[index], patch);
      }
    });
  };

  const removeItem = async (index: number) => {
    const proj = projects[index];
    if (proj?.imageId) {
      await deleteImage(proj.imageId).catch(console.error);
    }
    updateResume((draft) => {
      if (draft.projects) {
        draft.projects.splice(index, 1);
        draft.projects.forEach((item, idx) => {
          item.order = idx;
        });
      }
    });
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const proj = projects[index];
    if (proj?.imageId) {
      await deleteImage(proj.imageId).catch(console.error);
    }

    try {
      const imageId = `proj-${Date.now()}`;
      await saveImage({ id: imageId, blob: file, mimeType: file.type, createdAt: new Date().toISOString() });
      updateItem(index, { imageId });
    } catch (err) {
      console.error('Failed to upload project screenshot:', err);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const proj = projects[index];
    if (proj?.imageId) {
      await deleteImage(proj.imageId).catch(console.error);
      updateItem(index, { imageId: null });
    }
  };

  return (
    <FormSection
      title="Проекты и портфолио"
      description="Проекты будут отображаться в резюме и на мини-сайте портфолио."
      action={
        <Button onClick={addProject} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Добавить проект
        </Button>
      }
    >
      {projects.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground text-sm">
          Проекты пока не добавлены.
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((proj, idx) => (
            <div
              key={proj.id}
              className={`p-4 rounded-lg border transition-all ${
                proj.hidden ? 'bg-muted/40 border-muted opacity-70' : 'bg-card border-border'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Проект #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => updateItem(idx, { hidden: !proj.hidden })}
                  >
                    {proj.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label>Название проекта *</Label>
                  <Input
                    placeholder="E-commerce Marketplace / AI Assistant App"
                    value={proj.name}
                    onChange={(e) => updateItem(idx, { name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Ссылка на демо / сайт</Label>
                  <Input
                    placeholder="https://myproject.com"
                    value={proj.projectUrl || ''}
                    onChange={(e) => updateItem(idx, { projectUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Ссылка на GitHub / Репозиторий</Label>
                  <Input
                    placeholder="https://github.com/username/project"
                    value={proj.repoUrl || ''}
                    onChange={(e) => updateItem(idx, { repoUrl: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Краткое описание</Label>
                  <Input
                    placeholder="Сервис для автоматизации аналитики с интерактивными дашбордами"
                    value={proj.shortDescription || ''}
                    onChange={(e) => updateItem(idx, { shortDescription: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Стек технологий (через запятую)</Label>
                  <Input
                    placeholder="Next.js 15, TypeScript, Tailwind CSS, Prisma, PostgreSQL"
                    value={proj.technologies?.join(', ') || ''}
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
                <div className="md:col-span-2">
                  <Label>Полное описание проекта</Label>
                  <Textarea
                    placeholder="Архитектурные решения, реализованный функционал, метрики и результаты..."
                    rows={3}
                    value={proj.description || ''}
                    onChange={(e) => updateItem(idx, { description: e.target.value })}
                  />
                </div>

                {/* Screenshot upload */}
                <div className="md:col-span-2 pt-2">
                  <Label className="block mb-2">Скриншот или превью проекта (для сайта портфолио)</Label>
                  {proj.imageId && imageUrls[proj.imageId] ? (
                    <div className="relative inline-block border rounded-md overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrls[proj.imageId]}
                        alt={proj.name}
                        className="h-32 w-auto object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white hover:bg-black/80 rounded-full"
                        title="Удалить скриншот"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-md cursor-pointer hover:bg-accent/50 w-fit text-xs text-muted-foreground">
                      <Camera className="w-4 h-4" />
                      <span>Загрузить изображение</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => handleImageUpload(idx, e)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
}
