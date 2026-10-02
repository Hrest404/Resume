import { z } from 'zod';

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

export const socialLinkSchema = z.object({
  id: z.string(),
  platform: z.enum([
    'github', 'linkedin', 'telegram', 'behance', 'dribbble',
    'twitter', 'instagram', 'other',
  ]),
  url: z.string().url().or(z.literal('')),
  label: z.string().optional(),
});

export const contactsSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().or(z.literal('')),
  website: z.string().url().or(z.literal('')).optional(),
  socialLinks: z.array(socialLinkSchema),
});

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  city: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  description: z.string().optional(),
  achievements: z.string().optional(),
  technologies: z.array(z.string()),
  hidden: z.boolean(),
  order: z.number(),
});

export const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.string().optional(),
  hidden: z.boolean(),
  order: z.number(),
});

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  specialty: z.string().optional(),
  degree: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  hidden: z.boolean(),
  order: z.number(),
});

export const courseSchema = z.object({
  id: z.string(),
  name: z.string(),
  organization: z.string().optional(),
  date: z.string().optional(),
  url: z.string().url().or(z.literal('')).optional(),
  description: z.string().optional(),
  hidden: z.boolean(),
  order: z.number(),
});

export const languageSchema = z.object({
  id: z.string(),
  language: z.string(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native']),
  hidden: z.boolean(),
  order: z.number(),
});

export const projectLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string().url().or(z.literal('')),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageId: z.string().nullable(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  technologies: z.array(z.string()),
  projectUrl: z.string().url().or(z.literal('')).optional(),
  repoUrl: z.string().url().or(z.literal('')).optional(),
  additionalLinks: z.array(projectLinkSchema),
  hidden: z.boolean(),
  order: z.number(),
});

export const sectionIdSchema = z.enum([
  'about', 'experience', 'skills', 'education', 'courses', 'languages', 'projects', 'contacts',
]);

export type SectionId = z.infer<typeof sectionIdSchema>;

export const designSchema = z.object({
  template: z.enum(['classic', 'minimal', 'modern']),
  accentColor: z.string(),
  font: z.enum(['inter', 'roboto', 'geist', 'source-sans', 'merriweather']),
  density: z.enum(['compact', 'standard', 'spacious']),
  showPhoto: z.boolean(),
});

export const resumeSchema = z.object({
  id: z.string(),
  schemaVersion: z.literal(1),
  name: z.string(),
  updatedAt: z.string(),
  createdAt: z.string(),

  // Personal info
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  position: z.string().optional(),
  city: z.string().optional(),
  birthDate: z.string().optional(),
  photoId: z.string().nullable(),

  // Content sections
  about: z.string().optional(),
  contacts: contactsSchema,
  experience: z.array(experienceSchema),
  skills: z.array(skillSchema),
  education: z.array(educationSchema),
  courses: z.array(courseSchema),
  languages: z.array(languageSchema),
  projects: z.array(projectSchema),

  // Layout
  sectionOrder: z.array(sectionIdSchema),
  hiddenSections: z.array(sectionIdSchema),

  // Design
  design: designSchema,
});

export type Resume = z.infer<typeof resumeSchema>;
export type ResumeDesign = z.infer<typeof designSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Course = z.infer<typeof courseSchema>;
export type Language = z.infer<typeof languageSchema>;
export type Project = z.infer<typeof projectSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type Contacts = z.infer<typeof contactsSchema>;
export type ProjectLink = z.infer<typeof projectLinkSchema>;
