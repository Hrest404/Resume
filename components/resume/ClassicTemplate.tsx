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

const DENSITY_MAP = {
  compact: { padding: '8px', gap: '6px', sectionGap: '12px' },
  standard: { padding: '12px', gap: '10px', sectionGap: '18px' },
  spacious: { padding: '18px', gap: '14px', sectionGap: '26px' },
};

export function ClassicTemplate({ resume, imageUrls }: TemplateProps) {
  const { design } = resume;
  const density = DENSITY_MAP[design.density];
  const font = FONT_MAP[design.font] ?? FONT_MAP.inter;
  const accent = design.accentColor;
  const visibleSections = getVisibleSections(resume);

  const photoUrl = resume.photoId ? imageUrls[resume.photoId] : null;

  const sectionContent = (sectionId: SectionId) => {
    switch (sectionId) {
      case 'about':
        if (!resume.about?.trim()) return null;
        return (
          <section key="about" style={{ marginBottom: density.sectionGap }}>
            <h2 style={{ ...sectionTitleStyle(accent), marginBottom: density.gap }}>
              О себе
            </h2>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#374151', whiteSpace: 'pre-wrap' }}>
              {resume.about}
            </p>
          </section>
        );

      case 'experience': {
        const items = resume.experience.filter((e) => !e.hidden);
        if (!items.length) return null;
        return (
          <section key="experience" style={{ marginBottom: density.sectionGap }}>
            <h2 style={{ ...sectionTitleStyle(accent), marginBottom: density.gap }}>
              {SECTION_LABELS.experience}
            </h2>
            {items.map((exp) => (
              <div key={exp.id} style={{ marginBottom: density.gap }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#111827' }}>{exp.position}</strong>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>{exp.company}{exp.city ? ` • ${exp.city}` : ''}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', flexShrink: 0, marginLeft: '8px' }}>
                    {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                  </div>
                </div>
                {exp.description && (
                  <p style={{ fontSize: '13px', color: '#374151', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{exp.description}</p>
                )}
                {exp.achievements && (
                  <p style={{ fontSize: '13px', color: '#374151', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{exp.achievements}</p>
                )}
                {exp.technologies.length > 0 && (
                  <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {exp.technologies.map((t) => (
                      <span key={t} style={{ fontSize: '11px', padding: '2px 6px', background: '#F3F4F6', borderRadius: '4px', color: '#374151' }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        );
      }

      case 'skills': {
        const items = resume.skills.filter((s) => !s.hidden);
        if (!items.length) return null;
        return (
          <section key="skills" style={{ marginBottom: density.sectionGap }}>
            <h2 style={{ ...sectionTitleStyle(accent), marginBottom: density.gap }}>
              {SECTION_LABELS.skills}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {items.map((skill) => (
                <span key={skill.id} style={{ fontSize: '12px', padding: '3px 10px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '4px', color: '#374151' }}>
                  {skill.name}{skill.level ? ` — ${skill.level}` : ''}
                </span>
              ))}
            </div>
          </section>
        );
      }

      case 'education': {
        const items = resume.education.filter((e) => !e.hidden);
        if (!items.length) return null;
        return (
          <section key="education" style={{ marginBottom: density.sectionGap }}>
            <h2 style={{ ...sectionTitleStyle(accent), marginBottom: density.gap }}>
              {SECTION_LABELS.education}
            </h2>
            {items.map((edu) => (
              <div key={edu.id} style={{ marginBottom: density.gap }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '14px', color: '#111827' }}>{edu.institution}</strong>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </span>
                </div>
                {(edu.specialty || edu.degree) && (
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    {[edu.specialty, edu.degree].filter(Boolean).join(' • ')}
                  </div>
                )}
                {edu.description && (
                  <p style={{ fontSize: '13px', color: '#374151', marginTop: '4px' }}>{edu.description}</p>
                )}
              </div>
            ))}
          </section>
        );
      }

      case 'courses': {
        const items = resume.courses.filter((c) => !c.hidden);
        if (!items.length) return null;
        return (
          <section key="courses" style={{ marginBottom: density.sectionGap }}>
            <h2 style={{ ...sectionTitleStyle(accent), marginBottom: density.gap }}>
              {SECTION_LABELS.courses}
            </h2>
            {items.map((course) => (
              <div key={course.id} style={{ marginBottom: density.gap }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '14px', color: '#111827' }}>{course.name}</strong>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{formatDate(course.date)}</span>
                </div>
                {course.organization && <div style={{ fontSize: '13px', color: '#6B7280' }}>{course.organization}</div>}
                {course.description && <p style={{ fontSize: '13px', color: '#374151', marginTop: '4px' }}>{course.description}</p>}
              </div>
            ))}
          </section>
        );
      }

      case 'languages': {
        const items = resume.languages.filter((l) => !l.hidden);
        if (!items.length) return null;
        return (
          <section key="languages" style={{ marginBottom: density.sectionGap }}>
            <h2 style={{ ...sectionTitleStyle(accent), marginBottom: density.gap }}>
              {SECTION_LABELS.languages}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {items.map((lang) => (
                <span key={lang.id} style={{ fontSize: '13px', color: '#374151' }}>
                  <strong>{lang.language}</strong> — {lang.level}
                </span>
              ))}
            </div>
          </section>
        );
      }

      case 'projects': {
        const items = resume.projects.filter((p) => !p.hidden);
        if (!items.length) return null;
        return (
          <section key="projects" style={{ marginBottom: density.sectionGap }}>
            <h2 style={{ ...sectionTitleStyle(accent), marginBottom: density.gap }}>
              {SECTION_LABELS.projects}
            </h2>
            {items.map((proj) => (
              <div key={proj.id} style={{ marginBottom: density.gap }}>
                <strong style={{ fontSize: '14px', color: '#111827' }}>{proj.name}</strong>
                {proj.shortDescription && (
                  <p style={{ fontSize: '13px', color: '#374151', marginTop: '2px' }}>{proj.shortDescription}</p>
                )}
                {proj.technologies.length > 0 && (
                  <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {proj.technologies.map((t) => (
                      <span key={t} style={{ fontSize: '11px', padding: '2px 6px', background: '#F3F4F6', borderRadius: '4px', color: '#374151' }}>{t}</span>
                    ))}
                  </div>
                )}
                {proj.projectUrl && (
                  <div style={{ fontSize: '12px', color: accent, marginTop: '2px' }}>{getDisplayUrl(proj.projectUrl)}</div>
                )}
              </div>
            ))}
          </section>
        );
      }

      case 'contacts': {
        const { contacts } = resume;
        const hasContacts = contacts.phone || contacts.email || contacts.website || contacts.socialLinks.length > 0;
        if (!hasContacts) return null;
        return (
          <section key="contacts" style={{ marginBottom: density.sectionGap }}>
            <h2 style={{ ...sectionTitleStyle(accent), marginBottom: density.gap }}>
              {SECTION_LABELS.contacts}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {contacts.phone && <span style={{ fontSize: '13px', color: '#374151' }}>📞 {contacts.phone}</span>}
              {contacts.email && <span style={{ fontSize: '13px', color: '#374151' }}>✉ {contacts.email}</span>}
              {contacts.website && <span style={{ fontSize: '13px', color: accent }}>{getDisplayUrl(contacts.website)}</span>}
              {contacts.socialLinks.map((link) => (
                <span key={link.id} style={{ fontSize: '13px', color: accent }}>{link.label || link.platform}: {getDisplayUrl(link.url)}</span>
              ))}
            </div>
          </section>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        fontFamily: font,
        width: '210mm',
        minHeight: '297mm',
        backgroundColor: '#ffffff',
        padding: '16mm 14mm',
        boxSizing: 'border-box',
        color: '#111827',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: density.sectionGap,
        paddingBottom: density.sectionGap,
        borderBottom: `2px solid ${accent}`,
      }}>
        {design.showPhoto && photoUrl && (
          <img
            src={photoUrl}
            alt="Фото"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
            {resume.firstName} {resume.lastName}
          </h1>
          {resume.position && (
            <div style={{ fontSize: '15px', color: accent, marginTop: '4px', fontWeight: 500 }}>{resume.position}</div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
            {resume.city && <span style={{ fontSize: '13px', color: '#6B7280' }}>📍 {resume.city}</span>}
            {resume.contacts.email && <span style={{ fontSize: '13px', color: '#6B7280' }}>✉ {resume.contacts.email}</span>}
            {resume.contacts.phone && <span style={{ fontSize: '13px', color: '#6B7280' }}>📞 {resume.contacts.phone}</span>}
          </div>
        </div>
      </div>

      {/* Sections */}
      {visibleSections.map((sId) => sectionContent(sId))}
    </div>
  );
}

function sectionTitleStyle(accent: string): React.CSSProperties {
  return {
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: accent,
    borderBottom: `1px solid #E5E7EB`,
    paddingBottom: '4px',
  };
}
