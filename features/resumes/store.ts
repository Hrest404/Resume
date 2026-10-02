import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Resume } from '@/lib/resume/schema';
import type { ResumeListEntry } from '@/lib/storage/local-storage';
import {
  loadResume,
  saveResume,
  deleteResume as deleteResumeFromStorage,
  getResumeList,
  setActiveResumeId,
  getActiveResumeId,
} from '@/lib/storage/local-storage';
import { createDefaultResume } from '@/lib/resume/defaults';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface HistoryEntry {
  resume: Resume;
}

interface ResumeStore {
  // Resume list
  resumeList: ResumeListEntry[];
  activeResumeId: string | null;

  // Active resume state
  resume: Resume | null;
  saveStatus: SaveStatus;

  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;

  // Actions
  loadAll: () => void;
  setActiveResume: (id: string) => void;
  createResume: (name?: string) => string;
  duplicateResume: (id: string) => string;
  renameResume: (id: string, name: string) => void;
  deleteResume: (id: string) => void;

  updateResume: (updater: (draft: Resume) => Resume | void) => void;
  saveNow: () => Promise<void>;
  setSaveStatus: (status: SaveStatus) => void;

  pushHistory: (resume: Resume) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 50;

export const useResumeStore = create<ResumeStore>()(
  subscribeWithSelector((set, get) => ({
    resumeList: [],
    activeResumeId: null,
    resume: null,
    saveStatus: 'idle',
    history: [],
    historyIndex: -1,

    loadAll: () => {
      const list = getResumeList();
      const savedId = getActiveResumeId();
      let activeId = savedId && list.find((e) => e.id === savedId) ? savedId : null;

      if (list.length === 0) {
        // Create first resume
        const resume = createDefaultResume('Моё резюме');
        saveResume(resume);
        set({
          resumeList: [{ id: resume.id, name: resume.name, updatedAt: resume.updatedAt, createdAt: resume.createdAt }],
          activeResumeId: resume.id,
          resume,
          history: [{ resume }],
          historyIndex: 0,
        });
        setActiveResumeId(resume.id);
        return;
      }

      if (!activeId) {
        activeId = list[0].id;
      }

      const resume = loadResume(activeId);
      if (!resume) return;

      set({
        resumeList: list,
        activeResumeId: activeId,
        resume,
        history: [{ resume }],
        historyIndex: 0,
      });
      setActiveResumeId(activeId);
    },

    setActiveResume: (id) => {
      const resume = loadResume(id);
      if (!resume) return;
      set({
        activeResumeId: id,
        resume,
        history: [{ resume }],
        historyIndex: 0,
      });
      setActiveResumeId(id);
    },

    createResume: (name = 'Новое резюме') => {
      const resume = createDefaultResume(name);
      saveResume(resume);
      const list = getResumeList();
      set({
        resumeList: list,
        activeResumeId: resume.id,
        resume,
        history: [{ resume }],
        historyIndex: 0,
      });
      setActiveResumeId(resume.id);
      return resume.id;
    },

    duplicateResume: (id) => {
      const { nanoid } = require('nanoid');
      const source = loadResume(id);
      if (!source) return id;
      const now = new Date().toISOString();
      const copy: Resume = {
        ...source,
        id: nanoid(),
        name: `${source.name} (копия)`,
        updatedAt: now,
        createdAt: now,
        photoId: null, // images stay in IndexedDB, don't auto-copy
      };
      saveResume(copy);
      const list = getResumeList();
      set({
        resumeList: list,
        activeResumeId: copy.id,
        resume: copy,
        history: [{ resume: copy }],
        historyIndex: 0,
      });
      setActiveResumeId(copy.id);
      return copy.id;
    },

    renameResume: (id, name) => {
      const { resume } = get();
      if (resume && resume.id === id) {
        const updated = { ...resume, name, updatedAt: new Date().toISOString() };
        saveResume(updated);
        set({ resume: updated, resumeList: getResumeList() });
      } else {
        const r = loadResume(id);
        if (r) {
          saveResume({ ...r, name, updatedAt: new Date().toISOString() });
          set({ resumeList: getResumeList() });
        }
      }
    },

    deleteResume: (id) => {
      deleteResumeFromStorage(id);
      const list = getResumeList();
      const { activeResumeId } = get();

      if (activeResumeId === id) {
        if (list.length === 0) {
          // Create a new one
          get().createResume('Моё резюме');
        } else {
          get().setActiveResume(list[0].id);
        }
      } else {
        set({ resumeList: list });
      }
    },

    updateResume: (updater) => {
      const { resume } = get();
      if (!resume) return;

      // Push to history before update
      get().pushHistory(resume);

      const next = updater(resume);
      const updated: Resume = {
        ...(next !== undefined ? next : resume),
        updatedAt: new Date().toISOString(),
      };

      set({ resume: updated });
    },

    saveNow: async () => {
      const { resume } = get();
      if (!resume) return;
      set({ saveStatus: 'saving' });
      try {
        saveResume(resume);
        set({ saveStatus: 'saved', resumeList: getResumeList() });
        setTimeout(() => {
          set((s) => (s.saveStatus === 'saved' ? { saveStatus: 'idle' } : {}));
        }, 2000);
      } catch {
        set({ saveStatus: 'error' });
      }
    },

    setSaveStatus: (status) => set({ saveStatus: status }),

    pushHistory: (resume) => {
      set((state) => {
        const { history, historyIndex } = state;
        // Trim future entries if we're in the middle of the history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ resume });

        // Limit history size
        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
        }

        return {
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex <= 0) return;
      const newIndex = historyIndex - 1;
      const entry = history[newIndex];
      if (!entry) return;
      set({ resume: entry.resume, historyIndex: newIndex });
      saveResume(entry.resume);
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex >= history.length - 1) return;
      const newIndex = historyIndex + 1;
      const entry = history[newIndex];
      if (!entry) return;
      set({ resume: entry.resume, historyIndex: newIndex });
      saveResume(entry.resume);
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,
  }))
);
