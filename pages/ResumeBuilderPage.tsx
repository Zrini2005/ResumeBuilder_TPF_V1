import React, { useState, useRef, useEffect } from 'react';
import ResumeForm from '../templates/OnCampusResume/ResumeForm';
import PaginatedResume, { PaginatedResumeHandle } from '../templates/OnCampusResume/PaginatedResume';
import type { ResumeData } from '../types';
import { initialResumeData } from '../data/initialData';

// Declare external libraries for TypeScript
declare const jspdf: any;
declare const html2canvas: any;

function ResumeBuilderPage({ onBack, initialData }: { onBack: () => void, initialData: ResumeData | null }) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialData || initialResumeData);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [zoomInput, setZoomInput] = useState('100%');
  const [isDownloading, setIsDownloading] = useState(false);
  const paginatedResumeRef = useRef<PaginatedResumeHandle>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    setZoomInput(`${Math.round(zoom * 100)}%`);
  }, [zoom]);

  const handleTriggerPhotoUpload = () => {
    photoFileInputRef.current?.click();
  };

  const handleTriggerLogoUpload = () => {
    logoFileInputRef.current?.click();
  };

  const isPlaceholder = (url: string) => url.includes('via.placeholder.com');

  const validateImages = (): string | null => {
    const photoIsPlaceholder = isPlaceholder(resumeData.personalDetails.photo);
    const logoIsPlaceholder = isPlaceholder(resumeData.personalDetails.logo);

    if (photoIsPlaceholder && logoIsPlaceholder) {
      return "Please upload a profile photo and the institute logo before downloading.";
    }
    if (photoIsPlaceholder) {
      return "Please upload a profile photo before downloading.";
    }
    if (logoIsPlaceholder) {
      return "Please upload the institute logo before downloading.";
    }
    return null; // All good
  };

  const showDownloadError = (message: string) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setDownloadError(message);
    errorTimeoutRef.current = window.setTimeout(() => {
        setDownloadError(null);
        errorTimeoutRef.current = null;
    }, 6000); 
  };

  const handleDownloadPdf = async () => {
    const validationError = validateImages();
    if (validationError) {
      showDownloadError(validationError);
      return;
    }

    const container = paginatedResumeRef.current?.getHtmlForPdf();
    if (!container) {
      console.error("Resume container not found for PDF generation.");
      showDownloadError("Could not generate PDF. Please try again.");
      return;
    }

    const pageElements = container.querySelectorAll('.resume-page-container');
    if (pageElements.length === 0) {
      console.error("No pages found to download.");
      showDownloadError("There is no content to download as a PDF.");
      return;
    }

    setIsDownloading(true);

    try {
        const pdf = new jspdf.jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        let style: HTMLStyleElement | null = null;
        const styleId = 'pdf-generation-fonts';
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) existingStyle.remove();

        // Helper to fetch and convert font to base64
        const getFontBase64 = async (url: string): Promise<string> => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch font: ${url}`);
                const blob = await response.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const result = reader.result as string;
                        resolve(result.split(',')[1]);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (err) {
                console.error(`Error fetching font ${url}:`, err);
                throw new Error("FONT_FETCH_ERROR");
            }
        };

        // Fetch fonts from local /fonts directory
        let latoRegularBase64, latoBoldBase64, cambriaBase64;
        
        try {
            latoRegularBase64 = await getFontBase64('/fonts/Lato-Regular.ttf');
            latoBoldBase64 = await getFontBase64('/fonts/Lato-Bold.ttf');
        } catch (error) {
            throw new Error("Could not load Lato fonts. Please ensure 'Lato-Regular.ttf' and 'Lato-Bold.ttf' are in the 'fonts' folder.");
        }

        try {
            cambriaBase64 = await getFontBase64('/fonts/Cambria-Regular.ttf');
        } catch (error) {
            console.warn("Cambria font not found in /fonts/Cambria-Regular.ttf. Footer will fall back to default.");
        }

        // 1. Add Lato to jsPDF Virtual File System (VFS)
        pdf.addFileToVFS('Lato-Regular.ttf', latoRegularBase64);
        pdf.addFileToVFS('Lato-Bold.ttf', latoBoldBase64);

        // 2. Register Lato fonts in jsPDF
        pdf.addFont('Lato-Regular.ttf', 'Lato', 'normal');
        pdf.addFont('Lato-Regular.ttf', 'Lato', '400');
        
        pdf.addFont('Lato-Bold.ttf', 'Lato', 'bold');
        pdf.addFont('Lato-Bold.ttf', 'Lato', '700');

        // 3. Register Cambria if available
        if (cambriaBase64) {
             pdf.addFileToVFS('Cambria.ttf', cambriaBase64);
             pdf.addFont('Cambria.ttf', 'Cambria', 'normal');
             pdf.addFont('Cambria.ttf', 'Cambria', '400');
        }

        // 4. Inject @font-face into DOM for html2canvas
        style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            @font-face {
                font-family: 'Lato';
                src: url(data:font/ttf;base64,${latoRegularBase64}) format('truetype');
                font-weight: normal;
                font-style: normal;
            }
            @font-face {
                font-family: 'Lato';
                src: url(data:font/ttf;base64,${latoRegularBase64}) format('truetype');
                font-weight: 400;
                font-style: normal;
            }
            @font-face {
                font-family: 'Lato';
                src: url(data:font/ttf;base64,${latoBoldBase64}) format('truetype');
                font-weight: bold;
                font-style: normal;
            }
            @font-face {
                font-family: 'Lato';
                src: url(data:font/ttf;base64,${latoBoldBase64}) format('truetype');
                font-weight: 700;
                font-style: normal;
            }
            ${cambriaBase64 ? `
            @font-face {
                font-family: 'Cambria';
                src: url(data:font/ttf;base64,${cambriaBase64}) format('truetype');
                font-weight: normal;
                font-style: normal;
            }
            ` : ''}
        `;
        document.head.appendChild(style);

        // Set default font for the document
        pdf.setFont('Lato', 'normal');

        // Render Pages
        for (let i = 0; i < pageElements.length; i++) {
          const pageElement = pageElements[i] as HTMLElement;
          
          // Temporarily hide upload buttons for clean PDF
          const uploadButtons = pageElement.parentElement?.querySelectorAll('button[aria-label^="Upload"]');
          uploadButtons?.forEach(btn => (btn as HTMLElement).style.visibility = 'hidden');

          if (i > 0) {
            pdf.addPage();
          }

          // Use .html() method with specific config
          await pdf.html(pageElement, {
            callback: (doc: any) => {
               // Callback required
            },
            x: 0,
            y: 0,
            width: 210, // A4 width in mm
            windowWidth: 794, // 210mm @ 96 DPI
            html2canvas: {
                scale: 0.26458, // Convert px to mm (1 px = 0.26458 mm)
                useCORS: true,
                logging: false,
                letterRendering: false, // Turn off for custom fonts to avoid spacing issues
                allowTaint: true, // Allow cross-origin images if possible
            },
            autoPaging: false // Manual paging logic used
          });

          // Restore buttons
          uploadButtons?.forEach(btn => (btn as HTMLElement).style.visibility = 'visible');
        }

        // Clean up injected styles
        if (style) style.remove();

        // Remove the first page of the generated PDF before saving if there are multiple pages.
        if (pdf.getNumberOfPages() > 1) {
            pdf.deletePage(1);
        }

        pdf.save(`${resumeData.personalDetails.name.replace(/\s/g, '_')}_Resume.pdf`);
    } catch (error: any) {
        console.error("PDF Generation failed", error);
        
        showDownloadError(error.message || "An error occurred while generating the PDF.");
    } finally {
        setIsDownloading(false);
    }
  };

  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomInput(e.target.value);
  };

  const applyZoom = () => {
    let numericValue = parseFloat(zoomInput.replace(/%/g, '').trim());
    if (!isNaN(numericValue)) {
      numericValue = Math.max(20, Math.min(500, numericValue)); // Clamp between 20% and 500%
      setZoom(numericValue / 100);
    } else {
      // if invalid, revert input to current zoom value
      setZoomInput(`${Math.round(zoom * 100)}%`);
    }
  };

  const handleZoomInputBlur = () => {
    applyZoom();
  };

  const handleZoomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyZoom();
      (e.target as HTMLInputElement).blur(); // remove focus
    } else if (e.key === 'Escape') {
      // revert to original value and blur
      setZoomInput(`${Math.round(zoom * 100)}%`);
      (e.target as HTMLInputElement).blur();
    }
  };


  return (
    <div className="flex h-screen bg-gray-200 overflow-hidden">
      <aside className={`transition-all duration-300 ease-in-out bg-white shadow-lg flex-shrink-0 relative ${isFormVisible ? 'w-full md:w-[500px]' : 'w-0'} overflow-hidden`}>
        <div className="h-screen overflow-y-auto">
          <ResumeForm 
            resumeData={resumeData} 
            setResumeData={setResumeData} 
            photoFileInputRef={photoFileInputRef}
            logoFileInputRef={logoFileInputRef}
          />
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col items-center">
        <div className="mb-6 bg-white p-2 rounded-lg shadow-md flex items-center space-x-2 sticky top-0 z-10">
            <button 
              onClick={onBack}
              className="h-8 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center justify-center space-x-1.5 mr-2"
              title="Back"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
               </svg>
               <span>Back</span>
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <button onClick={() => setZoom(prev => Math.max(0.2, prev - 0.1))} className="h-8 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold flex items-center justify-center">-</button>
            <button onClick={() => setZoom(1)} className="h-8 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm flex items-center justify-center">Reset</button>
            <button onClick={() => setZoom(prev => prev + 0.1)} className="h-8 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold flex items-center justify-center">+</button>
            <input
              type="text"
              value={zoomInput}
              onChange={handleZoomInputChange}
              onBlur={handleZoomInputBlur}
              onKeyDown={handleZoomInputKeyDown}
              className="h-8 text-sm text-gray-600 w-16 text-center bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Zoom percentage"
            />
            <button 
                onClick={() => handleDownloadPdf()} 
                disabled={isDownloading}
                className={`h-8 px-3 text-white rounded text-sm flex items-center justify-center space-x-1.5 ml-2 transition-colors ${isDownloading ? 'bg-green-400 cursor-wait' : 'bg-green-500 hover:bg-green-600'}`}
            >
              {isDownloading ? (
                   <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
              )}
              <span>{isDownloading ? 'Generating...' : 'PDF'}</span>
            </button>
        </div>
        
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top' }} className="transition-transform duration-200">
           <PaginatedResume 
            ref={paginatedResumeRef}
            resumeData={resumeData} 
            onPhotoUploadClick={handleTriggerPhotoUpload}
            onLogoUploadClick={handleTriggerLogoUpload}
          />
        </div>
      </main>

      {!isFormVisible && (
        <button
          onClick={() => setIsFormVisible(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-blue-600 text-white rounded-r-lg px-2 py-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out"
          aria-label="Show Editor"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {isFormVisible && (
       <button
          onClick={() => setIsFormVisible(false)}
          className="fixed top-1/2 -translate-y-1/2 z-30 bg-blue-600 text-white rounded-l-lg px-2 py-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out left-full md:left-[500px] -translate-x-full"
          aria-label="Hide Editor"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
    )}

    {/* Toast Notification */}
    {downloadError && (
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{downloadError}</span>
      </div>
    )}
    </div>
  );
}

export default ResumeBuilderPage;