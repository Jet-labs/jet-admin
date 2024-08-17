import { useFormik } from "formik";
import { useAppConstants } from "../../contexts/appConstantsContext";
const TRIGGER_IMPACT_TIMING = {
  BEFORE: "BEFORE",
  AFTER: "AFTER",
  INSTEAD_OF: "INSTEAD OF",
};

const TRIGGER_EVENT = {
  INSERT: "INSERT",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  TRUNCATE: "TRUNCATE",
};

const TRIGGER_FIRE_METHOD = {
  FOR_EACH_ROW: "FOR EACH ROW",
  FOR_EACH_STATEMENT: "FOR EACH STATEMENT",
};
const AddTrigger = () => {
  const { dbModel } = useAppConstants();
  const triggerBuilderForm = useFormik({
    initialValues: {
      pm_trigger_name: "",
      pm_trigger_table_name: "",
      pm_trigger_timing: TRIGGER_IMPACT_TIMING.AFTER,
      pm_trigger_events: [TRIGGER_EVENT.UPDATE],
      pm_trigger_method: TRIGGER_FIRE_METHOD.FOR_EACH_STATEMENT,
      pm_trigger_condition: "",
      pm_trigger_channel_name: "",
    },
  });
  return <div>hello</div>;
};

export default AddTrigger;
