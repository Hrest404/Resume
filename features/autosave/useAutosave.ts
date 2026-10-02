'use client';

import { useEffect, useRef } from 'react';
import { useResumeStore } from '@/features/resumes/store';
import { saveResume } from '@/lib/storage/local-storage';

const DEBOUNCE_MS = 800;

export function useAutosave() {
  const resume = useResumeStore((s) => s.resume);
  const setSaveStatus = useResumeStore((s) => s.setSaveStatus);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!resume) return;

    setSaveStatus('saving');

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        saveResume(resume);
        setSaveStatus('saved');
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } catch {
        setSaveStatus('error');
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resume, setSaveStatus]);
}
