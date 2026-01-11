import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { MdSettings, MdChevronRight } from "react-icons/md";
import { getAllStoredProceduresAPI } from "../../../data/apis/storedProcedure";
import { CONSTANTS } from "../../../constants";
import { extractError } from "../../../utils/error";

const ViewStoredProceduresPage = () => {
  const { tenantID, databaseSchemaName } = useParams();

  const {
    isLoading,
    data: storedProcedures,
    error,
  } = useQuery({
    queryKey: ["STORED_PROCEDURES", tenantID, databaseSchemaName],
    queryFn: () => getAllStoredProceduresAPI({ tenantID, databaseSchemaName }),
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <CircularProgress size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded m-4">
        <h3 className="font-semibold mb-1">Error loading procedures</h3>
        <p className="text-sm">{extractError(error)}</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-700">Procedures</h1>
          <p className="text-sm text-slate-500">
            {storedProcedures?.length || 0} procedures in {databaseSchemaName} schema
          </p>
          <p className="text-xs text-slate-400 mt-1">
            True PostgreSQL procedures (11+) that use CALL syntax
          </p>
        </div>
      </div>

      {storedProcedures && storedProcedures.length > 0 ? (
        <div className="grid gap-3">
          {storedProcedures.map((proc) => (
            <Link
              key={proc.procedure_name}
              to={CONSTANTS.ROUTES.VIEW_STORED_PROCEDURE_BY_NAME.path(
                tenantID,
                databaseSchemaName,
                proc.procedure_name
              )}
              className="block p-4 bg-white border border-slate-200 rounded-lg hover:border-[#646cff] hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <MdSettings size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-700">
                      {proc.procedure_name}
                      <span className="text-slate-400 font-normal">({proc.arguments || ""})</span>
                    </h3>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                        procedure
                      </span>
                      <span className="text-xs text-slate-400">
                        {proc.language}
                      </span>
                    </div>
                    {proc.description && (
                      <p className="text-sm text-slate-500 truncate max-w-md mt-1">
                        {proc.description}
                      </p>
                    )}
                  </div>
                </div>
                <MdChevronRight size={20} className="text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <MdSettings size={48} className="mb-2 text-slate-300" />
          <p>No procedures found in this schema</p>
          <p className="text-xs text-slate-400 mt-1">Procedures require PostgreSQL 11+</p>
        </div>
      )}
    </div>
  );
};

export default ViewStoredProceduresPage;
