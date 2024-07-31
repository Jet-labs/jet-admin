import { Input, Button, Popover, Checkbox, Select } from "@douyinfe/semi-ui";
import { IconMore, IconDeleteStroked } from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { LOCAL_CONSTANTS } from "../../../../constants";
import {
  useTableSchemaEditorActions,
  useTableSchemaEditorState,
} from "../../../../contexts/tableSchemaEditorContext";

export const IndexDetails = ({ data, fields, iid, tid }) => {
  const { t } = useTranslation();
  const { tables } = useTableSchemaEditorState();
  const { setUndoStack, setRedoStack, updateTable } =
    useTableSchemaEditorActions();
  const [editField, setEditField] = useState({});

  return (
    <div className="flex justify-between items-center mb-2">
      <Select
        placeholder={t("select_fields")}
        multiple
        validateStatus={data.fields.length === 0 ? "error" : "default"}
        optionList={fields}
        className="w-full"
        value={data.fields}
        onChange={(value) => {
          setUndoStack((prev) => [
            ...prev,
            {
              action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.EDIT,
              element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.TABLE,
              component: "index",
              tid: tid,
              iid: iid,
              undo: {
                fields: [...data.fields],
              },
              redo: {
                fields: [...value],
              },
              message: t("edit_table", {
                tableName: tables[tid].name,
                extra: "[index field]",
              }),
            },
          ]);
          setRedoStack([]);
          updateTable(tid, {
            indices: tables[tid].indices.map((index) =>
              index.id === iid
                ? {
                    ...index,
                    fields: [...value],
                  }
                : index
            ),
          });
        }}
      />
      <Popover
        content={
          <div className="px-1 popover-theme">
            <div className="font-semibold mb-1">{t("name")}: </div>
            <Input
              value={data.name}
              placeholder={t("name")}
              validateStatus={data.name.trim() === "" ? "error" : "default"}
              onFocus={() =>
                setEditField({
                  name: data.name,
                })
              }
              onChange={(value) =>
                updateTable(tid, {
                  indices: tables[tid].indices.map((index) =>
                    index.id === iid
                      ? {
                          ...index,
                          name: value,
                        }
                      : index
                  ),
                })
              }
              onBlur={(e) => {
                if (e.target.value === editField.name) return;
                setUndoStack((prev) => [
                  ...prev,
                  {
                    action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.EDIT,
                    element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.TABLE,
                    component: "index",
                    tid: tid,
                    iid: iid,
                    undo: editField,
                    redo: { name: e.target.value },
                    message: t("edit_table", {
                      tableName: tables[tid].name,
                      extra: "[index]",
                    }),
                  },
                ]);
                setRedoStack([]);
              }}
            />
            <div className="flex justify-between items-center my-3">
              <div className="font-medium">{t("unique")}</div>
              <Checkbox
                value="unique"
                checked={data.unique}
                onChange={(checkedValues) => {
                  setUndoStack((prev) => [
                    ...prev,
                    {
                      action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.EDIT,
                      element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.TABLE,
                      component: "index",
                      tid: tid,
                      iid: iid,
                      undo: {
                        [checkedValues.target.value]:
                          !checkedValues.target.checked,
                      },
                      redo: {
                        [checkedValues.target.value]:
                          checkedValues.target.checked,
                      },
                      message: t("edit_table", {
                        tableName: tables[tid].name,
                        extra: "[index field]",
                      }),
                    },
                  ]);
                  setRedoStack([]);
                  updateTable(tid, {
                    indices: tables[tid].indices.map((index) =>
                      index.id === iid
                        ? {
                            ...index,
                            [checkedValues.target.value]:
                              checkedValues.target.checked,
                          }
                        : index
                    ),
                  });
                }}
              ></Checkbox>
            </div>
            <Button
              icon={<IconDeleteStroked />}
              type="danger"
              block
              onClick={() => {
                setUndoStack((prev) => [
                  ...prev,
                  {
                    action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.EDIT,
                    element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.TABLE,
                    component: "index_delete",
                    tid: tid,
                    data: data,
                    message: t("edit_table", {
                      tableName: tables[tid].name,
                      extra: "[delete index]",
                    }),
                  },
                ]);
                setRedoStack([]);
                updateTable(tid, {
                  indices: tables[tid].indices
                    .filter((e) => e.id !== iid)
                    .map((e, j) => ({
                      ...e,
                      id: j,
                    })),
                });
              }}
            >
              {t("delete")}
            </Button>
          </div>
        }
        trigger="click"
        position="rightTop"
        showArrow
      >
        <Button
          icon={<IconMore />}
          type="tertiary"
          style={{ marginLeft: "12px" }}
        />
      </Popover>
    </div>
  );
};
