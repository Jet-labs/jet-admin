import React from "react";
import { TbCloudDataConnection } from "react-icons/tb";

const ListenerLayoutLandingPage = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-brand-dark text-center p-6">
      <div className="flex flex-col items-center gap-3 max-w-sm">
        <div className="rounded-lg bg-muted p-4">
          <TbCloudDataConnection className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-base font-semibold text-foreground">Listeners</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Select a listener from the sidebar to view its configuration, or
          create a new one to start ingesting real-time events from your data
          sources.
        </p>
      </div>
    </div>
  );
};

export default ListenerLayoutLandingPage;
