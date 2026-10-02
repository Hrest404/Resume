'use client';

import React, { useState } from 'react';
import { useResumeStore } from '@/features/resumes/store';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Copy, Trash2, X, FileText, Sparkles, ShieldCheck } from 'lucide-react';
import type { ResumeListEntry } from '@/lib/storage/local-storage';
import { clearAllData } from '@/lib/storage/local-storage';
import { clearAllImages } from '@/lib/storage/indexed-db';

interface Props {
  onClose: () => void;
}

export function ResumeListPanel({ onClose }: Props) {
  const resumeList = useResumeStore((s) => s.resumeList);
  const activeResumeId = useResumeStore((s) => s.activeResumeId);
  const createResume = useResumeStore((s) => s.createResume);
  const duplicateResume = useResumeStore((s) => s.duplicateResume);
  const renameResume = useResumeStore((s) => s.renameResume);
  const deleteResume = useResumeStore((s) => s.deleteResume);
  const setActiveResume = useResumeStore((s) => s.setActiveResume);

  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [newResumeName, setNewResumeName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  const handleCreate = () => {
    const name = newResumeName.trim() || 'Новое резюме';
    createResume(name);
    setNewResumeName('');
    setShowNewForm(false);
    onClose();
  };

  const handleRename = () => {
    if (!renameId) return;
    renameResume(renameId, renameName.trim() || 'Резюме');
    setRenameId(null);
  };

  const handleDelete = (id: string) => {
    deleteResume(id);
    setDeleteId(null);
  };

  const handleClearAll = async () => {
    clearAllData();
    await clearAllImages();
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full select-text">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Мои резюме</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Local data notice */}
      <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-900 leading-relaxed">
          Все данные и фотографии хранятся локально в IndexedDB и LocalStorage.
        </p>
      </div>

      {/* New resume button/form */}
      <div className="px-4 pt-3">
        {showNewForm ? (
          <div className="flex gap-2">
            <Input
              value={newResumeName}
              onChange={(e) => setNewResumeName(e.target.value)}
              placeholder="Название резюме"
              className="flex-1 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <Button size="sm" onClick={handleCreate}>Создать</Button>
            <Button size="icon" variant="ghost" onClick={() => setShowNewForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 font-medium"
            onClick={() => setShowNewForm(true)}
          >
            <Plus className="w-4 h-4" /> Новое резюме
          </Button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 mt-2 scrollbar-thin">
        {resumeList.map((entry) => (
          <ResumeListItem
            key={entry.id}
            entry={entry}
            isActive={entry.id === activeResumeId}
            onSelect={() => { setActiveResume(entry.id); onClose(); }}
            onRename={() => { setRenameId(entry.id); setRenameName(entry.name); }}
            onDuplicate={() => { duplicateResume(entry.id); onClose(); }}
            onDelete={() => setDeleteId(entry.id)}
          />
        ))}
      </div>

      {/* Clear all */}
      <div className="px-4 py-3 border-t border-slate-200/60 bg-white/30 backdrop-blur-md">
        <button
          onClick={() => setShowClearConfirm(true)}
          className="w-full text-xs text-rose-600 hover:text-rose-700 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors font-medium"
        >
          Очистить все локальные данные
        </button>
      </div>

      {/* Rename dialog */}
      <Dialog open={!!renameId} onOpenChange={(v) => !v && setRenameId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переименовать резюме</DialogTitle>
          </DialogHeader>
          <Input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
          />
          <div className="flex gap-2 justify-end mt-3">
            <Button variant="outline" onClick={() => setRenameId(null)}>Отмена</Button>
            <Button onClick={handleRename}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить резюме?</DialogTitle>
            <DialogDescription>Это действие нельзя отменить.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Отмена</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Удалить</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear all dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить все данные?</DialogTitle>
            <DialogDescription>
              Будут удалены все резюме, настройки и изображения. Это действие необратимо.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-3">
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>Отмена</Button>
            <Button variant="destructive" onClick={handleClearAll}>Удалить всё</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ResumeListItem({
  entry, isActive, onSelect, onRename, onDuplicate, onDelete,
}: {
  entry: ResumeListEntry;
  isActive: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
        isActive
          ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-900 shadow-xs'
          : 'bg-white/50 hover:bg-white/90 border-white/60 text-slate-700 shadow-2xs'
      }`}
      onClick={onSelect}
    >
      <FileText className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
      <span className={`flex-1 text-xs truncate ${isActive ? 'font-bold text-indigo-900' : 'font-medium'}`}>
        {entry.name}
      </span>
      <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <ActionBtn onClick={onRename} title="Переименовать"><Pencil className="w-3 h-3" /></ActionBtn>
        <ActionBtn onClick={onDuplicate} title="Дублировать"><Copy className="w-3 h-3" /></ActionBtn>
        <ActionBtn onClick={onDelete} title="Удалить" danger><Trash2 className="w-3 h-3" /></ActionBtn>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, title, danger, children }: {
  onClick: () => void;
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`p-1 rounded-md transition-colors ${
        danger ? 'hover:bg-rose-100 hover:text-rose-600 text-slate-400' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  );
}
