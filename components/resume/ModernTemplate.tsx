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

export function ModernTemplate({ resume, imageUrls }: TemplateProps) {
  const { design } = resume;
  const font = FONT_MAP[design.font] ?? FONT_MAP.inter;
  const accent = design.accentColor;
  const visibleSections = getVisibleSections(resume);
  const photoUrl = resume.photoId ? imageUrls[resume.photoId] : null;

  const sectionGap = design.density === 'compact' ? '14px' : design.density === 'spacious' ? '28px' : '20px';
  const itemGap = design.density === 'compact' ? '8px' : design.density === 'spacious' ? '16px' : '12px';

  // Split sections into left sidebar and main
  const sidebarSections: SectionId[] = ['skills', 'languages', 'contacts', 'courses'];
  const mainSections = visibleSections.filter((s) => !sidebarSections.includes(s));
  const sidebarVisible = visibleSections.filter((s) => sidebarSections.includes(s));

  const mainSectionContent = (sectionId: SectionId) => {
    switch (sectionId) {
      case 'about':
        if (!resume.about?.trim()) return null;
        return (
          <div key="about" style={{ marginBottom: sectionGap }}>
            <h2 style={modernSectionTitle(accent)}>О себе</h2>
            <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#374151', whiteSpace: 'pre-wrap' }}>{resume.about}</p>
          </div>
        );

      case 'experience': {
        const items = resume.experience.filter((e) => !e.hidden);
        if (!items.length) return null;
        return (
          <div key="experience" style={{ marginBottom: sectionGap }}>
            <h2 style={modernSectionTitle(accent)}>{SECTION_LABELS.experience}</h2>
            {items.map((exp) => (
              <div key={exp.id} style={{ marginBottom: itemGap, paddingLeft: '12px', borderLeft: `3px solid ${accent}20` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#111827' }}>{exp.position}</strong>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{exp.company}{exp.city ? ` · ${exp.city}` : ''}</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', background: '#F9FAFB', padding: '2px 8px', borderRadius: '20px', flexShrink: 0, marginLeft: '8px' }}>
                    {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                  </span>
                </div>
                {exp.description && <p style={{ fontSize: '13px', color: '#374151', marginTop: '6px', whiteSpace: 'pre-wrap' }}>{exp.description}</p>}
                {exp.technologies.length > 0 && (
                  <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {exp.technologies.map((t) => (
                      <span key={t} style={{ fontSize: '11px', padding: '2px 8px', background: `${accent}15`, color: accent, borderRadius: '4px', fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }

      case 'education': {
        const items = resume.education.filter((e) => !e.hidden);
        if (!items.length) return null;
        return (
          <div key="education" style={{ marginBottom: sectionGap }}>
            <h2 style={modernSectionTitle(accent)}>{SECTION_LABELS.education}</h2>
            {items.map((edu) => (
              <div key={edu.id} style={{ marginBottom: itemGap }}>
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

      case 'projects': {
        const items = resume.projects.filter((p) => !p.hidden);
        if (!items.length) return null;
        return (
          <div key="projects" style={{ marginBottom: sectionGap }}>
            <h2 style={modernSectionTitle(accent)}>{SECTION_LABELS.projects}</h2>
            {items.map((proj) => (
              <div key={proj.id} style={{ marginBottom: itemGap, padding: '10px', background: '#F9FAFB', borderRadius: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#111827' }}>{proj.name}</strong>
                {proj.shortDescription && <p style={{ fontSize: '13px', color: '#374151', marginTop: '4px' }}>{proj.shortDescription}</p>}
                {proj.technologies.length > 0 && (
                  <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {proj.technologies.map((t) => (
                      <span key={t} style={{ fontSize: '11px', padding: '2px 8px', background: `${accent}15`, color: accent, borderRadius: '4px' }}>{t}</span>
                    ))}
                  </div>
                )}
                {proj.projectUrl && <div style={{ fontSize: '12px', color: accent, marginTop: '4px' }}>{getDisplayUrl(proj.projectUrl)}</div>}
              </div>
            ))}
          </div>
        );
      }

      default: return null;
    }
  };

  const sidebarSectionContent = (sectionId: SectionId) => {
    switch (sectionId) {
      case 'skills': {
        const items = resume.skills.filter((s) => !s.hidden);
        if (!items.length) return null;
        return (
          <div key="skills" style={{ marginBottom: sectionGap }}>
            <h3 style={sidebarTitle}>{SECTION_LABELS.skills}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {items.map((skill) => (
                <div key={skill.id} style={{ fontSize: '12px', color: '#E5E7EB', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {skill.name}{skill.level ? <span style={{ color: '#9CA3AF', fontSize: '11px' }}> · {skill.level}</span> : ''}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'languages': {
        const items = resume.languages.filter((l) => !l.hidden);
        if (!items.length) return null;
        return (
          <div key="languages" style={{ marginBottom: sectionGap }}>
            <h3 style={sidebarTitle}>{SECTION_LABELS.languages}</h3>
            {items.map((lang) => (
              <div key={lang.id} style={{ fontSize: '12px', color: '#E5E7EB', marginBottom: '4px' }}>
                <strong>{lang.language}</strong> <span style={{ color: '#9CA3AF' }}>{lang.level}</span>
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
            <h3 style={sidebarTitle}>{SECTION_LABELS.courses}</h3>
            {items.map((course) => (
              <div key={course.id} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#E5E7EB' }}>{course.name}</div>
                {course.organization && <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{course.organization}</div>}
                {course.date && <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{formatDate(course.date)}</div>}
              </div>
            ))}
          </div>
        );
      }

      case 'contacts': {
        const { contacts } = resume;
        return (
          <div key="contacts" style={{ marginBottom: sectionGap }}>
            <h3 style={sidebarTitle}>{SECTION_LABELS.contacts}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {contacts.phone && <span style={{ fontSize: '12px', color: '#E5E7EB' }}>📞 {contacts.phone}</span>}
              {contacts.email && <span style={{ fontSize: '12px', color: '#E5E7EB' }}>✉ {contacts.email}</span>}
              {contacts.website && <span style={{ fontSize: '12px', color: '#93C5FD' }}>{getDisplayUrl(contacts.website)}</span>}
              {contacts.socialLinks.map((l) => (
                <span key={l.id} style={{ fontSize: '12px', color: '#93C5FD' }}>{l.label || l.platform}</span>
              ))}
            </div>
          </div>
        );
      }

      default: return null;
    }
  };

  const sidebarTitle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#93C5FD',
    marginBottom: '8px',
  };

  return (
    <div style={{ fontFamily: font, width: '210mm', minHeight: '297mm', backgroundColor: '#ffffff', display: 'flex', boxSizing: 'border-box' }}>
      {/* Left sidebar */}
      <div style={{ width: '68mm', background: '#1E293B', padding: '16mm 10mm', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Photo */}
        {design.showPhoto && photoUrl && (
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <img src={photoUrl} alt="Фото" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accent}` }} />
          </div>
        )}

        {/* Name on sidebar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#F9FAFB', lineHeight: 1.2 }}>
            {resume.firstName}<br />{resume.lastName}
          </div>
          {resume.position && (
            <div style={{ fontSize: '12px', color: accent, marginTop: '6px', fontWeight: 500 }}>{resume.position}</div>
          )}
          {resume.city && (
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>📍 {resume.city}</div>
          )}
        </div>

        {/* Sidebar sections */}
        {sidebarVisible.map((sId) => sidebarSectionContent(sId))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '16mm 12mm' }}>
        {mainSections.map((sId) => mainSectionContent(sId))}
      </div>
    </div>
  );
}

function modernSectionTitle(accent: string): React.CSSProperties {
  return {
    fontSize: '15px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '12px',
    paddingBottom: '6px',
    borderBottom: `2px solid ${accent}`,
  };
}
