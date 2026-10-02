'use client';

import React from 'react';
import type { Resume } from '@/lib/resume/schema';
import { getVisibleSections, formatDateRange, getDisplayUrl } from '@/lib/resume/selectors';
import { SECTION_LABELS } from '@/lib/resume/defaults';
import { Mail, Phone, Globe, Github, Linkedin, Send, ExternalLink, Calendar, MapPin } from 'lucide-react';

interface Props {
  resume: Resume;
}

export function PortfolioPreview({ resume }: Props) {
  const visibleSections = getVisibleSections(resume);
  const fullName = `${resume.firstName} ${resume.lastName}`.trim();
  const accent = resume.design.accentColor || '#2563eb';

  return (
    <div className="bg-slate-50 text-slate-800 rounded-xl overflow-hidden border border-slate-200 text-sm shadow-inner">
      {/* Header Banner */}
      <div
        className="text-white p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`,
          borderBottom: `4px solid ${accent}`,
        }}
      >
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{fullName || 'Ваше Имя'}</h1>
          {resume.position && (
            <p className="text-lg text-slate-300 font-medium mt-1">{resume.position}</p>
          )}
          {resume.city && (
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {resume.city}
            </p>
          )}

          {/* Contacts list */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-700/60 text-xs text-slate-300">
            {resume.contacts?.email && (
              <a href={`mailto:${resume.contacts.email}`} className="flex items-center gap-1.5 hover:text-white">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {resume.contacts.email}
              </a>
            )}
            {resume.contacts?.phone && (
              <a href={`tel:${resume.contacts.phone}`} className="flex items-center gap-1.5 hover:text-white">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {resume.contacts.phone}
              </a>
            )}
            {resume.contacts?.website && (
              <a href={resume.contacts.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> {getDisplayUrl(resume.contacts.website)}
              </a>
            )}
            {resume.contacts?.socialLinks?.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white underline">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" /> {s.label || s.platform}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 space-y-6">
        {visibleSections.map((sectionId) => {
          if (sectionId === 'about' && resume.about) {
            return (
              <section key="about" className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 border-b pb-1 flex items-center gap-2" style={{ borderColor: accent }}>
                  {SECTION_LABELS.about}
                </h2>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">{resume.about}</p>
              </section>
            );
          }

          if (sectionId === 'experience' && resume.experience?.length) {
            return (
              <section key="experience" className="space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b pb-1" style={{ borderColor: accent }}>
                  {SECTION_LABELS.experience}
                </h2>
                <div className="space-y-4">
                  {resume.experience.map((exp) => (
                    <div key={exp.id} className="p-4 bg-white rounded-lg border border-slate-200/80 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="font-semibold text-slate-900">{exp.position}</div>
                        <div className="text-xs text-slate-500">
                          {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                        </div>
                      </div>
                      <div className="text-xs font-medium text-slate-600 mt-0.5">{exp.company} {exp.city ? `• ${exp.city}` : ''}</div>
                      {exp.description && <p className="text-slate-600 text-xs mt-2">{exp.description}</p>}
                      {exp.achievements && (
                        <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="font-medium text-slate-800">Достижения: </span>
                          {exp.achievements}
                        </div>
                      )}
                      {exp.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {exp.technologies.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionId === 'projects' && resume.projects?.length) {
            return (
              <section key="projects" className="space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b pb-1" style={{ borderColor: accent }}>
                  {SECTION_LABELS.projects}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resume.projects.map((proj) => (
                    <div key={proj.id} className="p-4 bg-white rounded-lg border border-slate-200/80 shadow-xs flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">{proj.name}</h3>
                        {proj.shortDescription && (
                          <p className="text-xs text-slate-600 mt-1">{proj.shortDescription}</p>
                        )}
                        {proj.description && (
                          <p className="text-xs text-slate-500 mt-2">{proj.description}</p>
                        )}
                        {proj.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {proj.technologies.map((t, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                        {proj.projectUrl && (
                          <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 font-medium">
                            <ExternalLink className="w-3 h-3" /> Демо
                          </a>
                        )}
                        {proj.repoUrl && (
                          <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900 flex items-center gap-1">
                            <Github className="w-3 h-3" /> Репозиторий
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionId === 'skills' && resume.skills?.length) {
            return (
              <section key="skills" className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 border-b pb-1" style={{ borderColor: accent }}>
                  {SECTION_LABELS.skills}
                </h2>
                <div className="flex flex-wrap gap-2 pt-1">
                  {resume.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-800 shadow-2xs"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionId === 'education' && resume.education?.length) {
            return (
              <section key="education" className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 border-b pb-1" style={{ borderColor: accent }}>
                  {SECTION_LABELS.education}
                </h2>
                <div className="space-y-3">
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="p-3 bg-white rounded-lg border border-slate-200/80">
                      <div className="font-semibold text-slate-900">{edu.institution}</div>
                      <div className="text-xs text-slate-600">{edu.specialty} {edu.degree ? `(${edu.degree})` : ''}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{edu.startDate} – {edu.endDate}</div>
                      {edu.description && <p className="text-xs text-slate-600 mt-1">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionId === 'courses' && resume.courses?.length) {
            return (
              <section key="courses" className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 border-b pb-1" style={{ borderColor: accent }}>
                  {SECTION_LABELS.courses}
                </h2>
                <div className="space-y-2">
                  {resume.courses.map((course) => (
                    <div key={course.id} className="p-3 bg-white rounded-lg border border-slate-200/80">
                      <div className="font-semibold text-slate-900">{course.name}</div>
                      <div className="text-xs text-slate-600">{course.organization} {course.date ? `(${course.date})` : ''}</div>
                      {course.description && <p className="text-xs text-slate-600 mt-1">{course.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionId === 'languages' && resume.languages?.length) {
            return (
              <section key="languages" className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 border-b pb-1" style={{ borderColor: accent }}>
                  {SECTION_LABELS.languages}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {resume.languages.map((lang) => (
                    <span key={lang.id} className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700">
                      {lang.language}: <span className="text-primary font-semibold">{lang.level}</span>
                    </span>
                  ))}
                </div>
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
