'use client';

import React, { useState, useCallback } from 'react';
import type { Resume } from '@/lib/resume/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, X, Crop } from 'lucide-react';
import { saveImage, deleteImage } from '@/lib/storage/indexed-db';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormSection } from './FormSection';

interface Props {
  resume: Resume;
  updateResume: (updater: (draft: Resume) => Resume | void) => void;
  imageUrls: Record<string, string>;
}

async function getCroppedBlob(imageSrc: string, cropArea: Area, mimeType: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(
        image,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, mimeType, 0.92);
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

export function PersonalForm({ resume, updateResume, imageUrls }: Props) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropMime, setCropMime] = useState('image/jpeg');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const photoUrl = resume.photoId ? imageUrls[resume.photoId] : null;

  const handleField = (field: keyof Resume, value: string) => {
    updateResume((r) => { (r as Record<string, unknown>)[field] = value; });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError(null);

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setPhotoError('Поддерживаются JPEG, PNG и WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Файл слишком большой. Максимум 5 МБ');
      return;
    }

    setCropMime(file.type);
    const url = URL.createObjectURL(file);
    setCropSrc(url);
  };

  const handleCropComplete = useCallback((_: Area, cropPixels: Area) => {
    setCroppedArea(cropPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!cropSrc || !croppedArea) return;
    setIsSaving(true);
    try {
      const blob = await getCroppedBlob(cropSrc, croppedArea, cropMime);
      // Delete old photo
      if (resume.photoId) {
        await deleteImage(resume.photoId);
      }
      const id = `photo-${Date.now()}`;
      await saveImage({ id, blob, mimeType: cropMime, createdAt: new Date().toISOString() });
      updateResume((r) => { r.photoId = id; });
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    } catch (err) {
      setPhotoError('Ошибка обработки изображения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!resume.photoId) return;
    await deleteImage(resume.photoId);
    updateResume((r) => { r.photoId = null; });
  };

  return (
    <div className="space-y-6">
      <FormSection title="Фотография">
        <div className="flex items-start gap-4">
          <div className="relative">
            {photoUrl ? (
              <div className="relative w-20 h-20">
                <img
                  src={photoUrl}
                  alt="Фото профиля"
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="Удалить фото"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <Camera className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent text-sm font-medium transition-colors">
                <Camera className="w-4 h-4" />
                {photoUrl ? 'Заменить фото' : 'Загрузить фото'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </label>
            <p className="text-xs text-slate-400">JPEG, PNG или WebP, до 5 МБ</p>
            {photoError && <p className="text-xs text-red-500">{photoError}</p>}
          </div>
        </div>
      </FormSection>

      <FormSection title="Личные данные">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="firstName">Имя <span className="text-red-500">*</span></Label>
            <Input
              id="firstName"
              value={resume.firstName}
              onChange={(e) => handleField('firstName', e.target.value)}
              placeholder="Иван"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">Фамилия <span className="text-red-500">*</span></Label>
            <Input
              id="lastName"
              value={resume.lastName}
              onChange={(e) => handleField('lastName', e.target.value)}
              placeholder="Иванов"
            />
          </div>
        </div>

        <div className="space-y-1 mt-3">
          <Label htmlFor="position">Должность</Label>
          <Input
            id="position"
            value={resume.position ?? ''}
            onChange={(e) => handleField('position', e.target.value)}
            placeholder="Frontend Developer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="space-y-1">
            <Label htmlFor="city">Город</Label>
            <Input
              id="city"
              value={resume.city ?? ''}
              onChange={(e) => handleField('city', e.target.value)}
              placeholder="Москва"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="birthDate">Дата рождения</Label>
            <Input
              id="birthDate"
              type="month"
              value={resume.birthDate ?? ''}
              onChange={(e) => handleField('birthDate', e.target.value)}
            />
          </div>
        </div>
      </FormSection>

      {/* Crop dialog */}
      <Dialog open={!!cropSrc} onOpenChange={(v) => { if (!v) { if (cropSrc) URL.revokeObjectURL(cropSrc); setCropSrc(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Обрезать фото</DialogTitle>
          </DialogHeader>
          <div className="relative h-72 bg-slate-800 rounded-lg overflow-hidden">
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-slate-500 w-12">Масштаб</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
              aria-label="Масштаб"
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => { if (cropSrc) URL.revokeObjectURL(cropSrc); setCropSrc(null); }}>
              Отмена
            </Button>
            <Button onClick={handleSaveCrop} disabled={isSaving}>
              <Crop className="w-4 h-4 mr-1" />
              {isSaving ? 'Сохранение...' : 'Применить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
