import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { TbMathFunction } from "react-icons/tb";
import { MdChevronRight } from "react-icons/md";
import { getAllFunctionsAPI } from "../../../data/apis/databaseFunction";
import { CONSTANTS } from "../../../constants";
import { extractError } from "../../../utils/error";

const ViewFunctionsPage = () => {
  const { tenantID, databaseSchemaName } = useParams();

  const {
    isLoading,
    data: functions,
    error,
  } = useQuery({
    queryKey: ["DATABASE_FUNCTIONS", tenantID, databaseSchemaName],
    queryFn: () => getAllFunctionsAPI({ tenantID, databaseSchemaName }),
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
        <h3 className="font-semibold mb-1">Error loading functions</h3>
        <p className="text-sm">{extractError(error)}</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-700">Functions</h1>
          <p className="text-sm text-slate-500">
            {functions?.length || 0} functions in {databaseSchemaName} schema
          </p>
        </div>
      </div>

      {functions && functions.length > 0 ? (
        <div className="grid gap-3">
          {functions.map((func) => (
            <Link
              key={func.function_name}
              to={CONSTANTS.ROUTES.VIEW_FUNCTION_BY_NAME.path(
                tenantID,
                databaseSchemaName,
                func.function_name
              )}
              className="block p-4 bg-white border border-slate-200 rounded hover:border-[#646cff] hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#eaebff] rounded">
                    <TbMathFunction size={20} className="text-[#646cff]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-700">
                      {func.function_name}
                      <span className="text-slate-400 font-normal">({func.arguments || ""})</span>
                    </h3>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-slate-400">
                        → {func.return_type}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {func.volatility}
                      </span>
                      <span className="text-xs text-slate-400">
                        {func.language}
                      </span>
                    </div>
                    {func.description && (
                      <p className="text-sm text-slate-500 truncate max-w-md mt-1">
                        {func.description}
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
          <TbMathFunction size={48} className="mb-2 text-slate-300" />
          <p>No functions found in this schema</p>
        </div>
      )}
    </div>
  );
};

export default ViewFunctionsPage;
