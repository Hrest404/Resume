'use client';

import React from 'react';
import type { Resume } from '@/lib/resume/schema';
import { getVisibleSections, formatDateRange, formatDate, getDisplayUrl } from '@/lib/resume/selectors';
import { SECTION_LABELS } from '@/lib/resume/defaults';
import type { SectionId } from '@/lib/resume/schema';

interface TemplateProps {
  resume: Resume;
  imageUrls: Record<string, string>;
}

const FONT_MAP: Record<string, string> = {
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  geist: "'Geist', sans-serif",
  'source-sans': "'Source Sans 3', sans-serif",
  merriweather: "'Merriweather', serif",
};

export function MinimalTemplate({ resume, imageUrls }: TemplateProps) {
  const { design } = resume;
  const font = FONT_MAP[design.font] ?? FONT_MAP.inter;
  const accent = design.accentColor;
  const visibleSections = getVisibleSections(resume);
  const photoUrl = resume.photoId ? imageUrls[resume.photoId] : null;

  const densityPad = design.density === 'compact' ? '6px' : design.density === 'spacious' ? '16px' : '10px';
  const sectionGap = design.density === 'compact' ? '16px' : design.density === 'spacious' ? '32px' : '22px';

  const sectionContent = (sectionId: SectionId) => {
    switch (sectionId) {
      case 'about':
        if (!resume.about?.trim()) return null;
        return (
          <div key="about" style={{ marginBottom: sectionGap }}>
            <h2 style={minimalSectionTitle}>О себе</h2>
            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#4B5563', whiteSpace: 'pre-wrap' }}>{resume.about}</p>
          </div>
        );

      case 'experience': {
        const items = resume.experience.filter((e) => !e.hidden);
        if (!items.length) return null;
        return (
          <div key="experience" style={{ marginBottom: sectionGap }}>
            <h2 style={minimalSectionTitle}>{SECTION_LABELS.experience}</h2>
            {items.map((exp) => (
              <div key={exp.id} style={{ marginBottom: densityPad, paddingLeft: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '14px', color: '#111827' }}>{exp.position}</strong>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>{exp.company}{exp.city ? ` · ${exp.city}` : ''}</div>
                {exp.description && <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        );
      }

      case 'skills': {
        const items = resume.skills.filter((s) => !s.hidden);
        if (!items.length) return null;
        return (
          <div key="skills" style={{ marginBottom: sectionGap }}>
            <h2 style={minimalSectionTitle}>{SECTION_LABELS.skills}</h2>
            <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: '1.8' }}>
              {items.map((s) => s.name).join(' · ')}
            </p>
          </div>
        );
      }

      case 'education': {
        const items = resume.education.filter((e) => !e.hidden);
        if (!items.length) return null;
        return (
          <div key="education" style={{ marginBottom: sectionGap }}>
            <h2 style={minimalSectionTitle}>{SECTION_LABELS.education}</h2>
            {items.map((edu) => (
              <div key={edu.id} style={{ marginBottom: densityPad }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '14px', color: '#111827' }}>{edu.institution}</strong>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{formatDateRange(edu.startDate, edu.endDate)}</span>
                </div>
                {(edu.specialty || edu.degree) && <div style={{ fontSize: '12px', color: '#6B7280' }}>{[edu.specialty, edu.degree].filter(Boolean).join(' · ')}</div>}
              </div>
            ))}
          </div>
        );
      }

      case 'courses': {
        const items = resume.courses.filter((c) => !c.hidden);
        if (!items.length) return null;
        return (
          <div key="courses" style={{ marginBottom: sectionGap }}>
            <h2 style={minimalSectionTitle}>{SECTION_LABELS.courses}</h2>
            {items.map((course) => (
              <div key={course.id} style={{ marginBottom: densityPad }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '13px', color: '#111827' }}>{course.name}</strong>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{formatDate(course.date)}</span>
                </div>
                {course.organization && <div style={{ fontSize: '12px', color: '#6B7280' }}>{course.organization}</div>}
              </div>
            ))}
          </div>
        );
      }

      case 'languages': {
        const items = resume.languages.filter((l) => !l.hidden);
        if (!items.length) return null;
        return (
          <div key="languages" style={{ marginBottom: sectionGap }}>
            <h2 style={minimalSectionTitle}>{SECTION_LABELS.languages}</h2>
            <p style={{ fontSize: '13px', color: '#4B5563' }}>
              {items.map((l) => `${l.language} (${l.level})`).join(' · ')}
            </p>
          </div>
        );
      }

      case 'projects': {
        const items = resume.projects.filter((p) => !p.hidden);
        if (!items.length) return null;
        return (
          <div key="projects" style={{ marginBottom: sectionGap }}>
            <h2 style={minimalSectionTitle}>{SECTION_LABELS.projects}</h2>
            {items.map((proj) => (
              <div key={proj.id} style={{ marginBottom: densityPad }}>
                <strong style={{ fontSize: '14px', color: '#111827' }}>{proj.name}</strong>
                {proj.shortDescription && <p style={{ fontSize: '13px', color: '#4B5563', marginTop: '2px' }}>{proj.shortDescription}</p>}
                {proj.projectUrl && <div style={{ fontSize: '12px', color: accent }}>{getDisplayUrl(proj.projectUrl)}</div>}
              </div>
            ))}
          </div>
        );
      }

      case 'contacts': {
        const { contacts } = resume;
        const items = [
          contacts.phone && `📞 ${contacts.phone}`,
          contacts.email && `✉ ${contacts.email}`,
          contacts.website && getDisplayUrl(contacts.website),
          ...contacts.socialLinks.map((l) => `${l.label || l.platform}: ${getDisplayUrl(l.url)}`),
        ].filter(Boolean) as string[];
        if (!items.length) return null;
        return (
          <div key="contacts" style={{ marginBottom: sectionGap }}>
            <h2 style={minimalSectionTitle}>{SECTION_LABELS.contacts}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
              {items.map((item, i) => (
                <span key={i} style={{ fontSize: '13px', color: '#4B5563' }}>{item}</span>
              ))}
            </div>
          </div>
        );
      }

      default: return null;
    }
  };

  const minimalSectionTitle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#9CA3AF',
    marginBottom: '10px',
  };

  return (
    <div style={{
      fontFamily: font,
      width: '210mm',
      minHeight: '297mm',
      backgroundColor: '#ffffff',
      padding: '18mm 16mm',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: sectionGap }}>
        {design.showPhoto && photoUrl && (
          <img src={photoUrl} alt="Фото" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        )}
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 300, letterSpacing: '-0.02em', color: '#111827', margin: 0 }}>
            {resume.firstName} <span style={{ fontWeight: 600 }}>{resume.lastName}</span>
          </h1>
          {resume.position && <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>{resume.position}</div>}
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
            {resume.city && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{resume.city}</span>}
            {resume.contacts.email && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{resume.contacts.email}</span>}
            {resume.contacts.phone && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{resume.contacts.phone}</span>}
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid #E5E7EB`, marginBottom: sectionGap }} />

      {visibleSections.map((sId) => sectionContent(sId))}
    </div>
  );
}
