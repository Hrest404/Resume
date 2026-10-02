import type { Resume, SectionId } from './schema';

// ─── Selectors ────────────────────────────────────────────────────────────────

export function getVisibleSections(resume: Resume): SectionId[] {
  return resume.sectionOrder.filter(
    (s) => !resume.hiddenSections.includes(s)
  );
}

export function isSectionVisible(resume: Resume, sectionId: SectionId): boolean {
  return !resume.hiddenSections.includes(sectionId);
}

// ─── Progress calculation ─────────────────────────────────────────────────────

interface ProgressField {
  weight: number;
  filled: boolean;
}

export function calculateProgress(resume: Resume): number {
  const fields: ProgressField[] = [
    // Required (weight 3)
    { weight: 3, filled: !!resume.firstName?.trim() },
    { weight: 3, filled: !!resume.lastName?.trim() },
    { weight: 3, filled: !!resume.contacts.email?.trim() },
    // Important (weight 2)
    { weight: 2, filled: !!resume.position?.trim() },
    { weight: 2, filled: !!resume.about?.trim() },
    { weight: 2, filled: !!resume.photoId },
    { weight: 2, filled: resume.experience.length > 0 },
    { weight: 2, filled: resume.skills.length > 0 },
    // Nice to have (weight 1)
    { weight: 1, filled: !!resume.city?.trim() },
    { weight: 1, filled: !!resume.contacts.phone?.trim() },
    { weight: 1, filled: resume.education.length > 0 },
    { weight: 1, filled: resume.languages.length > 0 },
    { weight: 1, filled: resume.projects.length > 0 },
    { weight: 1, filled: resume.courses.length > 0 },
    { weight: 1, filled: resume.contacts.socialLinks.length > 0 },
  ];

  const total = fields.reduce((acc, f) => acc + f.weight, 0);
  const filled = fields.reduce((acc, f) => acc + (f.filled ? f.weight : 0), 0);
  return Math.round((filled / total) * 100);
}

// ─── Date formatting ──────────────────────────────────────────────────────────

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  if (!year) return '';
  if (!month) return year;
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

export function formatDateRange(
  startDate?: string,
  endDate?: string,
  isCurrent?: boolean
): string {
  const start = formatDate(startDate);
  const end = isCurrent ? 'по настоящее время' : formatDate(endDate);
  if (!start && !end) return '';
  if (!start) return end;
  if (!end) return start;
  return `${start} — ${end}`;
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

export function formatUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

export function getDisplayUrl(url?: string): string {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
