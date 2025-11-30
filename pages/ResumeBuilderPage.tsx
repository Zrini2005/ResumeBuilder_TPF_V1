import React, { useState, useRef, useEffect } from 'react';
import ResumeForm from '../templates/OnCampusResume/ResumeForm';
import PaginatedResume, { PaginatedResumeHandle } from '../templates/OnCampusResume/PaginatedResume';
import type { ResumeData } from '../types';
import { initialResumeData } from '../data/initialData';

// Declare external libraries for TypeScript
declare const jspdf: any;
declare const html2canvas: any;

interface CustomFonts {
    regular: string | null;
    bold: string | null;
    footer: string | null;
}

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
  
  // Custom Font State
  const [customFonts, setCustomFonts] = useState<CustomFonts>({ regular: null, bold: null, footer: null });
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [useSystemFonts, setUseSystemFonts] = useState(false);
  
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

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'regular' | 'bold' | 'footer') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = () => {
              const result = reader.result as string;
              // Store pure base64 without prefix
              const base64 = result.split(',')[1];
              setCustomFonts(prev => ({ ...prev, [type]: base64 }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleUseSystemFonts = () => {
      setUseSystemFonts(true);
      setIsFontModalOpen(false);
      // Automatically trigger download again after a brief delay to allow state update
      setTimeout(() => {
          handleDownloadPdf(true);
      }, 100);
  };

  const handleDownloadPdf = async (forceSystemFonts = false) => {
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

        const shouldUseSystemFonts = forceSystemFonts || useSystemFonts;

        let style: HTMLStyleElement | null = null;
        const styleId = 'pdf-generation-fonts';
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) existingStyle.remove();

        // 1. Inject Style to adjust padding-bottom of section headers to 18px temporarily
        const paddingStyleId = 'pdf-generation-padding';
        const paddingStyle = document.createElement('style');
        paddingStyle.id = paddingStyleId;
        // Target h2 elements inside the resume container that have the specific font-bold class (Section headers)
        // Note: We use !important to override inline styles
        paddingStyle.innerHTML = `
            .resume-page-container h2.text-xl {
                padding-bottom: 18px !important;
            }
        `;
        document.head.appendChild(paddingStyle);

        if (shouldUseSystemFonts) {
             // Inject styles to force system fonts for the capture
             style = document.createElement('style');
             style.id = styleId;
             style.innerHTML = `
                .resume-page-container, .resume-page-container * {
                    font-family: sans-serif !important;
                }
             `;
             document.head.appendChild(style);
        } else {
            // Helper to fetch and convert font to base64
            const getFontBase64 = async (url: string, type: 'regular' | 'bold'): Promise<string> => {
                // 1. Check if user manually uploaded this font
                if (customFonts[type]) {
                    console.log(`Using custom uploaded font for ${type}`);
                    return customFonts[type] as string;
                }

                // 2. Try fetching from URL
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
                    console.error(`Error fetching font ${type}:`, err);
                    throw new Error("FONT_FETCH_ERROR");
                }
            };

            // URLs for Lato Regular and Bold (Google Fonts CDN)
            const fontUrls = {
                regular: 'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.ttf',
                bold: 'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPHA.ttf'
            };

            // Fetch fonts
            let latoRegularBase64, latoBoldBase64;
            try {
                [latoRegularBase64, latoBoldBase64] = await Promise.all([
                    getFontBase64(fontUrls.regular, 'regular'),
                    getFontBase64(fontUrls.bold, 'bold')
                ]);
            } catch (error: any) {
                if (error.message === 'FONT_FETCH_ERROR') {
                    setIsFontModalOpen(true);
                    throw new Error("Could not download fonts. Please upload them manually.");
                }
                throw error;
            }

            // 1. Add Lato to jsPDF Virtual File System (VFS)
            pdf.addFileToVFS('Lato-Regular.ttf', latoRegularBase64);
            pdf.addFileToVFS('Lato-Bold.ttf', latoBoldBase64);

            // 2. Register Lato fonts in jsPDF
            pdf.addFont('Lato-Regular.ttf', 'Lato', 'normal');
            pdf.addFont('Lato-Regular.ttf', 'Lato', '400');
            
            pdf.addFont('Lato-Bold.ttf', 'Lato', 'bold');
            pdf.addFont('Lato-Bold.ttf', 'Lato', '700');

            // 3. Check for Cambria (Footer Font)
            let cambriaBase64 = customFonts.footer;
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
        }

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
        paddingStyle.remove(); // Remove the padding override

        pdf.save(`${resumeData.personalDetails.name.replace(/\s/g, '_')}_Resume.pdf`);
    } catch (error: any) {
        console.error("PDF Generation failed", error);
        
        // Remove styling if error occurs
        const paddingStyle = document.getElementById('pdf-generation-padding');
        if(paddingStyle) paddingStyle.remove();
        
        // Don't show generic error if we intentionally opened the modal
        if (error.message !== "Could not download fonts. Please upload them manually.") {
            showDownloadError(error.message || "An error occurred while generating the PDF.");
        }
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
            <button
               onClick={() => setIsFontModalOpen(true)}
               className="h-8 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm flex items-center justify-center"
               title="Configure Fonts"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
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

    {/* Font Upload Modal */}
    {isFontModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-full inline-block mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Font Setup</h2>
                    <p className="text-gray-600 mt-2">
                        Customize or fix missing fonts for the PDF generation. If automatic downloads fail, you can upload them here.
                    </p>
                    <a href="https://fonts.google.com/specimen/Lato" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm mt-1 block">
                        Download Lato font family from Google Fonts
                    </a>
                </div>

                <div className="space-y-4">
                    <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-white hover:border-blue-400 transition-colors">
                        <label className="block text-sm font-bold text-gray-700 mb-2">1. Upload Lato-Regular.ttf</label>
                        <input 
                            type="file" 
                            accept=".ttf" 
                            onChange={(e) => handleFontUpload(e, 'regular')} 
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {customFonts.regular && <p className="text-xs text-green-600 mt-1 font-semibold">✓ Uploaded</p>}
                    </div>

                    <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-white hover:border-blue-400 transition-colors">
                         <label className="block text-sm font-bold text-gray-700 mb-2">2. Upload Lato-Bold.ttf</label>
                         <input 
                            type="file" 
                            accept=".ttf" 
                            onChange={(e) => handleFontUpload(e, 'bold')} 
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {customFonts.bold && <p className="text-xs text-green-600 mt-1 font-semibold">✓ Uploaded</p>}
                    </div>

                    <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-white hover:border-blue-400 transition-colors">
                         <label className="block text-sm font-bold text-gray-700 mb-2">3. Upload Cambria.ttf (Optional - for Footer)</label>
                         <input 
                            type="file" 
                            accept=".ttf" 
                            onChange={(e) => handleFontUpload(e, 'footer')} 
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                        {customFonts.footer && <p className="text-xs text-green-600 mt-1 font-semibold">✓ Uploaded</p>}
                        <p className="text-xs text-gray-400 mt-1">If not uploaded, the footer will use a standard serif font.</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                    <button 
                        onClick={handleUseSystemFonts}
                        className="text-sm text-gray-500 hover:text-gray-800 underline"
                    >
                        Skip & Use System Fonts
                    </button>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsFontModalOpen(false)} 
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => setIsFontModalOpen(false)} 
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg"
                        >
                            Save & Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
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