import React, {
  useState,
  useLayoutEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import ResumePreview from "./ResumePreview";
import type { ResumeData } from "../../types";

const PAGE_HEIGHT_PX = 1122;

interface PaginatedResumeProps {
  resumeData: ResumeData;
  onPhotoUploadClick: () => void;
  onLogoUploadClick: () => void;
}

export interface PaginatedResumeHandle {
  getHtmlForPdf: () => HTMLDivElement | null;
}

const PaginatedResume = forwardRef<PaginatedResumeHandle, PaginatedResumeProps>(
  ({ resumeData, onPhotoUploadClick, onLogoUploadClick }, ref) => {
    const sourceRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<string[]>([]);
    const [headerHtml, setHeaderHtml] = useState("");
    const [footerHtml, setFooterHtml] = useState("");
    const [footerHeightPx, setFooterHeightPx] = useState<number>(0);

    const isMobileView =
      typeof navigator !== "undefined" &&
      (/Mobi|Android|iPhone|iPad|iPod|Windows Phone/.test(
        navigator.userAgent
      ) ||
        (typeof window !== "undefined" && window.innerWidth < 800));

    useImperativeHandle(ref, () => ({
      getHtmlForPdf: () => containerRef.current,
    }));

    const isPlaceholder = (url: string) => url.includes("via.placeholder.com");

    useLayoutEffect(() => {
      const calculatePages = () => {
        if (!sourceRef.current) return;

        // Create an offscreen, unscaled clone of the preview for accurate
        // measurements. This prevents any CSS `scale()` used for mobile
        // zoom from affecting height calculations.
        const measurementRoot = document.createElement("div");
        measurementRoot.style.position = "absolute";
        measurementRoot.style.left = "-9999px";
        measurementRoot.style.top = "0";
        measurementRoot.style.width = "794px"; // A4 px width
        measurementRoot.style.transform = "none";
        measurementRoot.style.zoom = "1";
        measurementRoot.style.pointerEvents = "none";
        measurementRoot.style.visibility = "hidden";
        measurementRoot.innerHTML = sourceRef.current.innerHTML;
        document.body.appendChild(measurementRoot);

        const header = measurementRoot.querySelector("header");
        const footer = measurementRoot.querySelector("footer");
        const main = measurementRoot.querySelector("main");
        const mainHr = measurementRoot.querySelector("header + hr");

        if (!header || !footer || !main || !mainHr) {
          if (measurementRoot.parentElement)
            measurementRoot.parentElement.removeChild(measurementRoot);
          return;
        }

        setHeaderHtml(header.outerHTML);
        setFooterHtml(footer.outerHTML);

        const getElementHeight = (el: Element | null): number => {
          if (!el) return 0;
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return (
            rect.height +
            parseInt(style.marginTop, 10) +
            parseInt(style.marginBottom, 10)
          );
        };

        const nodes = Array.from(main.children) as HTMLElement[];

        const mainStyle = window.getComputedStyle(main);
        const mainPaddingTop = parseInt(mainStyle.paddingTop, 10);

        const PAGINATION_OFFSET_BUFFER = isMobileView ? 12 : 5;

        const headerSectionHeight =
          getElementHeight(header) + getElementHeight(mainHr);
        // Footer is absolutely positioned in the rendered page; on mobile
        // measure only the bounding rect height (ignore margins) for padding.
        const footerSectionHeight = isMobileView
          ? footer.getBoundingClientRect().height || 0
          : getElementHeight(footer);
        if (isMobileView) setFooterHeightPx(footerSectionHeight);

        // Revised padding to match new layout (pt-14 = 56px)
        const firstPagePaddingY = 56 + 8; // pt-14 (top) + pb-2 (bottom)
        const subsequentPagePaddingY = 40 + 8; // pt-10 (top) + pb-2 (bottom)

        const firstPageAvailableHeight =
          PAGE_HEIGHT_PX -
          firstPagePaddingY -
          headerSectionHeight -
          footerSectionHeight -
          mainPaddingTop -
          PAGINATION_OFFSET_BUFFER;
        const subsequentPageAvailableHeight =
          PAGE_HEIGHT_PX -
          subsequentPagePaddingY -
          footerSectionHeight -
          PAGINATION_OFFSET_BUFFER;

        const pagesContent: string[] = [];
        let currentPageHtml = "";
        let currentHeight = 0;
        let isFirstPage = true;

        for (const sectionNode of nodes) {
          let availableHeight = isFirstPage
            ? firstPageAvailableHeight
            : subsequentPageAvailableHeight;
          const sectionHeight = getElementHeight(sectionNode);

          if (currentHeight + sectionHeight <= availableHeight) {
            currentPageHtml += sectionNode.outerHTML;
            currentHeight += sectionHeight;
            continue;
          }

          const isSplittable = sectionNode.dataset.splittable === "true";

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
          const firstItemHeight =
            items.length > 0 ? getElementHeight(items[0]) : 0;

          if (
            currentHeight > 0 &&
            currentHeight + sectionHeaderHeight + firstItemHeight >
              availableHeight
          ) {
            pagesContent.push(currentPageHtml);
            currentPageHtml = "";
            currentHeight = 0;
            isFirstPage = false;
            availableHeight = subsequentPageAvailableHeight;
          }

          const sectionOpeningTag = `<div class="${sectionNode.className}" data-splittable="true">`;
          const sectionClosingTag = "</div>";

          let currentSectionHtml = sectionHeader.outerHTML;
          currentHeight += sectionHeaderHeight;

          const listOpeningTag = `<${listContainer.tagName.toLowerCase()} class="${
            listContainer.className
          }">`;
          const listClosingTag = `</${listContainer.tagName.toLowerCase()}>`;

          let listItemsHtml = "";

          for (const item of items) {
            const itemHeight = getElementHeight(item);

            if (currentHeight + itemHeight > availableHeight) {
              // If we haven't added any items yet, avoid leaving header alone.
              if (listItemsHtml === "") {
                // push existing current page (if any) and start a fresh page
                if (currentPageHtml) {
                  pagesContent.push(currentPageHtml);
                }
                currentPageHtml = "";
                isFirstPage = false;
                availableHeight = subsequentPageAvailableHeight;

                // Start section on new page with header + this item
                currentSectionHtml = sectionHeader.outerHTML;
                listItemsHtml = item.outerHTML;
                currentHeight = sectionHeaderHeight + itemHeight;
                currentSectionHtml = "";
              } else {
                currentPageHtml +=
                  sectionOpeningTag +
                  currentSectionHtml +
                  listOpeningTag +
                  listItemsHtml +
                  listClosingTag +
                  sectionClosingTag;
                pagesContent.push(currentPageHtml);

                isFirstPage = false;
                availableHeight = subsequentPageAvailableHeight;
                currentPageHtml = "";

                listItemsHtml = item.outerHTML;
                currentHeight = itemHeight;
                currentSectionHtml = "";
              }
            } else {
              listItemsHtml += item.outerHTML;
              currentHeight += itemHeight;
            }
          }

          if (listItemsHtml) {
            currentPageHtml +=
              sectionOpeningTag +
              currentSectionHtml +
              listOpeningTag +
              listItemsHtml +
              listClosingTag +
              sectionClosingTag;
          }
        }

        if (currentPageHtml) {
          pagesContent.push(currentPageHtml);
        }

        if (pagesContent.length === 0 && main.innerHTML) {
          pagesContent.push(main.innerHTML);
        }

        // Mobile-only: always run an aggressive split pass to ensure content
        // that doesn't fit is pushed forward to subsequent pages. This run
        // helps avoid cutting content off on mobile and runs regardless of
        // initial page count.
        if (isMobileView) {
          try {
            const sourceMain = measurementRoot.querySelector("main");
            if (sourceMain) {
              const allNodes = Array.from(sourceMain.children) as HTMLElement[];
              const newPages: string[] = [];
              let currentHtml = "";
              let currentHeightAcc = 0;
              const firstMax = firstPageAvailableHeight;
              const subsequentMax = subsequentPageAvailableHeight;

              const measureElementHeight = (html: string) => {
                const wrapper = document.createElement("div");
                wrapper.style.position = "absolute";
                wrapper.style.left = "-9999px";
                wrapper.style.width = "794px";
                wrapper.innerHTML = html;
                document.body.appendChild(wrapper);
                const h = wrapper.getBoundingClientRect().height;
                document.body.removeChild(wrapper);
                return h;
              };

              let pageMax = firstMax;
              for (const node of allNodes) {
                const nodeHtml = node.outerHTML;
                const nodeH = getElementHeight(node);

                if (currentHeightAcc + nodeH <= pageMax) {
                  currentHtml += nodeHtml;
                  currentHeightAcc += nodeH;
                } else {
                  // If node is a list, try to split its items
                  const list = node.querySelector("ul, ol");
                  if (list && list.children.length > 1) {
                    // build opening/closing tags
                    const opening =
                      node.outerHTML.split(
                        "<" + node.tagName.toLowerCase()
                      )[0] || "";
                    // fallback: split list items
                    const items = Array.from(list.children) as HTMLElement[];
                    let listOpen = `<${list.tagName.toLowerCase()} class="${
                      list.className
                    }">`;
                    let listClose = `</${list.tagName.toLowerCase()}>`;
                    let moved = false;
                    let partialListHtml = "";

                    for (const li of items) {
                      const liH = getElementHeight(li);
                      if (currentHeightAcc + liH <= pageMax) {
                        partialListHtml += li.outerHTML;
                        currentHeightAcc += liH;
                      } else {
                        // push current page
                        currentHtml += node.outerHTML.replace(
                          list.outerHTML,
                          listOpen + partialListHtml + listClose
                        );
                        newPages.push(currentHtml);
                        // start new page and put remaining items there
                        const remainingItems = items
                          .slice(items.indexOf(li))
                          .map((it) => it.outerHTML)
                          .join("");
                        const nodeTag = node.tagName.toLowerCase();
                        const nodeClass = node.className;
                        const remainingHtml = `<${nodeTag} class="${nodeClass}" data-splittable="true">${listOpen}${remainingItems}${listClose}</${nodeTag}>`;
                        currentHtml = remainingHtml;
                        currentHeightAcc = measureElementHeight(remainingHtml);
                        pageMax = subsequentMax;
                        moved = true;
                        break;
                      }
                    }

                    if (!moved) {
                      // all items fit, just append
                      currentHtml += node.outerHTML;
                    }
                  } else {
                    // push current page and start new one with this node
                    if (currentHtml) newPages.push(currentHtml);
                    currentHtml = nodeHtml;
                    currentHeightAcc = nodeH;
                    pageMax = subsequentMax;
                  }
                }
              }

              if (currentHtml) newPages.push(currentHtml);

              if (newPages.length > 1) {
                pagesContent.length = 0;
                for (const p of newPages) pagesContent.push(p);
              }
            }
          } catch (err) {
            console.warn("Aggressive split pass failed", err);
          }
        }

        // Cleanup measurement root we appended earlier.
        if (measurementRoot.parentElement)
          measurementRoot.parentElement.removeChild(measurementRoot);

        // Note: we intentionally avoid pulling items from later pages up to
        // earlier pages on mobile, because that can change section ordering.
        // Instead we only push overflowing content forward (split/move to
        // subsequent pages) so the original sequence of sections is preserved.

        // NOTE: we intentionally avoid moving whole sections forward here
        // because that can change the original section order (e.g. push a
        // splittable section past a non-splittable one). Keep only forward
        // splitting logic (handled earlier) so the source order remains
        // identical on mobile and desktop.

        setPages(pagesContent);
      };

      document.fonts.ready.then(() => {
        setTimeout(calculatePages, 200);
      });
    }, [resumeData]);

    const UploadButton = () => (
      <div className="text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 mx-auto"
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
        <span className="text-sm mt-1">Upload</span>
      </div>
    );

    return (
      <div ref={containerRef} className="flex flex-col items-center gap-8">
        <div
          className="absolute top-0 left-[-9999px] opacity-0"
          aria-hidden="true"
        >
          <ResumePreview resumeData={resumeData} ref={sourceRef} />
        </div>

        {pages.length > 0 ? (
          pages.map((content, index) => (
            <div key={index} className="relative">
              <div
                className={`resume-page-container overflow-hidden bg-white shadow-lg px-10 pb-2 w-[210mm] h-[297mm] flex flex-col text-black leading-relaxed relative ${
                  index === 0 ? "pt-14" : "pt-10"
                }`}
              >
                {index === 0 && (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
                    <hr className="border-t-[3px] border-black mt-4 mb-2 -mx-10" />
                  </>
                )}
                <main
                  className={`text-[15px] flex-grow ${
                    index === 0 ? "pt-2" : "pt-0"
                  }`}
                  style={
                    isMobileView
                      ? { paddingBottom: `${footerHeightPx + 8}px` }
                      : undefined
                  }
                  dangerouslySetInnerHTML={{ __html: content }}
                />

                {/* Footer securely pinned to bottom */}
                <div
                  className="absolute bottom-0 left-0 w-full bg-white z-10"
                  dangerouslySetInnerHTML={{ __html: footerHtml }}
                />
              </div>

              {index === 0 && (
                <>
                  <button
                    onClick={onLogoUploadClick}
                    className={`absolute top-[56px] left-[40px] h-36 w-36 bg-black flex items-center justify-center text-white cursor-pointer group transition-opacity duration-300 
                  ${
                    isPlaceholder(resumeData.personalDetails.logo)
                      ? "bg-opacity-50 opacity-100"
                      : "bg-opacity-40 opacity-50 group-hover:opacity-100"
                  }`}
                    aria-label="Upload new logo"
                  >
                    <UploadButton />
                  </button>
                  <button
                    onClick={onPhotoUploadClick}
                    className={`absolute top-[56px] right-[40px] h-[140px] w-[130px] bg-black flex items-center justify-center text-white cursor-pointer group transition-opacity duration-300 
                  ${
                    isPlaceholder(resumeData.personalDetails.photo)
                      ? "bg-opacity-50 opacity-100"
                      : "bg-opacity-40 opacity-50 group-hover:opacity-100"
                  }`}
                    aria-label="Upload new photo"
                  >
                    <UploadButton />
                  </button>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white shadow-lg w-[210mm] h-[297mm] flex items-center justify-center">
            <p className="text-center p-8 text-gray-500">
              Generating preview...
            </p>
          </div>
        )}
      </div>
    );
  }
);

export default PaginatedResume;
