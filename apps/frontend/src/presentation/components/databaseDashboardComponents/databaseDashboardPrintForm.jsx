import React from "react";
import { IoMdDownload } from "react-icons/io";
import { displayError } from "../../../utils/notification";

export const DatabaseDashboardPrintForm = ({ databaseDashboardID }) => {
  const getDocumentStyles = () => {
    // Get all style tags
    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((element) => element.outerHTML)
      .join("");

    // Get CSSRules from stylesheets (including CSS-in-JS)
    const sheetStyles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules || [])
            .map((rule) => rule.cssText)
            .join("");
        } catch (e) {
          return "";
        }
      })
      .join("");

    return `${styles}<style>${sheetStyles}</style>`;
  };

  const _handlePrint = () => {
    const elementId = `printable-area-dashboard-${databaseDashboardID}`;
    const content = document.getElementById(elementId);

    if (!content) {
      displayError(`Printable content not found with ID: ${elementId}`);
      return;
    }

    try {
      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        "position:absolute;width:0;height:0;border:0;overflow:hidden;";
      document.body.appendChild(iframe);

      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        displayError("Failed to initialize print frame");
        return;
      }

      // Clone content with styles and inline computed styles
      const clone = content.cloneNode(true);

      // Copy inline styles for all elements
      const copyInlineStyles = (source, target) => {
        const computedStyle = window.getComputedStyle(source);
        Array.from(computedStyle).forEach((prop) => {
          target.style.setProperty(
            prop,
            computedStyle.getPropertyValue(prop),
            computedStyle.getPropertyPriority(prop)
          );
        });
        Array.from(source.children).forEach((child, index) => {
          copyInlineStyles(child, target.children[index]);
        });
      };

      // Create shadow clone for style computation
      const styleClone = content.cloneNode(true);
      copyInlineStyles(content, styleClone);

      iframeDoc.open();
      iframeDoc.write(`
        <html>
          <head>
            <title>Print Preview - ${databaseDashboardID}</title>
            ${getDocumentStyles()}
            <style>
              @media print {
                body { margin: 0; padding: 0; }
                .printable-area { 
                  visibility: visible !important;
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                }
              }
            </style>
          </head>
          <body style="margin: 0">
            <div class="printable-area">
              ${styleClone.innerHTML}
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();

      // Wait for resources to load
      const printInterval = setInterval(() => {
        if (iframeDoc.readyState === "complete") {
          clearInterval(printInterval);
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          // Cleanup after print
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }
      }, 100);
    } catch (error) {
      console.error("Print error:", error);
      displayError("Error generating print preview");
    }
  };

  return (
    <button
      onClick={_handlePrint}
      className="p-1 hover:bg-[#646cff]/10 bg-transparent m-0 flex flex-row justify-center items-center rounded text-xs text-[#646cff] hover:border-[#646cff] hover:border outline-none focus:outline-none"
    >
      <IoMdDownload className="text-[#646cff] h-4 w-4" />
    </button>
  );
};
