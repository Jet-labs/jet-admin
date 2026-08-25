import React from "react";
import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "@/constants";
import { getAllLibraryWidgetsAPI } from "@/data/apis/platform";
import { PageHeader } from "@jet-admin/ui";
import { WidgetLibraryTable } from "./widgetLibraryTable";

/**
 * Curate the shared widget marketplace: publish bundles, review entries,
 * unpublish.
 */
export const WidgetLibraryPage = () => {
  const { data: entries, isLoading } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGET_LIBRARY],
    queryFn: getAllLibraryWidgetsAPI,
  });

  const count = entries?.length ?? 0;

  return (
    <div className="flex h-full w-full flex-col">
      <PageHeader
        title="Widget library"
        parentTitle="Platform Admin"
        subTitle={
          isLoading
            ? undefined
            : count === 0
              ? "Nothing published yet"
              : `${count} published widget${count === 1 ? "" : "s"}`
        }
      />
      <div className="flex-1 overflow-y-auto p-2">
        <WidgetLibraryTable entries={entries} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default WidgetLibraryPage;
