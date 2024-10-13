import { useFormik } from "formik";
import { LOCAL_CONSTANTS } from "../../../constants";
export const TableEditor = () => {
  const tableAdditionForm = useFormik({
    initialValues: {
      table_name: LOCAL_CONSTANTS.STRINGS.FORM_FIELD_PLACEHOLDER_UNTITLED,
    },
  });
};
