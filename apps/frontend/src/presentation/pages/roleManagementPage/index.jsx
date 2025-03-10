import { MdOutlinePersonAddAlt } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { TenantRolesList } from "../../components/ui/tenantRolesList";
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
          className="w-fit py-1 px-2 text-sm flex flex-row items-center font-medium text-slate-600 focus:outline-none bg-white rounded border border-gray-200 hover:bg-gray-100 hover:text-[#646cffaf] focus:z-10 focus:ring-4 focus:ring-gray-100 hover:border-[#646cffaf]"
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
