'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '@/features/resumes/store';

export default function Home() {
  const router = useRouter();
  const loadAll = useResumeStore((s) => s.loadAll);
  const activeResumeId = useResumeStore((s) => s.activeResumeId);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (activeResumeId) {
      router.replace('/editor');
    }
  }, [activeResumeId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Загрузка...</p>
      </div>
    </div>
  );
}
