import React from "react";
import { FileText, Plus } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useAppPages } from "../../../../logic/hooks/useAppPages";
import { NoEntityUI } from "../../ui/noEntityUI";
import { Button } from "@jet-admin/ui";

export const AppPageDrawerList = () => {
  const { tenantID } = useParams();
  const { isLoadingAppPages, appPages, isFetchingAppPages } =
    useAppPages(tenantID);
  const routeParam = useParams();
  const navigate = useNavigate();

  const _navigateToAddAppPage = () => {
    navigate(CONSTANTS.ROUTES.ADD_APP_PAGE.path(tenantID));
  };

  return (
    <div className="bg-background flex h-full w-full flex-col gap-2 overflow-hidden">
      <div className="p-2 pb-0">
        <Button
        onClick={_navigateToAddAppPage}
        variant="secondary"
        className="w-full justify-start"
      >
        <Plus className="mr-2 h-4 w-4" />
        {CONSTANTS.STRINGS.ADD_APP_PAGE_BUTTON_TEXT}
      </Button>
      </div>

      {isLoadingAppPages || isFetchingAppPages ? (
        <div role="status" className="animate-pulse w-full space-y-2 p-2">
          <div className="h-9 w-full rounded-md bg-muted" />
          <div className="h-9 w-full rounded-md bg-muted" />
          <div className="h-9 w-full rounded-md bg-muted" />
          <div className="h-9 w-full rounded-md bg-muted" />
        </div>
      ) : appPages && appPages.length > 0 ? (
        <div className="flex-1 w-full overflow-y-auto p-2 pb-10 space-y-1">
          {appPages.map((appPage) => {
            const key = `appPage_${appPage.appPageID}`;
            const isActive = routeParam?.appPageID == appPage.appPageID;

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_APP_PAGE_BY_ID.path(
                  tenantID,
                  appPage.appPageID
                )}
                key={key}
                className="block focus:outline-none"
              >
                <div
                  className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span
                    className={`truncate text-sm ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {appPage.appPageTitle}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
          <NoEntityUI
            message={CONSTANTS.STRINGS.APP_PAGE_DRAWER_LIST_NO_APP_PAGE}
          />
        </div>
      )}
    </div>
  );
};
