import { Tabs, TabPane } from "@douyinfe/semi-ui";
import { RelationshipsTab } from "./RelationshipsTab/RelationshipsTab";
// import { TypesTab } from "./TypesTab/TypesTab";

import { TablesTab } from "./TablesTab/TablesTab";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { EnumsTab } from "./EnumsTab/EnumsTab";
import {
  useTableSchemaEditorActions,
  useTableSchemaEditorState,
} from "../../../contexts/tableSchemaEditorContext";
import { LOCAL_CONSTANTS } from "../../../constants";

export const SidePanel = ({ width, resize, setResize }) => {
  const { selectedElement, database } = useTableSchemaEditorState();
  const { setSelectedElement } = useTableSchemaEditorActions();
  const { t } = useTranslation();

  const tabList = useMemo(() => {
    const tabs = [
      {
        tab: t("tables"),
        itemKey: LOCAL_CONSTANTS.TABLE_EDITOR_TABS.TABLES,
        component: <TablesTab />,
      },
      {
        tab: t("relationships"),
        itemKey: LOCAL_CONSTANTS.TABLE_EDITOR_TABS.RELATIONSHIPS,
        component: <RelationshipsTab />,
      },
      // {
      //   tab: t("types"),
      //   itemKey: LOCAL_CONSTANTS.TABLE_EDITOR_TABS.TYPES,
      //   component: <TypesTab />,
      // },
      {
        tab: t("enums"),
        itemKey: LOCAL_CONSTANTS.TABLE_EDITOR_TABS.ENUMS,
        component: <EnumsTab />,
      },
    ];

    return tabs;
  }, [t, database]);

  return (
    <div className="flex h-full">
      <div
        className="flex flex-col h-full relative border-r border-color"
        style={{ width: `${width}px` }}
      >
        <div className="h-full flex-1 overflow-y-auto">
          <Tabs
            type="card"
            activeKey={selectedElement.currentTab}
            lazyRender
            onChange={(key) =>
              setSelectedElement((prev) => ({ ...prev, currentTab: key }))
            }
            collapsible
          >
            {tabList.length &&
              tabList.map((tab) => (
                <TabPane tab={tab.tab} itemKey={tab.itemKey} key={tab.itemKey}>
                  <div className="p-2">{tab.component}</div>
                </TabPane>
              ))}
          </Tabs>
        </div>
        {/* {layout.issues && (
          <div className="mt-auto border-t-2 border-color shadow-inner">
            <Issues />
          </div>
        )} */}
      </div>
      <div
        className={`flex justify-center items-center p-1 h-auto hover-2 cursor-col-resize ${
          resize && "bg-semi-grey-2"
        }`}
        onPointerDown={(e) => e.isPrimary && setResize(true)}
      >
        <div className="w-1 border-x border-color h-1/6" />
      </div>
    </div>
  );
};
