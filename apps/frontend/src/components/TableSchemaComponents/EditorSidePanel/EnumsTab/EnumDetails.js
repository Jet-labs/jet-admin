import { useState } from "react";
import { Button, Input, TagInput } from "@douyinfe/semi-ui";
import { IconDeleteStroked } from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";
import {
  useTableSchemaEditorActions,
  useTableSchemaEditorState,
} from "../../../../contexts/tableSchemaEditorContext";
import { LOCAL_CONSTANTS } from "../../../../constants";

export const EnumDetails = ({ data, i }) => {
  const { t } = useTranslation();
  const { deleteEnum } = useTableSchemaEditorState();
  const { setUndoStack, setRedoStack, updateEnum } =
    useTableSchemaEditorActions();
  const [editField, setEditField] = useState({});

  return (
    <>
      <div className="flex justify-center items-center gap-2">
        <div className="font-semibold">{t("Name")}: </div>
        <Input
          value={data.name}
          placeholder={t("name")}
          validateStatus={data.name.trim() === "" ? "error" : "default"}
          onChange={(value) => updateEnum(i, { name: value })}
          onFocus={(e) => setEditField({ name: e.target.value })}
          onBlur={(e) => {
            if (e.target.value === editField.name) return;
            setUndoStack((prev) => [
              ...prev,
              {
                action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.EDIT,
                element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.ENUM,
                id: i,
                undo: editField,
                redo: { name: e.target.value },
                message: t("edit_enum", {
                  enumName: e.target.value,
                  extra: "[name]",
                }),
              },
            ]);
            setRedoStack([]);
          }}
        />
      </div>
      <TagInput
        separator={[",", ", ", " ,"]}
        value={data.values}
        addOnBlur
        className="my-2"
        placeholder={t("values")}
        validateStatus={data.values.length === 0 ? "error" : "default"}
        onChange={(v) => updateEnum(i, { values: v })}
        onFocus={() => setEditField({ values: data.values })}
        onBlur={() => {
          if (JSON.stringify(editField.values) === JSON.stringify(data.values))
            return;
          setUndoStack((prev) => [
            ...prev,
            {
              action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.EDIT,
              element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.ENUM,
              id: i,
              undo: editField,
              redo: { values: data.values },
              message: t("edit_enum", {
                enumName: data.name,
                extra: "[values]",
              }),
            },
          ]);
          setRedoStack([]);
        }}
      />
      <Button
        block
        icon={<IconDeleteStroked />}
        type="danger"
        onClick={() => deleteEnum(i, true)}
      >
        {t("delete")}
      </Button>
    </>
  );
};
