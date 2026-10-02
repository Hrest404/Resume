import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';
import type { Resume } from '@/lib/resume/schema';
import { getVisibleSections, formatDateRange, formatDate, getDisplayUrl } from '@/lib/resume/selectors';
import { SECTION_LABELS } from '@/lib/resume/defaults';
import type { SectionId } from '@/lib/resume/schema';
import React from 'react';

interface PDFProps {
  resume: Resume;
  imageUrls: Record<string, string>;
}

function createStyles(accent: string, density: string) {
  const pad = density === 'compact' ? 4 : density === 'spacious' ? 10 : 6;
  const sGap = density === 'compact' ? 10 : density === 'spacious' ? 20 : 14;

  return StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      fontSize: 10,
      color: '#374151',
      padding: '15mm',
      backgroundColor: '#ffffff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 14,
      marginBottom: sGap,
      paddingBottom: sGap,
      borderBottom: `2px solid ${accent}`,
    },
    photo: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    headerInfo: { flex: 1 },
    name: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#111827' },
    position: { fontSize: 12, color: accent, marginTop: 3, fontFamily: 'Helvetica-Bold' },
    headerMeta: { flexDirection: 'row', gap: 12, marginTop: 4, flexWrap: 'wrap' },
    metaText: { fontSize: 9, color: '#6B7280' },
    section: { marginBottom: sGap },
    sectionTitle: {
      fontSize: 9,
      fontFamily: 'Helvetica-Bold',
      color: accent,
      textTransform: 'uppercase',
      letterSpacing: 1,
      borderBottom: '1px solid #E5E7EB',
      paddingBottom: 3,
      marginBottom: pad,
    },
    expItem: { marginBottom: pad },
    expHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    expTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#111827' },
    expCompany: { fontSize: 9, color: '#6B7280' },
    expDate: { fontSize: 9, color: '#9CA3AF' },
    bodyText: { fontSize: 10, color: '#374151', lineHeight: 1.5, marginTop: 3 },
    techBadge: {
      fontSize: 8,
      padding: '2px 5px',
      backgroundColor: '#F3F4F6',
      borderRadius: 3,
      color: '#374151',
      marginRight: 4,
      marginTop: 4,
    },
    techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, marginTop: 4 },
    skillBadge: {
      fontSize: 9,
      padding: '2px 8px',
      backgroundColor: '#F3F4F6',
      border: '1px solid #E5E7EB',
      borderRadius: 4,
      color: '#374151',
      marginRight: 4,
      marginBottom: 4,
    },
    skillRow: { flexDirection: 'row', flexWrap: 'wrap' },
    langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    contactRow: { flexDirection: 'column', gap: 3 },
    contactText: { fontSize: 9, color: '#374151' },
  });
}

function SectionWrapper({ title, styles, children }: {
  title: string;
  styles: ReturnType<typeof createStyles>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function ResumePDF({ resume, imageUrls }: PDFProps) {
  const { design } = resume;
  const styles = createStyles(design.accentColor, design.density);
  const visibleSections = getVisibleSections(resume);
  const photoUrl = resume.photoId ? imageUrls[resume.photoId] : null;

  const renderSection = (sectionId: SectionId) => {
    switch (sectionId) {
      case 'about': {
        if (!resume.about?.trim()) return null;
        return (
          <SectionWrapper key="about" title="О себе" styles={styles}>
            <Text style={styles.bodyText}>{resume.about}</Text>
          </SectionWrapper>
        );
      }

      case 'experience': {
        const items = resume.experience.filter((e) => !e.hidden);
        if (!items.length) return null;
        return (
          <SectionWrapper key="experience" title={SECTION_LABELS.experience} styles={styles}>
            {items.map((exp) => (
              <View key={exp.id} style={styles.expItem}>
                <View style={styles.expHeader}>
                  <View>
                    <Text style={styles.expTitle}>{exp.position}</Text>
                    <Text style={styles.expCompany}>{exp.company}{exp.city ? ` · ${exp.city}` : ''}</Text>
                  </View>
                  <Text style={styles.expDate}>{formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}</Text>
                </View>
                {exp.description ? <Text style={styles.bodyText}>{exp.description}</Text> : null}
                {exp.technologies.length > 0 && (
                  <View style={styles.techRow}>
                    {exp.technologies.map((t) => <Text key={t} style={styles.techBadge}>{t}</Text>)}
                  </View>
                )}
              </View>
            ))}
          </SectionWrapper>
        );
      }

      case 'skills': {
        const items = resume.skills.filter((s) => !s.hidden);
        if (!items.length) return null;
        return (
          <SectionWrapper key="skills" title={SECTION_LABELS.skills} styles={styles}>
            <View style={styles.skillRow}>
              {items.map((skill) => (
                <Text key={skill.id} style={styles.skillBadge}>
                  {skill.name}{skill.level ? ` — ${skill.level}` : ''}
                </Text>
              ))}
            </View>
          </SectionWrapper>
        );
      }

      case 'education': {
        const items = resume.education.filter((e) => !e.hidden);
        if (!items.length) return null;
        return (
          <SectionWrapper key="education" title={SECTION_LABELS.education} styles={styles}>
            {items.map((edu) => (
              <View key={edu.id} style={styles.expItem}>
                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>{edu.institution}</Text>
                  <Text style={styles.expDate}>{formatDateRange(edu.startDate, edu.endDate)}</Text>
                </View>
                {(edu.specialty || edu.degree) && (
                  <Text style={styles.expCompany}>{[edu.specialty, edu.degree].filter(Boolean).join(' · ')}</Text>
                )}
                {edu.description ? <Text style={styles.bodyText}>{edu.description}</Text> : null}
              </View>
            ))}
          </SectionWrapper>
        );
      }

      case 'courses': {
        const items = resume.courses.filter((c) => !c.hidden);
        if (!items.length) return null;
        return (
          <SectionWrapper key="courses" title={SECTION_LABELS.courses} styles={styles}>
            {items.map((course) => (
              <View key={course.id} style={styles.expItem}>
                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>{course.name}</Text>
                  <Text style={styles.expDate}>{formatDate(course.date)}</Text>
                </View>
                {course.organization ? <Text style={styles.expCompany}>{course.organization}</Text> : null}
              </View>
            ))}
          </SectionWrapper>
        );
      }

      case 'languages': {
        const items = resume.languages.filter((l) => !l.hidden);
        if (!items.length) return null;
        return (
          <SectionWrapper key="languages" title={SECTION_LABELS.languages} styles={styles}>
            <View style={styles.langRow}>
              {items.map((lang) => (
                <Text key={lang.id} style={{ fontSize: 10, color: '#374151' }}>
                  {lang.language} ({lang.level})
                </Text>
              ))}
            </View>
          </SectionWrapper>
        );
      }

      case 'projects': {
        const items = resume.projects.filter((p) => !p.hidden);
        if (!items.length) return null;
        return (
          <SectionWrapper key="projects" title={SECTION_LABELS.projects} styles={styles}>
            {items.map((proj) => (
              <View key={proj.id} style={styles.expItem}>
                <Text style={styles.expTitle}>{proj.name}</Text>
                {proj.shortDescription ? <Text style={styles.bodyText}>{proj.shortDescription}</Text> : null}
                {proj.technologies.length > 0 && (
                  <View style={styles.techRow}>
                    {proj.technologies.map((t) => <Text key={t} style={styles.techBadge}>{t}</Text>)}
                  </View>
                )}
                {proj.projectUrl ? <Text style={{ fontSize: 9, color: design.accentColor, marginTop: 2 }}>{getDisplayUrl(proj.projectUrl)}</Text> : null}
              </View>
            ))}
          </SectionWrapper>
        );
      }

      case 'contacts': {
        const { contacts } = resume;
        const lines = [
          contacts.phone,
          contacts.email,
          contacts.website ? getDisplayUrl(contacts.website) : null,
          ...contacts.socialLinks.map((l) => `${l.label || l.platform}: ${getDisplayUrl(l.url)}`),
        ].filter(Boolean) as string[];
        if (!lines.length) return null;
        return (
          <SectionWrapper key="contacts" title={SECTION_LABELS.contacts} styles={styles}>
            <View style={styles.contactRow}>
              {lines.map((line, i) => <Text key={i} style={styles.contactText}>{line}</Text>)}
            </View>
          </SectionWrapper>
        );
      }

      default: return null;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {design.showPhoto && photoUrl && (
            <Image src={photoUrl} style={styles.photo} />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{resume.firstName} {resume.lastName}</Text>
            {resume.position ? <Text style={styles.position}>{resume.position}</Text> : null}
            <View style={styles.headerMeta}>
              {resume.city ? <Text style={styles.metaText}>📍 {resume.city}</Text> : null}
              {resume.contacts.email ? <Text style={styles.metaText}>{resume.contacts.email}</Text> : null}
              {resume.contacts.phone ? <Text style={styles.metaText}>{resume.contacts.phone}</Text> : null}
            </View>
          </View>
        </View>

        {visibleSections.map((sId) => renderSection(sId))}
      </Page>
    </Document>
  );
}
