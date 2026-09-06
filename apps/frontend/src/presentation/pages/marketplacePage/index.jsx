import React from "react";
import { useParams } from "react-router-dom";
import { MarketplaceGrid } from "../../components/marketplaceComponents/marketplaceGrid";

const MarketplacePage = () => {
  const { tenantID } = useParams();
  return (
    <div className="flex w-full h-full overflow-hidden flex-col justify-start items-stretch">
      <MarketplaceGrid tenantID={tenantID} />
    </div>
  );
};

export default MarketplacePage;
