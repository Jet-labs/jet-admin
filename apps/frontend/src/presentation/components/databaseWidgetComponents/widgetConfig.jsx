import { MdOutlineTextFields } from "react-icons/md";
import { CONSTANTS } from "../../../constants";
import { DatabaseTextWidget } from "./databaseTextWidget";
import React from "react";


export const DATABASE_WIDGETS_CONFIG_MAP = {
  text: {
    label: "Text",
    value: CONSTANTS.DATABASE_WIDGET_TYPES.TEXT_WIDGET.value,
    datasetFields: ["text"],
    component: ({
      databaseWidgetName,
      data,
      refetchInterval,
      onWidgetInit,
      databaseWidgetConfig,
    }) => (
      <DatabaseTextWidget
        databaseWidgetName={databaseWidgetName}
        data={data}
        refetchInterval={refetchInterval}
        onWidgetInit={onWidgetInit}
        databaseWidgetConfig={databaseWidgetConfig}
      />
    ),
    icon: <MdOutlineTextFields className="!text-lg" />,
  },
};
