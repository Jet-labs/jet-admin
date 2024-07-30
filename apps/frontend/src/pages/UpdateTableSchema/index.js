import { TableSchemaEditor } from "../../components/TableSchemaComponents/TableSchemaEditor";
import { TableSchemaEditorContextProvider } from "../../contexts/tableSchemaEditorContext";
import { TableSchemaEditorTransformContextProvider } from "../../contexts/tableSchemaEditorTransformContext";

const UpdateTableSchema = () => {
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      <TableSchemaEditorTransformContextProvider>
        <TableSchemaEditorContextProvider>
          <TableSchemaEditor />
        </TableSchemaEditorContextProvider>
      </TableSchemaEditorTransformContextProvider>
    </div>
  );
};

export default UpdateTableSchema;
