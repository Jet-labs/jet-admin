import React from "react";
import { useParams } from "react-router-dom";
import { MarketplaceGrid } from "../../components/marketplaceComponents/marketplaceGrid";

const MarketplacePage = () => {
  const { tenantID } = useParams();
  return (
    <div className="flex h-full w-full flex-col items-stretch justify-start overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">
        <MarketplaceGrid tenantID={tenantID} />
      </div>
    </div>
  );
};

export default MarketplacePage;
