import { MdOutlinePersonAddAlt } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { TenantRolesList } from "../../components/tenantRolesComponents/tenantRolesList";
const RoleManagementPage = () => {
  const { tenantID } = useParams();

  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full ">
      <div className="flex flex-row items-center justify-between border-b border-slate-200 p-3">
        <h1 className="bg-white !text-xl !font-bold text-slate-700 ">
          {CONSTANTS.STRINGS.TENANT_ROLE_MANAGEMENT_TITLE}
        </h1>
        <Link
          to={CONSTANTS.ROUTES.ADD_TENANT_ROLE.path(tenantID)}
          className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-fit outline-none focus:outline-none"
        >
          <MdOutlinePersonAddAlt className="!text-base !me-2" />
          {CONSTANTS.STRINGS.TENANT_ROLE_MANAGEMENT_ADD_ROLE_BUTTON}
        </Link>
      </div>

      <TenantRolesList />
    </div>
  );
};

export default RoleManagementPage;
