import { Dialog, DialogContent } from "@mui/material";
import { PGSQLQueryBuilder } from "../QueryBuilderComponents/PGSQLQueryBuilder";

export const QueryTestingDialog = ({ onDecline, onAccepted, open, query }) => {
  return (
    <Dialog
      open={open}
      onClose={onDecline}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="md"
      fullWidth
    >
      <DialogContent dividers className="!py-3">
        <PGSQLQueryBuilder value={query.pm_query} args={query.pm_query_args} />
      </DialogContent>
    </Dialog>
  );
};
