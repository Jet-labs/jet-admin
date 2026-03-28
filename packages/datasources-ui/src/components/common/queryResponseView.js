import { Button } from "@jet-admin/ui";
import React, { useState } from "react";
import { QueryResponseJSONTab } from "./queryResponseJSONTab";
import { QueryResponseRAWTab } from "./queryResponseRawTab";
import { QueryResponseSchemaTab } from "./queryResponseSchemaTab";
import { QueryResponseTableTab } from "./queryResponseTableTab";
import PropTypes from "prop-types";

export const QueryResponseView = ({ queryResult }) => {
  const [tab, setTab] = useState(0);

  console.log("queryResult", queryResult);

  return (
    <div className="flex flex-col h-full overflow-hidden p-4">
      <div className="flex items-center">
        {["Table", "JSON", "Raw", "Data Schema"].map((label, index) => (
          <Button
            key={label}
            variant="ghost"
            className={`px-4 mr-2 py-2 text-sm font-medium rounded transition-colors ${
              index === tab
                ? "text-primary bg-primary/5"
                : "text-foreground hover:bg-slate-100"
            }`}
            onClick={() => setTab(index)}
            type="button"
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="p-3 border mt-3 border-border rounded bg-background flex flex-col gap-2 overflow-y-auto flex-1">
        {tab === 0 && (
          <QueryResponseTableTab data={queryResult ? queryResult : ""} />
        )}
        {tab === 1 && (
          <QueryResponseJSONTab data={queryResult ? queryResult : ""} />
        )}
        {tab === 2 && (
          <QueryResponseRAWTab data={queryResult ? queryResult : ""} />
        )}
        {tab === 3 && (
          <QueryResponseSchemaTab data={queryResult ? queryResult : {}} />
        )}
      </div>
    </div>
  );
};

QueryResponseView.propTypes = {
  queryResult: PropTypes.object,
};
