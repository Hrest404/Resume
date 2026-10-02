'use client';

import React from 'react';
import type { Resume } from '@/lib/resume/schema';
import { ClassicTemplate } from './ClassicTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { ModernTemplate } from './ModernTemplate';

interface ResumePreviewProps {
  resume: Resume;
  imageUrls?: Record<string, string>;
  scale?: number;
}

export function ResumePreview({ resume, imageUrls = {}, scale = 1 }: ResumePreviewProps) {
  const templateProps = { resume, imageUrls };

  const template = (() => {
    switch (resume.design.template) {
      case 'minimal': return <MinimalTemplate {...templateProps} />;
      case 'modern': return <ModernTemplate {...templateProps} />;
      default: return <ClassicTemplate {...templateProps} />;
    }
  })();

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        width: '210mm',
        minHeight: '297mm',
      }}
    >
      {template}
    </div>
  );
}
