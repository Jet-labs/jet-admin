import React from "react";
import { Download } from 'lucide-react';
import { displayError } from "../../../../utils/notification";
import PropTypes from "prop-types";

import { Button } from "@jet-admin/ui";

export const AppPagePrintForm = ({ appPageID }) => {
  const getDocumentStyles = () => {
    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((element) => element.outerHTML)
      .join("");

    const sheetStyles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules || [])
            .map((rule) => rule.cssText)
            .join("");
        } catch (e) {
          console.error("Error accessing CSS rules:", e);
          return "";
        }
      })
      .join("");

    return `${styles}<style>${sheetStyles}</style>`;
  };

  const _handlePrint = () => {
    const elementId = `printable-area-app-page-${appPageID}`;
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

      const styleClone = content.cloneNode(true);
      copyInlineStyles(content, styleClone);

      iframeDoc.open();
      iframeDoc.write(`
        <html>
          <head>
            <title>Print Preview - ${appPageID}</title>
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
            <div className="printable-area">
              ${styleClone.innerHTML}
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();

      const printInterval = setInterval(() => {
        if (iframeDoc.readyState === "complete") {
          clearInterval(printInterval);
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

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
    <Button
      onClick={_handlePrint}
      variant="ghost" size="sm"
      square className="text-primary hover:bg-primary/10"
    >
      <Download className="text-primary h-4 w-4" />
    </Button>
  );
};

AppPagePrintForm.propTypes = {
  appPageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
