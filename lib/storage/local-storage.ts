import { resumeSchema } from '../resume/schema';
import type { Resume } from '../resume/schema';

const RESUME_LIST_KEY = 'rb:resumeList';
const ACTIVE_RESUME_KEY = 'rb:activeResumeId';
const RESUME_PREFIX = 'rb:resume:';

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__rb_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// ─── Resume List ──────────────────────────────────────────────────────────────

export interface ResumeListEntry {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}

export function getResumeList(): ResumeListEntry[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(RESUME_LIST_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ResumeListEntry[];
  } catch {
    return [];
  }
}

export function saveResumeList(list: ResumeListEntry[]): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(RESUME_LIST_KEY, JSON.stringify(list));
}

// ─── Active Resume ID ─────────────────────────────────────────────────────────

export function getActiveResumeId(): string | null {
  if (!isLocalStorageAvailable()) return null;
  return localStorage.getItem(ACTIVE_RESUME_KEY);
}

export function setActiveResumeId(id: string | null): void {
  if (!isLocalStorageAvailable()) return;
  if (id) {
    localStorage.setItem(ACTIVE_RESUME_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_RESUME_KEY);
  }
}

// ─── Resume CRUD ──────────────────────────────────────────────────────────────

export function loadResume(id: string): Resume | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(`${RESUME_PREFIX}${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = resumeSchema.safeParse(parsed);
    if (!result.success) {
      console.warn('Resume schema mismatch, attempting partial load', result.error);
      return parsed as Resume;
    }
    return result.data;
  } catch {
    return null;
  }
}

export function saveResume(resume: Resume): void {
  if (!isLocalStorageAvailable()) throw new Error('localStorage недоступен');
  localStorage.setItem(`${RESUME_PREFIX}${resume.id}`, JSON.stringify(resume));

  // Update list entry
  const list = getResumeList();
  const idx = list.findIndex((e) => e.id === resume.id);
  const entry: ResumeListEntry = {
    id: resume.id,
    name: resume.name,
    updatedAt: resume.updatedAt,
    createdAt: resume.createdAt,
  };
  if (idx >= 0) {
    list[idx] = entry;
  } else {
    list.push(entry);
  }
  saveResumeList(list);
}

export function deleteResume(id: string): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(`${RESUME_PREFIX}${id}`);
  const list = getResumeList().filter((e) => e.id !== id);
  saveResumeList(list);
}

export function clearAllData(): void {
  if (!isLocalStorageAvailable()) return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('rb:')) {
      keys.push(key);
    }
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
