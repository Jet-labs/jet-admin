import { useParams } from "react-router-dom";
import "./styles.css";
import { RowUpdateForm } from "../../components/RowUpdateForm";
import { LOCAL_CONSTANTS } from "../../constants";
/**
 *
 * @param {object} param0
 * @returns
 */
const PolicyView = ({}) => {
  const { id } = useParams();
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      {id && (
        <RowUpdateForm
          tableName={LOCAL_CONSTANTS.STRINGS.POLICY_OBJECT_TABLE_NAME}
          id={id}
        />
      )}
    </div>
  );
};

export default PolicyView;
