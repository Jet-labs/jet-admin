import { useParams } from "react-router-dom"
import { TenantUserUpdationForm } from "../../components/ui/tenantUserUpdationForm"

const UpdateTenantUserByIDPage = () =>{
    const {tenantID,tenantUserID} = useParams();
    return (
      <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
        <TenantUserUpdationForm
          tenantID={tenantID}
          tenantUserID={tenantUserID}
        />
      </div>
    );
}

export default UpdateTenantUserByIDPage