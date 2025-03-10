import { useEffect } from "react";
import { useTenantState } from "../../../logic/contexts/tenantContext";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";

const HomePage = () => {
  const { tenants, isLoadingTenants, isRefetchingTenants, isFetchingTenants } =
    useTenantState();
  const navigate = useNavigate();

  // useEffect(() => {
  //   console.log({
  //     tenants,
  //     isLoadingTenants,
  //     isRefetchingTenants,
  //     isFetchingTenants,
  //   });
  //   if (
  //     !(isLoadingTenants || isFetchingTenants || isRefetchingTenants) &&
  //     tenants &&
  //     tenants.length == 0
  //   ) {
  //     navigate(CONSTANTS.ROUTES.ADD_TENANT.path());
  //   }
  // }, [tenants]);

  return <div>hi</div>;
};

export default HomePage;
