import { CONSTANTS } from "../../../constants";
import React from "react";
import PropTypes from "prop-types";
import { Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from "@jet-admin/ui";
import { AppPageWidgetList } from "./appPageWidgetList";
import { AppPageDataSourcesEditor } from "./appPageDataSourcesEditor";
import { AppPageVariablesEditor } from "./appPageVariablesEditor";

/**
 * Inner component for Title and Description configuration
 */
export const AppPageSettingsEditor = ({ appPageEditorForm }) => {
  AppPageSettingsEditor.propTypes = {
    appPageEditorForm: PropTypes.object.isRequired,
  };
  return (
    <div className="w-full space-y-2 p-2">
      <div className="space-y-2">
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
      <div className="space-y-1.5">
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

/**
 * Main unified editor panel for AppPage sidebars
 */
export const AppPageEditor = ({ appPageEditorForm, tenantID, onAddWidget }) => {
  AppPageEditor.propTypes = {
    appPageEditorForm: PropTypes.object.isRequired,
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onAddWidget: PropTypes.func.isRequired,
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <Tabs defaultValue="widgets" className="flex flex-col h-full w-full">
        <TabsList>
          <TabsTrigger value="widgets" className="text-[11px] font-semibold py-2">Widgets</TabsTrigger>
          <TabsTrigger value="datasources" className="text-[11px] font-semibold py-2">Data</TabsTrigger>
          <TabsTrigger value="variables" className="text-[11px] font-semibold py-2">Vars</TabsTrigger>
          <TabsTrigger value="settings" className="text-[11px] font-semibold py-2">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="widgets" className="flex-1 min-h-0 m-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden overflow-hidden">
          <AppPageWidgetList
            tenantID={tenantID}
            placedWidgets={appPageEditorForm.values.appPageConfig.widgets}
            onAddWidget={onAddWidget}
            appPageEditorForm={appPageEditorForm}
          />
        </TabsContent>
        
        <TabsContent value="datasources" className="flex-1 min-h-0 m-0 data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden overflow-hidden">
          <AppPageDataSourcesEditor appPageEditorForm={appPageEditorForm} />
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

