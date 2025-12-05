import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import ResumePreview from './ResumePreview';
import type { ResumeData } from '../../types';

interface PaginatedResumeProps {
  resumeData: ResumeData;
  onPhotoUploadClick: () => void; // Not used but kept for prop consistency
}

export interface PaginatedResumeHandle {
  getHtmlForPdf: () => HTMLDivElement | null;
}

const PaginatedResume = forwardRef<PaginatedResumeHandle, PaginatedResumeProps>(({ resumeData }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getHtmlForPdf: () => containerRef.current,
  }));

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-8">
      <div className="relative">
          <div className="resume-page-container bg-white shadow-lg w-[210mm] min-h-[297mm] flex overflow-hidden">
             <ResumePreview resumeData={resumeData} />
          </div>
      </div>
    </div>
  );
});

export default PaginatedResume;