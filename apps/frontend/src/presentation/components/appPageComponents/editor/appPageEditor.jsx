import { CONSTANTS } from "../../../../constants";
import React from "react";
import PropTypes from "prop-types";
import { Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from "@jet-admin/ui";
import { Braces, Database, History, LayoutGrid, Settings } from "lucide-react";
import { AppPageWidgetList } from "./appPageWidgetList";
import { AppPageWidgetVersionsEditor } from "./appPageWidgetVersionsEditor";
import { AppPageDataSourcesEditor } from "./appPageDataSourcesEditor";
import { AppPageVariablesEditor } from "./appPageVariablesEditor";

export const AppPageSettingsEditor = ({ appPageEditorForm }) => {
  return (
    <div className="w-full flex flex-col gap-2 p-2">
      <div className="flex flex-col space-y-1">
        <Label htmlFor="appPageTitle">
          {CONSTANTS.STRINGS.APP_PAGE_EDITOR_FORM_NAME_FIELD_LABEL}
        </Label>
        <Input
          type="text"
          name="appPageTitle"
          id="appPageTitle"
          className="w-full"
          placeholder={
            CONSTANTS.STRINGS.APP_PAGE_EDITOR_FORM_NAME_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={appPageEditorForm.handleChange}
          onBlur={appPageEditorForm.handleBlur}
          value={appPageEditorForm.values.appPageTitle}
        />
      </div>
      <div className="flex flex-col space-y-1">
        <Label htmlFor="appPageDescription">
          {CONSTANTS.STRINGS.APP_PAGE_EDITOR_FORM_DESCRIPTION_FIELD_LABEL}
        </Label>
        <Input
          type="text"
          name="appPageDescription"
          id="appPageDescription"
          className="w-full"
          placeholder={
            CONSTANTS.STRINGS
              .APP_PAGE_EDITOR_FORM_DESCRIPTION_FIELD_PLACEHOLDER
          }
          onChange={appPageEditorForm.handleChange}
          onBlur={appPageEditorForm.handleBlur}
          value={appPageEditorForm.values.appPageDescription}
        />
      </div>
    </div>
  );
};

AppPageSettingsEditor.propTypes = {
  appPageEditorForm: PropTypes.object.isRequired,
};

export const AppPageEditor = ({
  appPageEditorForm,
  tenantID,
  onAddWidget,
  applicationVariables = null,
  applicationTitle = null,
}) => {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <Tabs defaultValue="widgets" className="flex flex-col h-full w-full">
        <TabsList className="grid h-auto w-full grid-cols-5 gap-0.5 p-1">
          <TabsTrigger value="widgets" className="flex min-w-0 flex-col gap-1 px-0.5 py-1.5 text-[9px] font-medium leading-none" title="Widgets">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="w-full truncate text-center">Widgets</span>
          </TabsTrigger>
          <TabsTrigger value="widget-versions" className="flex min-w-0 flex-col gap-1 px-0.5 py-1.5 text-[9px] font-medium leading-none" title="Widget versions">
            <History className="h-3.5 w-3.5" />
            <span className="w-full truncate text-center">Versions</span>
          </TabsTrigger>
          <TabsTrigger value="datasources" className="flex min-w-0 flex-col gap-1 px-0.5 py-1.5 text-[9px] font-medium leading-none" title="Data sources">
            <Database className="h-3.5 w-3.5" />
            <span className="w-full truncate text-center">Data</span>
          </TabsTrigger>
          <TabsTrigger value="variables" className="flex min-w-0 flex-col gap-1 px-0.5 py-1.5 text-[9px] font-medium leading-none" title="Page variables">
            <Braces className="h-3.5 w-3.5" />
            <span className="w-full truncate text-center">Vars</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex min-w-0 flex-col gap-1 px-0.5 py-1.5 text-[9px] font-medium leading-none" title="Page settings">
            <Settings className="h-3.5 w-3.5" />
            <span className="w-full truncate text-center">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="widgets" className="flex-1 min-h-0 m-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden overflow-hidden">
          <AppPageWidgetList
            tenantID={tenantID}
            placedWidgets={appPageEditorForm.values.appPageConfig.widgets}
            onAddWidget={onAddWidget}
            appPageEditorForm={appPageEditorForm}
          />
        </TabsContent>

        <TabsContent value="widget-versions" className="flex-1 min-h-0 m-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden overflow-y-auto">
          <AppPageWidgetVersionsEditor appPageEditorForm={appPageEditorForm} />
        </TabsContent>

        <TabsContent value="datasources" className="flex-1 min-h-0 m-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden overflow-hidden">
          <AppPageDataSourcesEditor
            appPageEditorForm={appPageEditorForm}
            applicationVariables={applicationVariables}
            applicationTitle={applicationTitle}
          />
        </TabsContent>

        <TabsContent value="variables" className="flex-1 min-h-0 m-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden overflow-hidden">
          <AppPageVariablesEditor appPageEditorForm={appPageEditorForm} />
        </TabsContent>

        <TabsContent value="settings" className="flex-1 min-h-0 m-0 overflow-y-auto">
          <AppPageSettingsEditor appPageEditorForm={appPageEditorForm} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

AppPageEditor.propTypes = {
  appPageEditorForm: PropTypes.object.isRequired,
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onAddWidget: PropTypes.func.isRequired,
  applicationVariables: PropTypes.object,
  applicationTitle: PropTypes.string,
};
