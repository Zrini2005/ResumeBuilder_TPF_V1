import React, { useState, useLayoutEffect, useRef } from 'react';
import ResumePreview from './ResumePreview';
import type { ResumeData } from '../types';

const PAGE_HEIGHT_PX = 1123; 

// FIX: Define the missing 'PaginatedResumeProps' interface.
interface PaginatedResumeProps {
  resumeData: ResumeData;
}

const PaginatedResume: React.FC<PaginatedResumeProps> = ({ resumeData }) => {
  const sourceRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [headerHtml, setHeaderHtml] = useState('');
  const [footerHtml, setFooterHtml] = useState('');

  useLayoutEffect(() => {
    const calculatePages = () => {
      if (!sourceRef.current) return;

      const sourceDoc = sourceRef.current;
      const header = sourceDoc.querySelector('header');
      const footer = sourceDoc.querySelector('footer');
      const main = sourceDoc.querySelector('main');
      const mainHr = sourceDoc.querySelector('header + hr');
      
      // Note: The footerHr is no longer present, so the query will be null.
      // The getElementHeight function handles null gracefully, returning 0.
      const footerHr = sourceDoc.querySelector('main + hr');

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

      const headerSectionHeight = getElementHeight(header) + getElementHeight(mainHr);
      const footerSectionHeight = getElementHeight(footerHr) + getElementHeight(footer);

      const firstPagePaddingY = 64 + 16; // pt-16 + pb-4
      const subsequentPagePaddingY = 40 + 16; // pt-10 + pb-4

      const firstPageAvailableHeight = PAGE_HEIGHT_PX - firstPagePaddingY - headerSectionHeight - footerSectionHeight - mainPaddingTop;
      const subsequentPageAvailableHeight = PAGE_HEIGHT_PX - subsequentPagePaddingY - footerSectionHeight;
      
      const pagesContent: string[] = [];
      let currentPageHtml = "";
      let currentHeight = 0;
      let isFirstPage = true;

      for (const sectionNode of nodes) {
        const isSplittable = sectionNode.dataset.splittable === 'true';
        const sectionHeight = getElementHeight(sectionNode);
        const availableHeight = isFirstPage ? firstPageAvailableHeight : subsequentPageAvailableHeight;

        if (currentHeight + sectionHeight <= availableHeight) {
          currentPageHtml += sectionNode.outerHTML;
          currentHeight += sectionHeight;
          continue;
        }

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
        if (!sectionHeader || !listContainer) continue;

        const items = Array.from(listContainer.children) as HTMLElement[];
        const sectionHeaderHeight = getElementHeight(sectionHeader);

        const sectionOpeningTag = `<div class="${sectionNode.className}" data-splittable="true">`;
        const sectionClosingTag = '</div>';
        const listOpeningTag = `<${listContainer.tagName.toLowerCase()} class="${listContainer.className}">`;
        const listClosingTag = `</${listContainer.tagName.toLowerCase()}>`;
        
        let pageAvailableHeight = isFirstPage ? firstPageAvailableHeight : subsequentPageAvailableHeight;
        if (currentHeight + sectionHeaderHeight > pageAvailableHeight) {
          if (currentPageHtml) pagesContent.push(currentPageHtml);
          currentPageHtml = '';
          currentHeight = 0;
          isFirstPage = false;
        }

        currentPageHtml += sectionOpeningTag + sectionHeader.outerHTML + listOpeningTag;
        currentHeight += sectionHeaderHeight;

        for (const item of items) {
          const itemHeight = getElementHeight(item);
          pageAvailableHeight = isFirstPage ? firstPageAvailableHeight : subsequentPageAvailableHeight;

          if (currentHeight + itemHeight > pageAvailableHeight && currentHeight > sectionHeaderHeight) {
            currentPageHtml += listClosingTag + sectionClosingTag;
            pagesContent.push(currentPageHtml);
            
            isFirstPage = false;
            // Start new page without the section header
            currentPageHtml = sectionOpeningTag + listOpeningTag + item.outerHTML;
            currentHeight = itemHeight;
          } else {
            currentPageHtml += item.outerHTML;
            currentHeight += itemHeight;
          }
        }
        currentPageHtml += listClosingTag + sectionClosingTag;
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

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="absolute top-0 left-[-9999px] opacity-0" aria-hidden="true">
        <ResumePreview resumeData={resumeData} ref={sourceRef} />
      </div>

      {pages.length > 0 ? pages.map((content, index) => (
        <div 
          key={index} 
          className={`bg-white shadow-lg px-10 pb-4 w-[210mm] h-[297mm] flex flex-col text-black leading-relaxed ${index === 0 ? 'pt-16' : 'pt-10'}`}
        >
          {index === 0 && (
            <>
              <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
              <hr className="border-t-[3px] border-black my-4 -mx-10" />
            </>
          )}
          <main className={`text-base flex-grow ${index === 0 ? 'pt-6' : 'pt-0'}`} dangerouslySetInnerHTML={{ __html: content }} />
          <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
        </div>
      )) : (
        <div className="bg-white shadow-lg w-[210mm] h-[297mm] flex items-center justify-center">
            <p className="text-center p-8 text-gray-500">Generating preview...</p>
        </div>
      )}
    </div>
  );
};

export default PaginatedResume;