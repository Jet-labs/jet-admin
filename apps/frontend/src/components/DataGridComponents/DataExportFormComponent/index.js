import { Button } from "@mui/material";
import { LOCAL_CONSTANTS } from "../../../constants";
import { ConfirmationDialog } from "../../ConfirmationDialog";

export const DataExportFormComponent = ({
  filterQuery,
  sortModel,
  selectedRowIDs,
}) => {
  return (
    <>
      <Button
        onClick={_handleOpenDeleteRowsConfirmation}
        startIcon={<IoTrash className="!text-sm" />}
        size="medium"
        variant="outlined"
        className="!ml-2"
        color="error"
      >
        {LOCAL_CONSTANTS.STRINGS.EXPORT_BUTTON_TEXT}
      </Button>
    </>
  );
};
