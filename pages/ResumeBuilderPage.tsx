import React, { useState, useRef, useEffect } from "react";
import OnCampusResumeForm from "../templates/OnCampusResume/ResumeForm";
import OnCampusPaginatedResume, {
  PaginatedResumeHandle,
} from "../templates/OnCampusResume/PaginatedResume";

import ModernCreativeResumeForm from "../templates/ModernCreative/ResumeForm";
import ModernCreativePaginatedResume, {
  PaginatedResumeHandle as ModernPaginatedResumeHandle,
} from "../templates/ModernCreative/PaginatedResume";

import CorporateMinimalResumeForm from "../templates/CorporateMinimal/ResumeForm";
import CorporateMinimalPaginatedResume, {
  PaginatedResumeHandle as CorporatePaginatedResumeHandle,
} from "../templates/CorporateMinimal/PaginatedResume";

import type { ResumeData } from "../types";
import {
  initialResumeData,
  modernCreativeInitialData,
  corporateMinimalInitialData,
} from "../data/initialData";

declare const jspdf: any;
declare const html2canvas: any;

interface ResumeBuilderPageProps {
  onBack: () => void;
  initialData: ResumeData | null;
  selectedTemplate: "on-campus" | "modern-creative" | "corporate-minimal";
}

const THEME_COLORS = [
  { name: "Slate", hex: "#0f172a" },
  { name: "Maroon", hex: "#7f1d1d" },
  { name: "Dark Blue", hex: "#1e3a8a" },
  { name: "Purple", hex: "#581c87" },
  { name: "Teal", hex: "#134e4a" },
  { name: "Black", hex: "#000000" },
];

function ResumeBuilderPage({
  onBack,
  initialData,
  selectedTemplate,
}: ResumeBuilderPageProps) {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    if (initialData) return initialData;
    if (selectedTemplate === "modern-creative")
      return modernCreativeInitialData;
    if (selectedTemplate === "corporate-minimal")
      return corporateMinimalInitialData;
    return initialResumeData;
  });

  const [isFormVisible, setIsFormVisible] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [zoomInput, setZoomInput] = useState("100%");
  const [isDownloading, setIsDownloading] = useState(false);

  const [themeColor, setThemeColor] = useState("#0f172a");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const paginatedResumeRef = useRef<
    | PaginatedResumeHandle
    | ModernPaginatedResumeHandle
    | CorporatePaginatedResumeHandle
  >(null);
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
    setIsLogoModalOpen(true);
  };

  const handleSetNITTLogo = () => {
    const NITT_LOGO_URL = "/images/NITTLogo.png";
    setResumeData((prev) => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, logo: NITT_LOGO_URL },
    }));
    setIsLogoModalOpen(false);
  };

  const handleCustomLogoUploadFromModal = () => {
    logoFileInputRef.current?.click();
    setIsLogoModalOpen(false);
  };

  const isPlaceholder = (url: string) => url.includes("via.placeholder.com");

  const validateImages = (): string | null => {
    const photoIsPlaceholder = isPlaceholder(resumeData.personalDetails.photo);
    const logoIsPlaceholder = isPlaceholder(resumeData.personalDetails.logo);

    if (selectedTemplate === "on-campus") {
      if (photoIsPlaceholder && logoIsPlaceholder) {
        return "Please upload a profile photo and the institute logo before downloading.";
      }
      if (photoIsPlaceholder) {
        return "Please upload a profile photo before downloading.";
      }
      if (logoIsPlaceholder) {
        return "Please upload the institute logo before downloading.";
      }
    } else if (selectedTemplate === "modern-creative") {
      if (photoIsPlaceholder) {
        return "Please upload a profile photo before downloading.";
      }
    }
    return null;
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

    const pageElements = container.querySelectorAll(".resume-page-container");
    if (pageElements.length === 0) {
      console.error("No pages found to download.");
      showDownloadError("There is no content to download as a PDF.");
      return;
    }

    setIsDownloading(true);

    try {
      const pdf = new jspdf.jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let style: HTMLStyleElement | null = null;
      const styleId = "pdf-generation-fonts";
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) existingStyle.remove();

      const getFontBase64 = async (url: string): Promise<string | null> => {
        try {
          const response = await fetch(url);
          if (!response.ok) return null;
          const blob = await response.blob();
          if (blob.size === 0) return null;
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              resolve(result.split(",")[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          return null;
        }
      };

      let latoRegularBase64, latoBoldBase64, cambriaBase64;

      try {
        latoRegularBase64 = await getFontBase64("/fonts/Lato-Regular.ttf");
        latoBoldBase64 = await getFontBase64("/fonts/Lato-Bold.ttf");
      } catch (error) {
        console.error("Font loading error", error);
      }

      try {
        cambriaBase64 = await getFontBase64("/fonts/Cambria-Regular.ttf");
      } catch (error) {
        console.error("Cambria font loading error", error);
      }

      if (latoRegularBase64) {
        pdf.addFileToVFS("Lato-Regular.ttf", latoRegularBase64);
        pdf.addFont("Lato-Regular.ttf", "Lato", "normal");
        pdf.addFont("Lato-Regular.ttf", "Lato", "400");
      }

      if (latoBoldBase64) {
        pdf.addFileToVFS("Lato-Bold.ttf", latoBoldBase64);
        pdf.addFont("Lato-Bold.ttf", "Lato", "bold");
        pdf.addFont("Lato-Bold.ttf", "Lato", "700");
      }

      if (cambriaBase64) {
        pdf.addFileToVFS("Cambria.ttf", cambriaBase64);
        pdf.addFont("Cambria.ttf", "Cambria", "normal");
        pdf.addFont("Cambria.ttf", "Cambria", "400");
      }

      style = document.createElement("style");
      style.id = styleId;

      let fontFaceCss = "";
      if (latoRegularBase64) {
        fontFaceCss += `
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
            `;
      }
      if (latoBoldBase64) {
        fontFaceCss += `
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
            `;
      }
      if (cambriaBase64) {
        fontFaceCss += `
                @font-face {
                    font-family: 'Cambria';
                    src: url(data:font/ttf;base64,${cambriaBase64}) format('truetype');
                    font-weight: normal;
                    font-style: normal;
                }
            `;
      }

      let pdfOverrides = `
            .section-header-flex {
                align-items: flex-end !important;
            }
            .section-header-line {
                margin-bottom: 4px !important;
            }
            .resume-section-container {
                margin-bottom: 1.1rem !important;
            }
            .custom-square-list li::before {
                width: 3px !important;
                height: 3px !important;
                top: 0.6em !important;
            }
        `;

      if (selectedTemplate === "modern-creative") {
        pdfOverrides += `
                .modern-creative-skill-tag {
                    position: relative;
                    top: -5px;
                }
                .modern-creative-date {
                    position: relative;
                    top: -2px;
                }
                .modern-creative-contact-icon {
                    position: relative;
                    top: 4px;
                }
                .modern-creative-section-border {
                    position: relative;
                    top: 3px;
                }
             `;
      }

      if (selectedTemplate === "corporate-minimal") {
        pdfOverrides += `
                .corporate-minimal-list-item::before {
                    top: 15px !important;
                }
             `;
      }

      style.innerHTML = fontFaceCss + pdfOverrides;
      document.head.appendChild(style);

      if (latoRegularBase64) {
        pdf.setFont("Lato", "normal");
      }

      for (let i = 0; i < pageElements.length; i++) {
        const pageElement = pageElements[i] as HTMLElement;
        const uploadButtons = pageElement.parentElement?.querySelectorAll(
          'button[aria-label^="Upload"]'
        );
        uploadButtons?.forEach(
          (btn) => ((btn as HTMLElement).style.visibility = "hidden")
        );

        if (i > 0) {
          pdf.addPage();
        }

        await pdf.html(pageElement, {
          callback: (doc: any) => {},
          x: 0,
          y: 0,
          width: 210,
          windowWidth: 794,
          html2canvas: {
            scale: 0.26458,
            useCORS: true,
            logging: false,
            letterRendering: false,
            allowTaint: true,
          },
          autoPaging: false,
        });

        uploadButtons?.forEach(
          (btn) => ((btn as HTMLElement).style.visibility = "visible")
        );
      }

      if (style) style.remove();
      if (pdf.getNumberOfPages() > 1) {
        pdf.deletePage(1);
      }
      pdf.save(
        `${resumeData.personalDetails.name.replace(/\s/g, "_")}_Resume.pdf`
      );
    } catch (error: any) {
      console.error("PDF Generation failed", error);
      showDownloadError(
        error.message || "An error occurred while generating the PDF."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomInput(e.target.value);
  };

  const applyZoom = () => {
    let numericValue = parseFloat(zoomInput.replace(/%/g, "").trim());
    if (!isNaN(numericValue)) {
      numericValue = Math.max(20, Math.min(500, numericValue));
      setZoom(numericValue / 100);
    } else {
      setZoomInput(`${Math.round(zoom * 100)}%`);
    }
  };

  const handleZoomInputBlur = () => {
    applyZoom();
  };

  const handleZoomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyZoom();
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      setZoomInput(`${Math.round(zoom * 100)}%`);
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex h-screen bg-gray-200 overflow-hidden">
      <aside
        className={`transition-all duration-300 ease-in-out bg-white shadow-lg flex-shrink-0 relative ${
          isFormVisible ? "w-full md:w-[500px]" : "w-0"
        } overflow-hidden`}
      >
        <div className="h-screen overflow-y-auto">
          {selectedTemplate === "on-campus" ? (
            <OnCampusResumeForm
              resumeData={resumeData}
              setResumeData={setResumeData}
              photoFileInputRef={photoFileInputRef}
              logoFileInputRef={logoFileInputRef}
            />
          ) : selectedTemplate === "modern-creative" ? (
            <ModernCreativeResumeForm
              resumeData={resumeData}
              setResumeData={setResumeData}
              photoFileInputRef={photoFileInputRef}
              logoFileInputRef={logoFileInputRef}
            />
          ) : (
            <CorporateMinimalResumeForm
              resumeData={resumeData}
              setResumeData={setResumeData}
              photoFileInputRef={photoFileInputRef}
              logoFileInputRef={logoFileInputRef}
            />
          )}
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col items-center">
        <div className="mb-6 bg-white p-2 rounded-lg shadow-md flex items-center space-x-2 sticky top-0 z-10">
          <button
            onClick={onBack}
            className="h-8 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center justify-center space-x-1.5 mr-2"
            title="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back</span>
          </button>
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
          <button
            onClick={() => setZoom((prev) => Math.max(0.2, prev - 0.1))}
            className="h-8 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold flex items-center justify-center"
          >
            -
          </button>
          <button
            onClick={() => setZoom(1)}
            className="h-8 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm flex items-center justify-center"
          >
            Reset
          </button>
          <button
            onClick={() => setZoom((prev) => prev + 0.1)}
            className="h-8 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold flex items-center justify-center"
          >
            +
          </button>
          <input
            type="text"
            value={zoomInput}
            onChange={handleZoomInputChange}
            onBlur={handleZoomInputBlur}
            onKeyDown={handleZoomInputKeyDown}
            className="h-8 text-sm text-gray-600 w-16 text-center bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Zoom percentage"
          />

          {selectedTemplate === "modern-creative" && (
            <div className="relative ml-2">
              <button
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm focus:outline-none ring-1 ring-gray-300 transition-transform hover:scale-105"
                style={{ backgroundColor: themeColor }}
                title="Change Base Color"
                aria-label="Change Color"
              />
              {isColorPickerOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsColorPickerOpen(false)}
                  />
                  <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white p-3 rounded-xl shadow-xl border border-gray-100 flex gap-2 z-20 animate-fade-in">
                    {THEME_COLORS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setThemeColor(c.hex);
                          setIsColorPickerOpen(false);
                        }}
                        className="w-8 h-8 rounded-full hover:scale-110 transition-transform ring-1 ring-gray-200 border-2 border-white shadow-sm"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={() => handleDownloadPdf()}
            disabled={isDownloading}
            className={`h-8 px-3 text-white rounded text-sm flex items-center justify-center space-x-1.5 ml-2 transition-colors ${
              isDownloading
                ? "bg-green-400 cursor-wait"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isDownloading ? (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            )}
            <span>{isDownloading ? "Generating..." : "PDF"}</span>
          </button>
        </div>

        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: "top" }}
          className="transition-transform duration-200"
        >
          {selectedTemplate === "on-campus" ? (
            <OnCampusPaginatedResume
              ref={paginatedResumeRef as React.RefObject<PaginatedResumeHandle>}
              resumeData={resumeData}
              onPhotoUploadClick={handleTriggerPhotoUpload}
              onLogoUploadClick={handleTriggerLogoUpload}
            />
          ) : selectedTemplate === "modern-creative" ? (
            <ModernCreativePaginatedResume
              ref={
                paginatedResumeRef as React.RefObject<ModernPaginatedResumeHandle>
              }
              resumeData={resumeData}
              themeColor={themeColor}
              onPhotoUploadClick={handleTriggerPhotoUpload}
            />
          ) : (
            <CorporateMinimalPaginatedResume
              ref={
                paginatedResumeRef as React.RefObject<CorporatePaginatedResumeHandle>
              }
              resumeData={resumeData}
              onPhotoUploadClick={handleTriggerPhotoUpload}
            />
          )}
        </div>
      </main>

      {!isFormVisible && (
        <button
          onClick={() => setIsFormVisible(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-blue-600 text-white rounded-r-lg px-2 py-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out"
          aria-label="Show Editor"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {isFormVisible && (
        <button
          onClick={() => setIsFormVisible(false)}
          className="fixed top-1/2 -translate-y-1/2 z-30 bg-blue-600 text-white rounded-l-lg px-2 py-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out left-full md:left-[500px] -translate-x-full"
          aria-label="Hide Editor"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {downloadError && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{downloadError}</span>
        </div>
      )}

      {isLogoModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Select Institute Logo
            </h3>

            <div className="space-y-3">
              <button
                onClick={handleSetNITTLogo}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition-colors border border-blue-200"
              >
                NITT Logo
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <button
                onClick={handleCustomLogoUploadFromModal}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors border border-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Upload Logo
              </button>
            </div>

            <button
              onClick={() => setIsLogoModalOpen(false)}
              className="mt-6 w-full text-center text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeBuilderPage;
