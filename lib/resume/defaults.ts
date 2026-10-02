import type { Resume, SectionId } from './schema';

// ─── Section metadata ─────────────────────────────────────────────────────────

export const DEFAULT_SECTION_ORDER: SectionId[] = [
  'about',
  'experience',
  'skills',
  'projects',
  'education',
  'courses',
  'languages',
  'contacts',
];

export const SECTION_LABELS: Record<SectionId, string> = {
  about: 'О себе',
  experience: 'Опыт работы',
  skills: 'Навыки',
  education: 'Образование',
  courses: 'Курсы и сертификаты',
  languages: 'Языки',
  projects: 'Проекты',
  contacts: 'Контакты',
};

// ─── ID generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

// ─── Default resume factory ───────────────────────────────────────────────────

export function createDefaultResume(name = 'Моё резюме'): Resume {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    schemaVersion: 1,
    name,
    updatedAt: now,
    createdAt: now,
    firstName: '',
    lastName: '',
    position: '',
    city: '',
    birthDate: '',
    photoId: null,
    about: '',
    contacts: {
      phone: '',
      email: '',
      website: '',
      socialLinks: [],
    },
    experience: [],
    skills: [],
    education: [],
    courses: [],
    languages: [],
    projects: [],
    sectionOrder: DEFAULT_SECTION_ORDER,
    hiddenSections: [],
    design: {
      template: 'classic',
      accentColor: '#2563eb',
      font: 'inter',
      density: 'standard',
      showPhoto: true,
    },
  };
}
