'use client';

import React from 'react';
import { useResumeStore } from '@/features/resumes/store';
import { PersonalForm } from './forms/PersonalForm';
import { AboutForm } from './forms/AboutForm';
import { ExperienceForm } from './forms/ExperienceForm';
import { SkillsForm } from './forms/SkillsForm';
import { EducationForm } from './forms/EducationForm';
import { CoursesForm } from './forms/CoursesForm';
import { LanguagesForm } from './forms/LanguagesForm';
import { ContactsForm } from './forms/ContactsForm';
import { ProjectsForm } from './forms/ProjectsForm';
import { DesignForm } from './forms/DesignForm';
import { ExportForm } from './forms/ExportForm';
import { useActiveStep } from './EditorSidebar';

interface Props {
  imageUrls: Record<string, string>;
}

export function EditorForm({ imageUrls }: Props) {
  const { activeStep } = useActiveStep();
  const resume = useResumeStore((s) => s.resume);
  const updateResume = useResumeStore((s) => s.updateResume);

  if (!resume) return null;

  const formProps = { resume, updateResume, imageUrls };

  return (
    <div className="px-5 py-4">
      {activeStep === 'personal' && <PersonalForm {...formProps} />}
      {activeStep === 'about' && <AboutForm {...formProps} />}
      {activeStep === 'experience' && <ExperienceForm {...formProps} />}
      {activeStep === 'skills' && <SkillsForm {...formProps} />}
      {activeStep === 'education' && <EducationForm {...formProps} />}
      {activeStep === 'courses' && <CoursesForm {...formProps} />}
      {activeStep === 'languages' && <LanguagesForm {...formProps} />}
      {activeStep === 'contacts' && <ContactsForm {...formProps} />}
      {activeStep === 'projects' && <ProjectsForm {...formProps} />}
      {activeStep === 'design' && <DesignForm {...formProps} />}
      {activeStep === 'export' && <ExportForm {...formProps} />}
    </div>
  );
}
