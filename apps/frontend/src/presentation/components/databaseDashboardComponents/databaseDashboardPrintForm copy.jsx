import React from "react";
import { IoMdDownload } from "react-icons/io";
import { displayError } from "../../../utils/notification";

export const DatabaseDashboardPrintForm = ({ databaseDashboardID }) => {
  const _handlePrint = () => {
    const elementId = `printable-area-dashboard-${databaseDashboardID}`;

    const content = document.getElementById(elementId);
    if (!content) {
      console.error("Printable content not found with ID:", elementId);
      displayError(`Printable content not found with ID: ${elementId}`);
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      displayError(
        "Pop-up blocker might be preventing the print window from opening!"
      );
      return;
    }

    try {
      // Clone the content including all child nodes
      const clone = content.cloneNode(true);

      // Build print document
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Preview - ${databaseDashboardID}</title>
            ${document.head.innerHTML}
            <style>
              @media print {
                body { visibility: hidden; }
                .printable-area { visibility: visible; position: absolute; left: 0; top: 0; }
              }
              @media screen {
                body { background: white; padding: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="printable-area">
      `);

      // Append cloned content
      printWindow.document.body.appendChild(clone);

      printWindow.document.write(`
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    } catch (error) {
      console.error("Print error:", error);
      printWindow.close();
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
