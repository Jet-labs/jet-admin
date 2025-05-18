import React from "react";
import { useParams } from "react-router-dom";
import { AuditLogsGrid } from "../../components/auditLogsComponents/auditLogsGrid";


const ViewAuditLogsPage = () => {
    const { tenantID } = useParams();
  return (
    <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
      <AuditLogsGrid
        tenantID={tenantID}
      />
    </div>
  );
};

export default ViewAuditLogsPage;
