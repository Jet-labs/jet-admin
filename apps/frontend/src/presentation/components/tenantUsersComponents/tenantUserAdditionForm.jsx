import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { displayError, displaySuccess } from "../../../utils/notification";
import { CONSTANTS } from "../../../constants";
import { addUserToTenantAPI } from "../../../data/apis/userManagement";
import { formValidations } from "../../../utils/formValidation";

export const TenantUserAdditionForm = ({ tenantID, open, onClose }) => {
  const queryClient = useQueryClient();
  const {
    isPending: isAddingMemberToTenant,
    isSuccess: isAddingMemberToTenantSuccess,
    isError: isAddingMemberToTenantError,
    error: addUserToTenantError,
    mutate: addUserToTenant,
  } = useMutation({
    mutationFn: ({ tenantID, tenantUserEmail }) =>
      addUserToTenantAPI({ tenantID, tenantUserEmail }),
    retry: false,
    onSuccess: (tenant) => {
      displaySuccess(CONSTANTS.STRINGS.ADD_MEMBER_TO_TENANT_SUCCESS_TOAST);
      queryClient.invalidateQueries([CONSTANTS.REACT_QUERY_KEYS.TENANTS]);
      onClose();
    },
    onError: (error) => {
      console.log({ error });
      displayError(error);
    },
  });
  const addUserToTenantForm = useFormik({
    initialValues: {
      tenantID: tenantID,
      tenantUserEmail: "",
    },
    validationSchema: formValidations.addUserToTenantFormValidationSchema,
    onSubmit: ({ tenantID, tenantUserEmail }) => {
      addUserToTenant({ tenantID, tenantUserEmail });
    },
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <>
        <DialogTitle className="!p-4 !pb-0 ">
          {CONSTANTS.STRINGS.ADD_MEMBER_TO_TENANT_DIALOG_TITLE}
        </DialogTitle>
        <DialogContent className="!p-4 !space-y-4">
          <span className="text-sm font-normal text-gray-600">
            {CONSTANTS.STRINGS.ADD_MEMBER_TO_TENANT_DIALOG_DESCRIPTION}
          </span>
          <form
            class="space-y-4 md:space-y-6"
            // onSubmit={addUserToTenantForm.handleSubmit}
          >
            <div>
              <label
                for="tenantUserEmail"
                className="block text-xs text-slate-500 mb-1"
              >
                {
                  CONSTANTS.STRINGS
                    .ADD_MEMBER_TO_TENANT_DIALOG_FORM_MEMBER_EMAIL_LABEL
                }
              </label>
              <input
                type="tenantUserEmail"
                name="tenantUserEmail"
                id="tenantUserEmail"
                class=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                placeholder={
                  CONSTANTS.STRINGS
                    .ADD_MEMBER_TO_TENANT_DIALOG_FORM_MEMBER_EMAIL_PLACEHOLDER
                }
                required={true}
                onChange={addUserToTenantForm.handleChange}
                onBlur={addUserToTenantForm.handleBlur}
                value={addUserToTenantForm.values.tenantUserEmail}
              />
            </div>
          </form>
        </DialogContent>
        <DialogActions className="!p-4">
          <button
            onClick={onClose}
            type="button"
            className={`px-2.5 py-1.5 text-sm !text-slate-600 border-0 hover:border-0 !border-slate-300 bg-slate-200 hover:!bg-slate-300 rounded  hover:outline-none  outline-none `}
          >
            {CONSTANTS.STRINGS.ADD_MEMBER_TO_TENANT_DIALOG_FORM_CANCEL_BUTTON}
          </button>

          <button
            onClick={addUserToTenantForm.handleSubmit}
            disabled={isAddingMemberToTenant}
            className={`px-2.5 py-1.5 text-white text-sm bg-[#646cff] rounded hover:outline-none hover:border-0 border-0 outline-none flex flex-row items-center justify-center`}
          >
            {isAddingMemberToTenant ? (
              <CircularProgress className="!text-white" size={19} />
            ) : (
              CONSTANTS.STRINGS.ADD_MEMBER_TO_TENANT_DIALOG_FORM_SUBMIT_BUTTON
            )}
          </button>
        </DialogActions>
      </>
    </Dialog>
  );
};
