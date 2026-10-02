import JSZip from 'jszip';
import type { Resume } from '@/lib/resume/schema';
import { getVisibleSections, formatDateRange, formatDate, getDisplayUrl } from '@/lib/resume/selectors';
import { SECTION_LABELS } from '@/lib/resume/defaults';
import type { SectionId } from '@/lib/resume/schema';

interface ZipExportOptions {
  resume: Resume;
  imageBlobs: Record<string, { blob: Blob; ext: string }>;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function generateCSS(resume: Resume): string {
  const { design } = resume;
  const accent = design.accentColor;
  const fontMap: Record<string, string> = {
    inter: "'Inter', system-ui, sans-serif",
    roboto: "'Roboto', system-ui, sans-serif",
    geist: "system-ui, sans-serif",
    'source-sans': "'Source Sans 3', system-ui, sans-serif",
    merriweather: "'Merriweather', Georgia, serif",
  };
  const font = fontMap[design.font] ?? fontMap.inter;
  const padMap = { compact: '12px 16px', standard: '16px 20px', spacious: '24px 28px' };
  const gapMap = { compact: '16px', standard: '24px', spacious: '36px' };

  return `
/* Resume Portfolio - Auto-generated */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Source+Sans+3:wght@300;400;600;700&family=Merriweather:wght@300;400;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --accent: ${accent};
  --accent-rgb: ${hexToRgb(accent)};
  --font: ${font};
  --section-gap: ${gapMap[design.density]};
  --item-pad: ${padMap[design.density]};
}

body {
  font-family: var(--font);
  background: #F8FAFC;
  color: #1E293B;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.container { max-width: 860px; margin: 0 auto; padding: 0 20px; }

/* Hero */
.hero {
  background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
  color: #fff;
  padding: 60px 0 48px;
}
.hero-inner { display: flex; align-items: center; gap: 36px; max-width: 860px; margin: 0 auto; padding: 0 20px; }
.hero-photo { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--accent); flex-shrink: 0; }
.hero-name { font-size: 36px; font-weight: 700; letter-spacing: -0.02em; }
.hero-position { font-size: 18px; color: var(--accent); margin-top: 6px; font-weight: 500; }
.hero-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; }
.hero-meta span { font-size: 14px; color: #94A3B8; }
.hero-contacts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.hero-contacts a { font-size: 13px; color: var(--accent); text-decoration: none; padding: 4px 12px; border: 1px solid rgba(var(--accent-rgb), 0.4); border-radius: 20px; transition: all 0.2s; }
.hero-contacts a:hover { background: rgba(var(--accent-rgb), 0.1); }

/* Nav */
nav {
  background: #fff;
  border-bottom: 1px solid #E2E8F0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.nav-inner { display: flex; gap: 0; max-width: 860px; margin: 0 auto; padding: 0 20px; overflow-x: auto; }
.nav-inner a { padding: 14px 16px; font-size: 13px; font-weight: 500; color: #64748B; text-decoration: none; border-bottom: 2px solid transparent; white-space: nowrap; transition: all 0.2s; }
.nav-inner a:hover, .nav-inner a.active { color: var(--accent); border-bottom-color: var(--accent); }

/* Main */
main { padding: 40px 0; }

/* Section */
.section { margin-bottom: var(--section-gap); }
.section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #94A3B8;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--accent);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* About */
.about-text { font-size: 15px; line-height: 1.8; color: #334155; white-space: pre-wrap; }

/* Experience */
.exp-item { padding: var(--item-pad); background: #fff; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 12px; transition: box-shadow 0.2s; }
.exp-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
.exp-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 6px; }
.exp-title { font-size: 15px; font-weight: 600; color: #1E293B; }
.exp-company { font-size: 13px; color: #64748B; }
.exp-date { font-size: 12px; color: #94A3B8; background: #F1F5F9; padding: 3px 10px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
.exp-desc { font-size: 13px; color: #475569; line-height: 1.7; margin-top: 8px; white-space: pre-wrap; }
.tech-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.tech-tag { font-size: 11px; padding: 3px 10px; background: rgba(var(--accent-rgb), 0.08); color: var(--accent); border-radius: 6px; font-weight: 500; }

/* Skills */
.skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.skill-tag { font-size: 13px; padding: 6px 14px; background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; color: #334155; transition: all 0.2s; }
.skill-tag:hover { border-color: var(--accent); color: var(--accent); }

/* Projects */
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.project-card { background: #fff; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; transition: box-shadow 0.2s; }
.project-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.project-img { width: 100%; height: 160px; object-fit: cover; }
.project-body { padding: 16px; }
.project-name { font-size: 15px; font-weight: 600; color: #1E293B; margin-bottom: 6px; }
.project-desc { font-size: 13px; color: #64748B; margin-bottom: 12px; }
.project-links { display: flex; gap: 8px; flex-wrap: wrap; }
.project-link { font-size: 12px; color: var(--accent); text-decoration: none; padding: 4px 10px; border: 1px solid rgba(var(--accent-rgb), 0.3); border-radius: 6px; transition: all 0.2s; }
.project-link:hover { background: rgba(var(--accent-rgb), 0.08); }

/* Education/Courses */
.edu-item { padding: var(--item-pad); background: #fff; border-radius: 10px; border: 1px solid #E2E8F0; margin-bottom: 10px; }
.edu-header { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 4px; }
.edu-name { font-size: 14px; font-weight: 600; color: #1E293B; }
.edu-date { font-size: 12px; color: #94A3B8; }
.edu-sub { font-size: 13px; color: #64748B; }

/* Languages */
.lang-list { display: flex; flex-wrap: wrap; gap: 12px; }
.lang-item { padding: 8px 16px; background: #fff; border: 1px solid #E2E8F0; border-radius: 10px; }
.lang-name { font-size: 14px; font-weight: 600; color: #1E293B; }
.lang-level { font-size: 12px; color: var(--accent); }

/* Footer */
footer {
  text-align: center;
  padding: 32px 20px;
  color: #94A3B8;
  font-size: 12px;
  border-top: 1px solid #E2E8F0;
}

/* Responsive */
@media (max-width: 640px) {
  .hero-inner { flex-direction: column; text-align: center; gap: 20px; }
  .hero-name { font-size: 26px; }
  .hero-meta { justify-content: center; }
  .hero-contacts { justify-content: center; }
  .exp-header { flex-direction: column; gap: 6px; }
  .projects-grid { grid-template-columns: 1fr; }
}
`.trim();
}

function generateHTML(resume: Resume, imageFiles: Record<string, string>): string {
  const { design } = resume;
  const visibleSections = getVisibleSections(resume);
  const photoPath = resume.photoId && imageFiles[resume.photoId] ? imageFiles[resume.photoId] : null;

  const navLinks = visibleSections.map((sId) =>
    `<a href="#${sId}">${SECTION_LABELS[sId]}</a>`
  ).join('\n        ');

  const sectionHTML = (sectionId: SectionId): string => {
    switch (sectionId) {
      case 'about': {
        if (!resume.about?.trim()) return '';
        return `
  <section class="section" id="about">
    <h2 class="section-title">О себе</h2>
    <p class="about-text">${escHtml(resume.about)}</p>
  </section>`;
      }

      case 'experience': {
        const items = resume.experience.filter((e) => !e.hidden);
        if (!items.length) return '';
        return `
  <section class="section" id="experience">
    <h2 class="section-title">${SECTION_LABELS.experience}</h2>
    ${items.map((exp) => `
    <div class="exp-item">
      <div class="exp-header">
        <div>
          <div class="exp-title">${escHtml(exp.position)}</div>
          <div class="exp-company">${escHtml(exp.company)}${exp.city ? ` · ${escHtml(exp.city)}` : ''}</div>
        </div>
        <span class="exp-date">${escHtml(formatDateRange(exp.startDate, exp.endDate, exp.isCurrent))}</span>
      </div>
      ${exp.description ? `<div class="exp-desc">${escHtml(exp.description)}</div>` : ''}
      ${exp.technologies.length ? `<div class="tech-tags">${exp.technologies.map((t) => `<span class="tech-tag">${escHtml(t)}</span>`).join('')}</div>` : ''}
    </div>`).join('')}
  </section>`;
      }

      case 'skills': {
        const items = resume.skills.filter((s) => !s.hidden);
        if (!items.length) return '';
        return `
  <section class="section" id="skills">
    <h2 class="section-title">${SECTION_LABELS.skills}</h2>
    <div class="skills-grid">
      ${items.map((s) => `<span class="skill-tag">${escHtml(s.name)}${s.level ? ` — ${escHtml(s.level)}` : ''}</span>`).join('\n      ')}
    </div>
  </section>`;
      }

      case 'projects': {
        const items = resume.projects.filter((p) => !p.hidden);
        if (!items.length) return '';
        return `
  <section class="section" id="projects">
    <h2 class="section-title">${SECTION_LABELS.projects}</h2>
    <div class="projects-grid">
      ${items.map((proj) => {
        const imgPath = proj.imageId && imageFiles[proj.imageId] ? imageFiles[proj.imageId] : null;
        return `
      <div class="project-card">
        ${imgPath ? `<img class="project-img" src="${imgPath}" alt="${escHtml(proj.name)}" loading="lazy">` : ''}
        <div class="project-body">
          <div class="project-name">${escHtml(proj.name)}</div>
          ${proj.shortDescription ? `<div class="project-desc">${escHtml(proj.shortDescription)}</div>` : ''}
          ${proj.technologies.length ? `<div class="tech-tags">${proj.technologies.map((t) => `<span class="tech-tag">${escHtml(t)}</span>`).join('')}</div>` : ''}
          <div class="project-links" style="margin-top: 12px;">
            ${proj.projectUrl ? `<a class="project-link" href="${escHtml(proj.projectUrl)}" target="_blank" rel="noopener">Проект →</a>` : ''}
            ${proj.repoUrl ? `<a class="project-link" href="${escHtml(proj.repoUrl)}" target="_blank" rel="noopener">Репозиторий</a>` : ''}
            ${proj.additionalLinks.map((l) => `<a class="project-link" href="${escHtml(l.url)}" target="_blank" rel="noopener">${escHtml(l.label)}</a>`).join('')}
          </div>
        </div>
      </div>`;
      }).join('')}
    </div>
  </section>`;
      }

      case 'education': {
        const items = resume.education.filter((e) => !e.hidden);
        if (!items.length) return '';
        return `
  <section class="section" id="education">
    <h2 class="section-title">${SECTION_LABELS.education}</h2>
    ${items.map((edu) => `
    <div class="edu-item">
      <div class="edu-header">
        <div class="edu-name">${escHtml(edu.institution)}</div>
        <div class="edu-date">${escHtml(formatDateRange(edu.startDate, edu.endDate))}</div>
      </div>
      ${(edu.specialty || edu.degree) ? `<div class="edu-sub">${escHtml([edu.specialty, edu.degree].filter(Boolean).join(' · '))}</div>` : ''}
      ${edu.description ? `<p class="exp-desc">${escHtml(edu.description)}</p>` : ''}
    </div>`).join('')}
  </section>`;
      }

      case 'courses': {
        const items = resume.courses.filter((c) => !c.hidden);
        if (!items.length) return '';
        return `
  <section class="section" id="courses">
    <h2 class="section-title">${SECTION_LABELS.courses}</h2>
    ${items.map((course) => `
    <div class="edu-item">
      <div class="edu-header">
        <div class="edu-name">${escHtml(course.name)}</div>
        <div class="edu-date">${escHtml(formatDate(course.date))}</div>
      </div>
      ${course.organization ? `<div class="edu-sub">${escHtml(course.organization)}</div>` : ''}
    </div>`).join('')}
  </section>`;
      }

      case 'languages': {
        const items = resume.languages.filter((l) => !l.hidden);
        if (!items.length) return '';
        return `
  <section class="section" id="languages">
    <h2 class="section-title">${SECTION_LABELS.languages}</h2>
    <div class="lang-list">
      ${items.map((lang) => `
      <div class="lang-item">
        <div class="lang-name">${escHtml(lang.language)}</div>
        <div class="lang-level">${lang.level}</div>
      </div>`).join('')}
    </div>
  </section>`;
      }

      case 'contacts': {
        return ''; // contacts shown in hero
      }

      default: return '';
    }
  };

  const contactLinks = [
    resume.contacts.phone ? `<a href="tel:${resume.contacts.phone}">${resume.contacts.phone}</a>` : '',
    resume.contacts.email ? `<a href="mailto:${resume.contacts.email}">${resume.contacts.email}</a>` : '',
    resume.contacts.website ? `<a href="${resume.contacts.website}" target="_blank" rel="noopener">${getDisplayUrl(resume.contacts.website)}</a>` : '',
    ...resume.contacts.socialLinks.map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.label || l.platform}</a>`),
  ].filter(Boolean).join('\n        ');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(resume.firstName)} ${escHtml(resume.lastName)}${resume.position ? ` — ${escHtml(resume.position)}` : ''}</title>
  <meta name="description" content="${escHtml(resume.about?.slice(0, 160) || `Portfolio of ${resume.firstName} ${resume.lastName}`)}">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Hero -->
  <header class="hero">
    <div class="hero-inner">
      ${photoPath && design.showPhoto ? `<img class="hero-photo" src="${photoPath}" alt="${escHtml(resume.firstName)} ${escHtml(resume.lastName)}">` : ''}
      <div>
        <h1 class="hero-name">${escHtml(resume.firstName)} ${escHtml(resume.lastName)}</h1>
        ${resume.position ? `<div class="hero-position">${escHtml(resume.position)}</div>` : ''}
        <div class="hero-meta">
          ${resume.city ? `<span>📍 ${escHtml(resume.city)}</span>` : ''}
          ${resume.birthDate ? `<span>🎂 ${escHtml(formatDate(resume.birthDate))}</span>` : ''}
        </div>
        <div class="hero-contacts">
          ${contactLinks}
        </div>
      </div>
    </div>
  </header>

  <!-- Navigation -->
  <nav>
    <div class="nav-inner">
      ${navLinks}
    </div>
  </nav>

  <!-- Content -->
  <main>
    <div class="container">
      ${visibleSections.map((sId) => sectionHTML(sId)).join('')}
    </div>
  </main>

  <footer>
    <p>Сайт создан с помощью Resume Builder</p>
    <p style="margin-top: 4px; font-size: 11px;">Разместите этот сайт на GitHub Pages, Netlify или любом статическом хостинге</p>
  </footer>
</body>
</html>`.trim();
}

function escHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function generatePortfolioZip({ resume, imageBlobs }: ZipExportOptions): Promise<Blob> {
  const zip = new JSZip();
  const assetsFolder = zip.folder('assets')!;

  // Process images
  const imageFiles: Record<string, string> = {};

  if (resume.photoId && imageBlobs[resume.photoId]) {
    const { blob, ext } = imageBlobs[resume.photoId];
    const filename = `profile.${ext}`;
    assetsFolder.file(filename, blob);
    imageFiles[resume.photoId] = `assets/${filename}`;
  }

  for (const project of resume.projects) {
    if (project.imageId && imageBlobs[project.imageId]) {
      const { blob, ext } = imageBlobs[project.imageId];
      const filename = `project-${project.id}.${ext}`;
      assetsFolder.file(filename, blob);
      imageFiles[project.imageId] = `assets/${filename}`;
    }
  }

  const css = generateCSS(resume);
  const html = generateHTML(resume, imageFiles);

  zip.file('index.html', html);
  zip.file('styles.css', css);

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
