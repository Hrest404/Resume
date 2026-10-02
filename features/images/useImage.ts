'use client';

import { useState, useEffect, useCallback } from 'react';
import { saveImage, getImageAsObjectUrl, deleteImage } from '@/lib/storage/indexed-db';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UseImageOptions {
  imageId: string | null;
}

interface UseImageReturn {
  objectUrl: string | null;
  isLoading: boolean;
  upload: (file: File) => Promise<{ id: string; objectUrl: string }>;
  remove: () => Promise<void>;
  error: string | null;
}

export function useImage({ imageId }: UseImageOptions): UseImageReturn {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;

    if (!imageId) {
      setObjectUrl(null);
      return;
    }

    setIsLoading(true);
    getImageAsObjectUrl(imageId)
      .then((u) => {
        url = u;
        setObjectUrl(u);
      })
      .catch(() => {
        setObjectUrl(null);
      })
      .finally(() => setIsLoading(false));

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [imageId]);

  const upload = useCallback(async (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      const msg = 'Поддерживаются только JPEG, PNG и WebP';
      setError(msg);
      throw new Error(msg);
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      const msg = `Файл слишком большой. Максимум ${MAX_SIZE_MB} МБ`;
      setError(msg);
      throw new Error(msg);
    }

    setIsLoading(true);
    const id = `img-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    await saveImage({
      id,
      blob: file,
      mimeType: file.type,
      createdAt: new Date().toISOString(),
    });

    const url = URL.createObjectURL(file);

    // Cleanup old url
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(url);
    setIsLoading(false);

    return { id, objectUrl: url };
  }, [objectUrl]);

  const remove = useCallback(async () => {
    if (!imageId) return;
    await deleteImage(imageId);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
  }, [imageId, objectUrl]);

  return { objectUrl, isLoading, upload, remove, error };
}
