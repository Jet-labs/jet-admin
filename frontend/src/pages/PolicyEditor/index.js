import { Divider } from "@mui/material";
import { RawDatagrid } from "../../components/RawDataGrid";
import { useAuthState } from "../../contexts/authContext";

const PolicyEditor = () => {
  const { pmUser } = useAuthState();

  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full ">
      <div className="lg:w-2/3 md:w-4/5 text-lg font-bold mt-3 text-start w-full  pb-2 px-4">{`Policies`}</div>
      <Divider className="!w-full" />

      <RawDatagrid
        showStats={false}
        tableName={"tbl_pm_policy_objects"}
        containerClass="!mt-2 !w-full !h-max !lg:w-2/3 !md:w-4/5"
      />
    </div>
  );
};

export default PolicyEditor;
