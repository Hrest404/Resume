import React from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function FormSection({ title, description, action, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
          {description && (
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
