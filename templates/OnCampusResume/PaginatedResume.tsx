import React, { useState, useLayoutEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import ResumePreview from './ResumePreview';
import type { ResumeData } from '../../types';

const PAGE_HEIGHT_PX = 1123; 

interface PaginatedResumeProps {
  resumeData: ResumeData;
  onPhotoUploadClick: () => void;
  onLogoUploadClick: () => void;
}

export interface PaginatedResumeHandle {
  getHtmlForPdf: () => HTMLDivElement | null;
}

const PaginatedResume = forwardRef<PaginatedResumeHandle, PaginatedResumeProps>(({ resumeData, onPhotoUploadClick, onLogoUploadClick }, ref) => {
  const sourceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [headerHtml, setHeaderHtml] = useState('');
  const [footerHtml, setFooterHtml] = useState('');

  useImperativeHandle(ref, () => ({
    getHtmlForPdf: () => containerRef.current,
  }));

  const isPlaceholder = (url: string) => url.includes('via.placeholder.com');

  useLayoutEffect(() => {
    const calculatePages = () => {
      if (!sourceRef.current) return;

      const sourceDoc = sourceRef.current;
      const header = sourceDoc.querySelector('header');
      const footer = sourceDoc.querySelector('footer');
      const main = sourceDoc.querySelector('main');
      const mainHr = sourceDoc.querySelector('header + hr');
      
      if (!header || !footer || !main || !mainHr) return;

      setHeaderHtml(header.outerHTML);
      setFooterHtml(footer.outerHTML);

      const getElementHeight = (el: Element | null): number => {
        if (!el) return 0;
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return rect.height + parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
      };

      const nodes = Array.from(main.children) as HTMLElement[];

      const mainStyle = window.getComputedStyle(main);
      const mainPaddingTop = parseInt(mainStyle.paddingTop, 10);

      const PAGINATION_OFFSET_BUFFER = 5; // Add a small cushion

      const headerSectionHeight = getElementHeight(header) + getElementHeight(mainHr);
      const footerSectionHeight = getElementHeight(footer);

      const firstPagePaddingY = 64 + 8; // pt-16 (top) + pb-2 (bottom)
      const subsequentPagePaddingY = 40 + 8; // pt-10 (top) + pb-2 (bottom)

      const firstPageAvailableHeight = PAGE_HEIGHT_PX - firstPagePaddingY - headerSectionHeight - footerSectionHeight - mainPaddingTop - PAGINATION_OFFSET_BUFFER;
      const subsequentPageAvailableHeight = PAGE_HEIGHT_PX - subsequentPagePaddingY - footerSectionHeight - PAGINATION_OFFSET_BUFFER;
      
      const pagesContent: string[] = [];
      let currentPageHtml = "";
      let currentHeight = 0;
      let isFirstPage = true;

      for (const sectionNode of nodes) {
        let availableHeight = isFirstPage ? firstPageAvailableHeight : subsequentPageAvailableHeight;
        const sectionHeight = getElementHeight(sectionNode);

        if (currentHeight + sectionHeight <= availableHeight) {
          currentPageHtml += sectionNode.outerHTML;
          currentHeight += sectionHeight;
          continue;
        }

        const isSplittable = sectionNode.dataset.splittable === 'true';

        if (!isSplittable) {
          if (currentPageHtml) {
            pagesContent.push(currentPageHtml);
          }
          currentPageHtml = sectionNode.outerHTML;
          currentHeight = sectionHeight;
          isFirstPage = false;
          continue;
        }

        const sectionHeader = sectionNode.children[0] as HTMLElement;
        const listContainer = sectionNode.children[1] as HTMLElement;

        if (!sectionHeader || !listContainer) {
            currentPageHtml += sectionNode.outerHTML;
            currentHeight += sectionHeight;
            continue;
        }

        const items = Array.from(listContainer.children) as HTMLElement[];
        const sectionHeaderHeight = getElementHeight(sectionHeader);
        const firstItemHeight = items.length > 0 ? getElementHeight(items[0]) : 0;

        if (currentHeight > 0 && currentHeight + sectionHeaderHeight + firstItemHeight > availableHeight) {
             pagesContent.push(currentPageHtml);
             currentPageHtml = '';
             currentHeight = 0;
             isFirstPage = false;
             availableHeight = subsequentPageAvailableHeight;
        }

        const sectionOpeningTag = `<div class="${sectionNode.className}" data-splittable="true">`;
        const sectionClosingTag = '</div>';
        
        let currentSectionHtml = sectionHeader.outerHTML;
        currentHeight += sectionHeaderHeight;

        const listOpeningTag = `<${listContainer.tagName.toLowerCase()} class="${listContainer.className}">`;
        const listClosingTag = `</${listContainer.tagName.toLowerCase()}>`;
        
        let listItemsHtml = '';

        for (const item of items) {
            const itemHeight = getElementHeight(item);

            if (currentHeight + itemHeight > availableHeight) {
                currentPageHtml += sectionOpeningTag + currentSectionHtml + listOpeningTag + listItemsHtml + listClosingTag + sectionClosingTag;
                pagesContent.push(currentPageHtml);
                
                isFirstPage = false;
                availableHeight = subsequentPageAvailableHeight;
                currentPageHtml = '';
                
                listItemsHtml = item.outerHTML;
                currentHeight = itemHeight;
                currentSectionHtml = '';
            } else {
                listItemsHtml += item.outerHTML;
                currentHeight += itemHeight;
            }
        }
        
        if (listItemsHtml) {
            currentPageHtml += sectionOpeningTag + currentSectionHtml + listOpeningTag + listItemsHtml + listClosingTag + sectionClosingTag;
        }
      }

      if (currentPageHtml) {
        pagesContent.push(currentPageHtml);
      }
      
      if (pagesContent.length === 0 && main.innerHTML) {
          pagesContent.push(main.innerHTML);
      }

      setPages(pagesContent);
    };
    
    document.fonts.ready.then(() => {
        setTimeout(calculatePages, 200);
    });

  }, [resumeData]);

  const UploadButton = () => (
    <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="text-sm mt-1">Upload</span>
    </div>
  );

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-8">
      <div className="absolute top-0 left-[-9999px] opacity-0" aria-hidden="true">
        <ResumePreview resumeData={resumeData} ref={sourceRef} />
      </div>

      {pages.length > 0 ? pages.map((content, index) => (
        <div key={index} className="relative">
          <div 
            className={`resume-page-container bg-white shadow-lg px-10 pb-2 w-[210mm] h-[297mm] flex flex-col text-black leading-relaxed ${index === 0 ? 'pt-16' : 'pt-10'}`}
          >
            {index === 0 && (
              <>
                <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
                <hr className="border-t-[3px] border-black mt-4 mb-2 -mx-10" />
              </>
            )}
            <main className={`text-[15px] flex-grow ${index === 0 ? 'pt-2' : 'pt-0'}`} dangerouslySetInnerHTML={{ __html: content }} />
            <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
          </div>

          {index === 0 && (
            <>
              <button
                onClick={onLogoUploadClick}
                className={`absolute top-[64px] left-[40px] h-36 w-36 bg-black flex items-center justify-center text-white cursor-pointer group transition-opacity duration-300 
                  ${isPlaceholder(resumeData.personalDetails.logo) ? 'bg-opacity-50 opacity-100' : 'bg-opacity-40 opacity-50 group-hover:opacity-100'}`}
                aria-label="Upload new logo"
              >
                <UploadButton />
              </button>
              <button
                onClick={onPhotoUploadClick}
                className={`absolute top-[64px] right-[40px] h-[140px] w-[130px] bg-black flex items-center justify-center text-white cursor-pointer group transition-opacity duration-300 
                  ${isPlaceholder(resumeData.personalDetails.photo) ? 'bg-opacity-50 opacity-100' : 'bg-opacity-40 opacity-50 group-hover:opacity-100'}`}
                aria-label="Upload new photo"
              >
                <UploadButton />
              </button>
            </>
          )}
        </div>
      )) : (
        <div className="bg-white shadow-lg w-[210mm] h-[297mm] flex items-center justify-center">
            <p className="text-center p-8 text-gray-500">Generating preview...</p>
        </div>
      )}
    </div>
  );
});

export default PaginatedResume;