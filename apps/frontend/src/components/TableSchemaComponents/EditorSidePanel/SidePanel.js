import { Tabs, TabPane } from "@douyinfe/semi-ui";
import { RelationshipsTab } from "./RelationshipsTab/RelationshipsTab";
import { TablesTab } from "./TablesTab/TablesTab";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { EnumsTab } from "./EnumsTab/EnumsTab";
import {
  useTableSchemaEditorActions,
  useTableSchemaEditorState,
} from "../../../contexts/tableSchemaEditorContext";
import { LOCAL_CONSTANTS } from "../../../constants";

export const SidePanel = () => {
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
      <div className="flex flex-col h-full relative border-r border-color w-full">
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
    </div>
  );
};
