import { Divider, Grid } from "@mui/material";
import { SimpleTableComponent } from "../SimpleTableComponent";

export const TableWidgetComponent = ({ data, title }) => {
  return (
    <div className="!flex !flex-col !justify-start !items-stretch">
      {title && (
        <div
          style={{ height: 30 }}
          className="flex flex-row justify-start items-center w-full px-1"
        >
          <span className="!text-sm !font-semibold">{title}</span>
        </div>
      )}

      <SimpleTableComponent data={data} border={true} />
    </div>
  );
};
