import React from "react";
import { QueryResponseJSONTab } from "./queryResponseJSONTab";
import { QueryResponseRAWTab } from "./queryResponseRawTab";
import { QueryResponseSchemaTab } from "./queryResponseSchemaTab";
import { QueryResponseTableTab } from "./queryResponseTableTab";
import PropTypes from "prop-types";
import { QueryResponseWebViewTab } from "./queryResponseWebViewTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@jet-admin/ui";

export const WebViewQueryResponseView = ({ queryResult }) => {
  WebViewQueryResponseView.propTypes = {
    queryResult: PropTypes.object,
  };
  console.log("queryResult", queryResult);
  return (
    <>
      <Tabs defaultValue="web" className="w-full flex flex-col h-full">
        <TabsList>
          <TabsTrigger value="web">Web View</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
          <TabsTrigger value="schema">Data Schema</TabsTrigger>
        </TabsList>
        <div className="w-100 h-full overflow-y-auto pb-5">
          <TabsContent value="web" className="m-0 h-full">
            <QueryResponseWebViewTab data={queryResult ? queryResult : ""} />
          </TabsContent>
          <TabsContent value="json" className="m-0 h-full">
            <QueryResponseJSONTab data={queryResult ? queryResult : ""} />
          </TabsContent>
          <TabsContent value="raw" className="m-0 h-full">
            <QueryResponseRAWTab data={queryResult ? queryResult : ""} />
          </TabsContent>
          <TabsContent value="schema" className="m-0 h-full">
            <QueryResponseSchemaTab data={queryResult ? queryResult : {}} />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
};
