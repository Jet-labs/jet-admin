import { Link, useLocation, useParams } from "react-router-dom";

import React, { useMemo } from "react";
import { FaDatabase } from "react-icons/fa";
import { VscGithubAction } from "react-icons/vsc";
import { CONSTANTS } from "../../../../constants";

export const DatabaseSchemaDrawerList = () => {
  const location = useLocation();
  const { databaseSchemaName, tenantID } = useParams();
  const drawerList = useMemo(() => {
    return [
      {
        text: "Tables",
        icon: <FaDatabase size={24} className="!text-sm" />,
        to: CONSTANTS.ROUTES.VIEW_DATABASE_TABLES.path(
          tenantID,
          databaseSchemaName
        ),
      },
      {
        text: "Triggers",
        icon: <VscGithubAction size={24} className="!text-sm" />,
        to: CONSTANTS.ROUTES.VIEW_DATABASE_TRIGGERS.path(
          tenantID,
          databaseSchemaName
        ),
      },
    ];
  }, [tenantID, databaseSchemaName]);

  return (
    <aside
      id="logo-sidebar"
      className="h-full overflow-y-auto transition-transform bg-background border-r border-border"
      aria-label="Sidebar"
    >
      <div className="p-2 w-full overflow-y-auto h-full">
        {drawerList?.map((item) => {
          const isCurrentPage = location.pathname.includes(item.to);

          return (
            <Link to={item.to} key={item.text} className="focus:outline-none block mb-2">
              <div
                className={`flex flex-col items-center justify-center w-full rounded-md p-3 transition-colors ${
                  isCurrentPage
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex flex-col items-center justify-center">
                  {item.icon}
                </div>
                <p className="mt-2 text-xs font-medium">
                  {item.text}
                </p>
              </div>
            </Link>
          );
        })}
        {/* <span className="absolute bottom-0 py-2 text-center text-xs font-bold text-gray-600">
          Version {CONSTANTS.APP_NAME}
        </span> */}
      </div>
    </aside>
  );
};
