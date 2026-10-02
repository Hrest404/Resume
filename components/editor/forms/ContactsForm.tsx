'use client';

import React from 'react';
import type { Resume, SocialLink } from '@/lib/resume/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { FormSection } from './FormSection';

interface Props {
  resume: Resume;
  updateResume: (updater: (draft: Resume) => Resume | void) => void;
  imageUrls: Record<string, string>;
}

const PLATFORMS: SocialLink['platform'][] = [
  'github', 'telegram', 'linkedin', 'behance', 'dribbble', 'twitter', 'instagram', 'other',
];

const PLATFORM_NAMES: Record<SocialLink['platform'], string> = {
  github: 'GitHub',
  telegram: 'Telegram',
  linkedin: 'LinkedIn',
  behance: 'Behance',
  dribbble: 'Dribbble',
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  other: 'Другое',
};

export function ContactsForm({ resume, updateResume }: Props) {
  const contacts = resume.contacts || { email: '', phone: '', website: '', socialLinks: [] };
  const socialLinks = contacts.socialLinks || [];

  const handleContactField = (field: 'email' | 'phone' | 'website', value: string) => {
    updateResume((draft) => {
      if (!draft.contacts) {
        draft.contacts = { email: '', phone: '', website: '', socialLinks: [] };
      }
      draft.contacts[field] = value;
    });
  };

  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: crypto.randomUUID(),
      platform: 'github',
      url: '',
      label: '',
    };
    updateResume((draft) => {
      if (!draft.contacts) {
        draft.contacts = { email: '', phone: '', website: '', socialLinks: [] };
      }
      draft.contacts.socialLinks.push(newLink);
    });
  };

  const updateSocialLink = (index: number, patch: Partial<SocialLink>) => {
    updateResume((draft) => {
      if (draft.contacts?.socialLinks[index]) {
        Object.assign(draft.contacts.socialLinks[index], patch);
      }
    });
  };

  const removeSocialLink = (index: number) => {
    updateResume((draft) => {
      if (draft.contacts?.socialLinks) {
        draft.contacts.socialLinks.splice(index, 1);
      }
    });
  };

  return (
    <FormSection
      title="Контактная информация"
      description="Способы связи и ссылки на ваши профили в соцсетях и проф. сетях."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@domain.com"
            value={contacts.email}
            onChange={(e) => handleContactField('email', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+7 (999) 123-45-67"
            value={contacts.phone || ''}
            onChange={(e) => handleContactField('phone', e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="website">Личный сайт / Портфолио</Label>
          <Input
            id="website"
            placeholder="https://myportfolio.dev"
            value={contacts.website || ''}
            onChange={(e) => handleContactField('website', e.target.value)}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">Социальные сети и ссылки</h3>
            <p className="text-xs text-muted-foreground">GitHub, Telegram, LinkedIn и др.</p>
          </div>
          <Button onClick={addSocialLink} size="sm" variant="outline" className="gap-1.5">
            <Plus className="w-4 h-4" /> Добавить ссылку
          </Button>
        </div>

        {socialLinks.length === 0 ? (
          <div className="text-center py-4 border border-dashed rounded-lg text-muted-foreground text-xs">
            Ссылки не добавлены.
          </div>
        ) : (
          <div className="space-y-3">
            {socialLinks.map((link, idx) => (
              <div key={link.id} className="p-3 bg-card border border-border rounded-lg flex flex-col sm:flex-row items-center gap-2">
                <div className="w-full sm:w-44">
                  <Label className="text-xs">Платформа</Label>
                  <select
                    value={link.platform}
                    onChange={(e) => updateSocialLink(idx, { platform: e.target.value as SocialLink['platform'] })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p} className="bg-popover text-popover-foreground">
                        {PLATFORM_NAMES[p]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <Label className="text-xs">Ссылка (URL)</Label>
                  <Input
                    placeholder="https://t.me/username или https://github.com/..."
                    value={link.url}
                    onChange={(e) => updateSocialLink(idx, { url: e.target.value })}
                  />
                </div>
                <div className="w-full sm:w-36">
                  <Label className="text-xs">Подпись (опц.)</Label>
                  <Input
                    placeholder="@username"
                    value={link.label || ''}
                    onChange={(e) => updateSocialLink(idx, { label: e.target.value })}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 self-end sm:self-center mt-2 sm:mt-4"
                  onClick={() => removeSocialLink(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormSection>
  );
}
