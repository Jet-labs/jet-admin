import React from "react";
import { CodeEditor } from "@jet-admin/ui";
import "react-data-grid/lib/styles.css";
import jsonSchemaGenerator from "to-json-schema";
import PropTypes from "prop-types";

export const QueryResponseSchemaTab = ({ data }) => {
  QueryResponseSchemaTab.propTypes = {
    data: PropTypes.object,
  };
  const dataSchema = jsonSchemaGenerator(
    data ? data : { arrays: { mode: "all" } }
  );
  return (
    <div className="w-100 flex-grow h-full overflow-y-auto ">
      <CodeEditor
        value={JSON.stringify(dataSchema, null, 2)}
        language="json"
        readOnly
        showHeader={false}
        height="100%"
        className="rounded-none border-b border-t-0 border-x-0 !h-full border-slate-200"
      />
    </div>
  );
};
