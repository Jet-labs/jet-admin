import React from "react";
import { CodeEditor } from "@jet-admin/ui";
import PropTypes from "prop-types";

export const QueryResponseJSONTab = ({ data }) => {
  QueryResponseJSONTab.propTypes = {
    data: PropTypes.object,
  };
  return (
    <div className="w-100 flex-grow h-full overflow-y-auto pb-5">
      <CodeEditor
        value={JSON.stringify(data, null, 2)}
        language="json"
        readOnly
        showHeader={false}
        height="100%"
        className="rounded-none border-b border-t-0 border-x-0 !h-full border-slate-200"
      />
    </div>
  );
};
