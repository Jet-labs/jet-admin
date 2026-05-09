import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { materialCells, materialRenderers } from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import { WIDGET_ADVANCED_OPTIONS } from "@jet-admin/widget-types";
import { customJSONFormRenderers } from "../ui/jsonFormCustomRenderer";

export const WidgetAdvancedOptions = ({ widgetForm, parentWidgetType }) => {
  WidgetAdvancedOptions.propTypes = {
    widgetForm: PropTypes.object.isRequired,
    parentWidgetType: PropTypes.string.isRequired,
  };

  const currentOptionsConfig = WIDGET_ADVANCED_OPTIONS[parentWidgetType];

  const handleChange = useCallback(({ data }) => {
    // Update only the 'widgetConfig.options' field in Formik's state
    widgetForm.setFieldValue("widgetConfig.options", data);
  }, [widgetForm]);

  if (!currentOptionsConfig) {
    return null;
  }

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-sm font-semibold text-foreground">
        Advanced Options
      </h3>
      <JsonForms
        schema={currentOptionsConfig.schema}
        uischema={currentOptionsConfig.uischema}
        data={widgetForm.values.widgetConfig?.options || {}}
        renderers={[...materialRenderers, ...customJSONFormRenderers]}
        cells={materialCells}
        onChange={handleChange}
      />
    </div>
  );
};
