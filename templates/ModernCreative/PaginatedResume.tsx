import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import ResumePreview from './ResumePreview';
import type { ResumeData } from '../../types';

interface PaginatedResumeProps {
  resumeData: ResumeData;
  themeColor: string;
  onPhotoUploadClick: () => void;
}

export interface PaginatedResumeHandle {
  getHtmlForPdf: () => HTMLDivElement | null;
}

const PaginatedResume = forwardRef<PaginatedResumeHandle, PaginatedResumeProps>(({ resumeData, themeColor, onPhotoUploadClick }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getHtmlForPdf: () => containerRef.current,
  }));

  const isPlaceholder = (url: string) => url.includes('via.placeholder.com');

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-8">
      <div className="relative">
          <div className="resume-page-container bg-white shadow-lg w-[210mm] min-h-[297mm] flex overflow-hidden">
             <ResumePreview resumeData={resumeData} themeColor={themeColor} />
          </div>

          <button
            onClick={onPhotoUploadClick}
            className={`absolute top-[32px] left-[calc(17.5%-5rem)] h-40 w-40 rounded-full bg-black flex items-center justify-center text-white cursor-pointer group transition-opacity duration-300 
              ${isPlaceholder(resumeData.personalDetails.photo) ? 'bg-opacity-50 opacity-100' : 'bg-opacity-40 opacity-0 group-hover:opacity-100'}`}
            style={{ marginLeft: '0' }}
            aria-label="Upload new photo"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
      </div>
    </div>
  );
});

export default PaginatedResume;