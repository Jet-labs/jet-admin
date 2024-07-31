import { useState } from "react";
import { AutoComplete } from "@douyinfe/semi-ui";
import { IconSearch } from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";
import { LOCAL_CONSTANTS } from "../../../../constants";
import {
  useTableSchemaEditorActions,
  useTableSchemaEditorState,
} from "../../../../contexts/tableSchemaEditorContext";

export const SearchBar = () => {
  const [searchText, setSearchText] = useState("");
  const { relationships } = useTableSchemaEditorState();
  const { setSelectedElement } = useTableSchemaEditorActions();
  const { t } = useTranslation();

  const [filteredResult, setFilteredResult] = useState(
    relationships.map((t) => t.name)
  );

  const handleStringSearch = (value) => {
    setFilteredResult(
      relationships.map((t) => t.name).filter((i) => i.includes(value))
    );
  };

  return (
    <AutoComplete
      data={filteredResult}
      value={searchText}
      showClear
      prefix={<IconSearch />}
      placeholder={t("search")}
      emptyContent={<div className="p-3 popover-theme">{t("not_found")}</div>}
      onSearch={(v) => handleStringSearch(v)}
      onChange={(v) => setSearchText(v)}
      onSelect={(v) => {
        const { id } = relationships.find((t) => t.name === v);
        setSelectedElement((prev) => ({
          ...prev,
          id: id,
          open: true,
          element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.RELATIONSHIP,
        }));
        document
          .getElementById(`scroll_ref_${id}`)
          .scrollIntoView({ behavior: "smooth" });
      }}
      className="w-full"
    />
  );
};
