import React, { useEffect, useState } from "react";

import { LOCAL_CONSTANTS } from "../constants";
import { useTableSchemaEditorTransformState } from "./tableSchemaEditorTransformContext";
import { useTheme } from "@mui/material";
import { displaySuccess } from "../utils/notification";

const TableSchemaEditorStateContext = React.createContext(undefined);
const TableSchemaEditorActionsContext = React.createContext(undefined);

const TableSchemaEditorContextProvider = ({ children }) => {
  const theme = useTheme();
  const { transform } = useTableSchemaEditorTransformState();
  const [types, setTypes] = useState([]);
  const [enums, setEnums] = useState([]);
  const [tables, setTables] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [selectedElement, setSelectedElement] = useState({
    element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.NONE,
    id: -1,
    openDialogue: false,
    openCollapse: false,
    currentTab: LOCAL_CONSTANTS.TABLE_EDITOR_TABS.TABLES,
    open: false, // open popover or sidesheet when sidebar is disabled
    openFromToolbar: false, // this is to handle triggering onClickOutside when sidebar is disabled
  });

  const addType = (data, addToHistory = true) => {
    if (data) {
      setTypes((prev) => {
        const temp = prev.slice();
        temp.splice(data.id, 0, data);
        return temp;
      });
    } else {
      setTypes((prev) => [
        ...prev,
        {
          name: `type_${prev.length}`,
          fields: [],
          comment: "",
        },
      ]);
    }
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.ADD,
          element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.TYPE,
          message: { message: "add_type" },
        },
      ]);
      setRedoStack([]);
    }
  };

  const deleteType = (id, addToHistory = true) => {
    if (addToHistory) {
      displaySuccess("Type deleted");
      setUndoStack((prev) => [
        ...prev,
        {
          action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.DELETE,
          element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.TYPE,
          id: id,
          data: types[id],
          message: {
            message: "delete_type",
            meta: {
              typeName: types[id].name,
            },
          },
        },
      ]);
      setRedoStack([]);
    }
    setTypes((prev) => prev.filter((e, i) => i !== id));
  };

  const updateType = (id, values) => {
    setTypes((prev) =>
      prev.map((e, i) => (i === id ? { ...e, ...values } : e))
    );
  };

  const addEnum = (data, addToHistory = true) => {
    if (data) {
      setEnums((prev) => {
        const temp = prev.slice();
        temp.splice(data.id, 0, data);
        return temp;
      });
    } else {
      setEnums((prev) => [
        ...prev,
        {
          name: `enum_${prev.length}`,
          values: [],
        },
      ]);
    }
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.ADD,
          element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.ENUM,
          message: { message: "add_enum" },
        },
      ]);
      setRedoStack([]);
    }
  };

  const deleteEnum = (id, addToHistory = true) => {
    if (addToHistory) {
      displaySuccess("Enum deleted");
      setUndoStack((prev) => [
        ...prev,
        {
          action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.DELETE,
          element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.ENUM,
          id: id,
          data: enums[id],
          message: {
            message: "delete_enum",
            meat: {
              enumName: enums[id].name,
            },
          },
        },
      ]);
      setRedoStack([]);
    }
    setEnums((prev) => prev.filter((_, i) => i !== id));
  };

  const updateEnum = (id, values) => {
    setEnums((prev) =>
      prev.map((e, i) => (i === id ? { ...e, ...values } : e))
    );
  };

  const addTable = (data, addToHistory = true) => {
    if (data) {
      setTables((prev) => {
        const temp = prev.slice();
        temp.splice(data.id, 0, data);
        return temp.map((t, i) => ({ ...t, id: i }));
      });
    } else {
      setTables((prev) => [
        ...prev,
        {
          id: prev.length,
          name: `table_${prev.length}`,
          x: transform.pan.x,
          y: transform.pan.y,
          fields: [
            {
              name: "id",
              // TODO
              type: "INTEGER",
              default: "",
              check: "",
              primary: true,
              unique: true,
              notNull: true,
              increment: true,
              comment: "",
              id: 0,
            },
          ],
          comment: "",
          indices: [],
          color: theme.palette.primary.main,
          key: Date.now(),
        },
      ]);
    }
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.ADD,
          element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.TABLE,
          message: { message: "add_table" },
        },
      ]);
      setRedoStack([]);
    }
  };

  const deleteTable = (id, addToHistory = true) => {
    if (addToHistory) {
      displaySuccess("Table added");
      const rels = relationships.reduce((acc, r) => {
        if (r.startTableId === id || r.endTableId === id) {
          acc.push(r);
        }
        return acc;
      }, []);
      setUndoStack((prev) => [
        ...prev,
        {
          action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.DELETE,
          element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.TABLE,
          data: { table: tables[id], relationship: rels },
          message: {
            message: "delete_table",
            meta: { tableName: tables[id].name },
          },
        },
      ]);
      setRedoStack([]);
    }
    setRelationships((prevR) => {
      return prevR
        .filter((e) => !(e.startTableId === id || e.endTableId === id))
        .map((e, i) => {
          const newR = { ...e };

          if (e.startTableId > id) {
            newR.startTableId = e.startTableId - 1;
          }
          if (e.endTableId > id) {
            newR.endTableId = e.endTableId - 1;
          }

          return { ...newR, id: i };
        });
    });
    setTables((prev) => {
      return prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, id: i }));
    });
    if (id === selectedElement.id) {
      setSelectedElement((prev) => ({
        ...prev,
        element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.NONE,
        id: -1,
        open: false,
      }));
    }
  };

  const updateTable = (id, updatedValues) => {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedValues } : t))
    );
  };

  const updateField = (tid, fid, updatedValues) => {
    setTables((prev) =>
      prev.map((table, i) => {
        if (tid === i) {
          return {
            ...table,
            fields: table.fields.map((field, j) =>
              fid === j ? { ...field, ...updatedValues } : field
            ),
          };
        }
        return table;
      })
    );
  };

  const deleteField = (field, tid, addToHistory = true) => {
    if (addToHistory) {
      const rels = relationships.reduce((acc, r) => {
        if (
          (r.startTableId === tid && r.startFieldId === field.id) ||
          (r.endTableId === tid && r.endFieldId === field.id)
        ) {
          acc.push(r);
        }
        return acc;
      }, []);
      setUndoStack((prev) => [
        ...prev,
        {
          action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.EDIT,
          element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.TABLE,
          component: "field_delete",
          tid: tid,
          data: {
            field: field,
            relationship: rels,
          },
          message: {
            message: "edit_table",
            meta: {
              tableName: tables[tid].name,
              extra: "[delete field]",
            },
          },
        },
      ]);
      setRedoStack([]);
    }
    setRelationships((prev) => {
      const temp = prev
        .filter(
          (e) =>
            !(
              (e.startTableId === tid && e.startFieldId === field.id) ||
              (e.endTableId === tid && e.endFieldId === field.id)
            )
        )
        .map((e, i) => {
          if (e.startTableId === tid && e.startFieldId > field.id) {
            return {
              ...e,
              startFieldId: e.startFieldId - 1,
              id: i,
            };
          }
          if (e.endTableId === tid && e.endFieldId > field.id) {
            return {
              ...e,
              endFieldId: e.endFieldId - 1,
              id: i,
            };
          }
          return { ...e, id: i };
        });
      return temp;
    });
    updateTable(tid, {
      fields: tables[tid].fields
        .filter((e) => e.id !== field.id)
        .map((t, i) => {
          return { ...t, id: i };
        }),
    });
  };

  const addRelationship = (data, addToHistory = true) => {
    if (addToHistory) {
      setRelationships((prev) => {
        setUndoStack((prevUndo) => [
          ...prevUndo,
          {
            action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.ADD,
            element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.RELATIONSHIP,
            data: data,
            message: { message: "add_relationship" },
          },
        ]);
        setRedoStack([]);
        return [...prev, data];
      });
    } else {
      setRelationships((prev) => {
        const temp = prev.slice();
        temp.splice(data.id, 0, data);
        return temp.map((t, i) => ({ ...t, id: i }));
      });
    }
  };

  const deleteRelationship = (id, addToHistory = true) => {
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.DELETE,
          element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.RELATIONSHIP,
          data: relationships[id],
          message: {
            message: "delete_relationship",
            meta: {
              refName: relationships[id].name,
            },
          },
        },
      ]);
      setRedoStack([]);
    }
    setRelationships((prev) =>
      prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, id: i }))
    );
  };

  return (
    <TableSchemaEditorStateContext.Provider
      value={{
        types,
        enums,
        tables,
        relationships,
        selectedElement,
        undoStack,
        redoStack,
      }}
    >
      <TableSchemaEditorActionsContext.Provider
        value={{
          setTypes,
          addType,
          updateType,
          deleteType,
          setEnums,
          addEnum,
          updateEnum,
          deleteEnum,
          setTables,
          addTable,
          updateTable,
          updateField,
          deleteField,
          deleteTable,
          setRelationships,
          addRelationship,
          deleteRelationship,
          setSelectedElement,
          setUndoStack,
          setRedoStack,
        }}
      >
        {children}
      </TableSchemaEditorActionsContext.Provider>
    </TableSchemaEditorStateContext.Provider>
  );
};

const useTableSchemaEditorState = () => {
  const context = React.useContext(TableSchemaEditorStateContext);
  if (context === undefined) {
    throw new Error("useTableSchemaEditorState error");
  }

  return context;
};

const useTableSchemaEditorActions = () => {
  const context = React.useContext(TableSchemaEditorActionsContext);
  if (context === undefined) {
    throw new Error("useTableSchemaEditorActions error");
  }

  return context;
};

export {
  TableSchemaEditorActionsContext,
  TableSchemaEditorContextProvider,
  TableSchemaEditorStateContext,
  useTableSchemaEditorActions,
  useTableSchemaEditorState,
};
