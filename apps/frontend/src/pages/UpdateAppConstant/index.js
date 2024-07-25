import { useParams } from "react-router-dom";
import "./styles.css";
import { RowUpdateForm } from "../../components/DataGridComponents/RowUpdateForm";
import { LOCAL_CONSTANTS } from "../../constants";
/**
 *
 * @param {object} param0
 * @returns
 */
const UpdateAppConstant = ({}) => {
  const { id } = useParams();
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      {id && (
        <RowUpdateForm
          tableName={LOCAL_CONSTANTS.STRINGS.APP_CONSTANTS_TABLE_NAME}
          customTitle={`Update App Constant`}
          id={id}
        />
      )}
    </div>
  );
};

export default UpdateAppConstant;
