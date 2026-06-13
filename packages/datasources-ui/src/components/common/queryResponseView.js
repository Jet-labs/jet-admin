import { Tabs, TabsList, TabsTrigger, TabsContent } from "@jet-admin/ui";
import React, { useState } from "react";
import { QueryResponseJSONTab } from "./queryResponseJSONTab";
import { QueryResponseRAWTab } from "./queryResponseRawTab";
import { QueryResponseSchemaTab } from "./queryResponseSchemaTab";
import { QueryResponseTableTab } from "./queryResponseTableTab";
import PropTypes from "prop-types";

export const QueryResponseView = ({ queryResult }) => {
  const [activeTab, setActiveTab] = useState("json");

  console.log("queryResult", queryResult);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList>
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
          <TabsTrigger value="schema">Data Schema</TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-y-auto bg-background">
          <TabsContent value="json" className="mt-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
            <QueryResponseJSONTab data={queryResult ? queryResult : ""} />
          </TabsContent>
          <TabsContent value="table" className="mt-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
            <QueryResponseTableTab data={queryResult ? queryResult : ""} />
          </TabsContent>
          <TabsContent value="raw" className="mt-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
            <QueryResponseRAWTab data={queryResult ? queryResult : ""} />
          </TabsContent>
          <TabsContent value="schema" className="mt-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
            <QueryResponseSchemaTab data={queryResult ? queryResult : {}} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

QueryResponseView.propTypes = {
  queryResult: PropTypes.any,
};
