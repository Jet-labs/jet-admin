import { Collapse } from "@douyinfe/semi-ui";
import { Empty } from "../Empty";
import { SearchBar } from "./SearchBar";
import { RelationshipInfo } from "./RelationshipInfo";
import { useTranslation } from "react-i18next";
import { LOCAL_CONSTANTS } from "../../../../constants";
import {
  useTableSchemaEditorActions,
  useTableSchemaEditorState,
} from "../../../../contexts/tableSchemaEditorContext";

export const RelationshipsTab = () => {
  const { relationships, selectedElement } = useTableSchemaEditorState();
  const { setSelectedElement } = useTableSchemaEditorActions();
  const { t } = useTranslation();

  return (
    <>
      <SearchBar />
      <Collapse
        activeKey={
          selectedElement.open &&
          selectedElement.element ===
            LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.RELATIONSHIP
            ? `${selectedElement.id}`
            : ""
        }
        keepDOM
        lazyRender
        onChange={(k) =>
          setSelectedElement((prev) => ({
            ...prev,
            open: true,
            id: parseInt(k),
            element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.RELATIONSHIP,
          }))
        }
        accordion
      >
        {relationships.length <= 0 ? (
          <Empty
            title={t("no_relationships")}
            text={t("no_relationships_text")}
          />
        ) : (
          relationships.map((r) => <RelationshipInfo key={r.id} data={r} />)
        )}
      </Collapse>
    </>
  );
};
