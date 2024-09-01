import { useTheme } from "@mui/material";
import { PGSQLSchemaBuilder } from "../../components/TableSchemaComponents/PSSQLSchemaEditor";

const SQLEditor = () => {
  const theme = useTheme();
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      <div
        className="flex flex-col items-start justify-start p-3 "
        style={{
          background: theme.palette.background.default,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <span className="text-lg font-bold text-start">{`PG SQL editor`}</span>
      </div>

      <PGSQLSchemaBuilder />
    </div>
  );
};

export default SQLEditor;
