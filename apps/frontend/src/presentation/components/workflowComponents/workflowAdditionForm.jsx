import { useFormik } from "formik";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import { WorkflowEditor } from "./workflowEditor";

export const WorkflowAdditionForm = ({ tenantID }) => {
  WorkflowAdditionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
  };

  const workflowAdditionForm = useFormik({
    initialValues: {
        tenantID,
      title: "",
      nodes: [],
      edges: [],
      workflowConfig: {},
    },
    validationSchema: formValidations.workflowAdditionFormValidationSchema,
    onSubmit: (values) => {
    //   addWorkflow(values);
      console.log(values);
    },
  });
  

   return  <div className="w-full flex flex-col justify-start items-center h-full">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl text-start w-full p-3 border-b border-slate-200">
            {CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_TITLE}
        </h1>
                <form
                    className="w-full h-full "
                    onSubmit={workflowAdditionForm.handleSubmit}
                >
                    <WorkflowEditor workflowEditorForm={workflowAdditionForm} />
                </form>
    </div>
}