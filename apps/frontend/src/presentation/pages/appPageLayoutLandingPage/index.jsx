import React from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { AppPageViewer } from "../../components/appPageComponents/appPageViewer";

const AppPageLayoutLandingPage = () => {
  const { tenantID } = useParams();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-muted/30 p-6">
      <div className="bg-background p-8 max-w-md text-center rounded-lg border border-border">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-4 rounded-full">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Select an App Page
        </h2>
        <p className="text-muted-foreground mb-4">
          Choose an app page from the sidebar to view or edit it.
        </p>
      </div>
    </div>
  );
};

export default AppPageLayoutLandingPage;
