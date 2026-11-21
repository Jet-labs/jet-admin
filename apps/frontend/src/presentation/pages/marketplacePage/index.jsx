import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@jet-admin/ui";
import { MarketplaceGrid } from "../../components/marketplaceComponents/marketplaceGrid";
import { TemplateGallery } from "../../components/marketplaceComponents/templateGallery";

const MarketplacePage = () => {
  const { tenantID } = useParams();
  const [tab, setTab] = useState("templates");
  return (
    <div className="flex h-full w-full flex-col items-stretch justify-start overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-background px-3 pt-2">
        <Button type="button" size="sm" variant={tab === "templates" ? "default" : "ghost"} onClick={() => setTab("templates")}>
          App templates
        </Button>
        <Button type="button" size="sm" variant={tab === "integrations" ? "default" : "ghost"} onClick={() => setTab("integrations")}>
          Integrations
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "templates" ? <TemplateGallery tenantID={tenantID} /> : <MarketplaceGrid tenantID={tenantID} />}
      </div>
    </div>
  );
};

export default MarketplacePage;
