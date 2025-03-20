import { Link, useLocation, useParams } from "react-router-dom";

import { useMemo } from "react";
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
      class="h-[calc(100vh-50px)] overflow-y-auto transition-transform bg-white border-r border-slate-200"
      aria-label="Sidebar"
    >
      <div className=" bg-white p-2 w-full overflow-y-auto h-full">
        {drawerList?.map((item) => {
          const isCurrentPage = location.pathname.includes(item.to);

          return (
            <Link to={item.to} key={item.text} className="focus:outline-none ">
              <div
                className={`flex flex-col items-center justify-center w-full rounded mb-2 p-3 ${
                  isCurrentPage
                    ? "bg-[#eaebff]"
                    : "bg-gray-100 hover:bg-[#eaebff]"
                }`}
              >
                <div
                  className={`flex flex-col items-center justify-center ${
                    isCurrentPage ? "text-[#646cff]" : "text-gray-600"
                  }`}
                >
                  {item.icon}
                </div>
                {
                  <p
                    className={`mt-1 text-xs font-semibold ${
                      isCurrentPage ? "text-[#646cff]" : "text-gray-600"
                    }`}
                  >
                    {item.text}
                  </p>
                }
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
