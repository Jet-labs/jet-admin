import React, { useEffect } from "react";
import { useTenantState } from "../../../logic/contexts/tenantContext";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { TenantStats } from "../../components/tenantComponents/tenantStats";

const HomePage = () => {
  const { tenants, isLoadingTenants, isRefetchingTenants, isFetchingTenants } =
    useTenantState();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      !(isLoadingTenants || isFetchingTenants || isRefetchingTenants) &&
      tenants &&
      tenants.length === 0
    ) {
      navigate(CONSTANTS.ROUTES.ADD_TENANT.path());
    }
  }, [
    tenants,
    isLoadingTenants,
    isFetchingTenants,
    isRefetchingTenants,
    navigate,
  ]);

  return (
    <div className=" bg-gray-50 h-full w-full">
      {tenants && <TenantStats tenants={tenants} />}
    </div>
  );
};

export default HomePage;
