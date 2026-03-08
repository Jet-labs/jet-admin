import { useFormik } from "formik";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Spinner,
} from "@jet-admin/ui";
import { CONSTANTS } from "../../../constants";
import { addUserToTenantAPI } from "../../../data/apis/userManagement";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";

export const TenantUserAdditionForm = ({ tenantID, open, onClose }) => {
  TenantUserAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
  };
  const queryClient = useQueryClient();
  const { isPending: isAddingMemberToTenant, mutate: addUserToTenant } =
    useMutation({
      mutationFn: ({ tenantID, tenantUserEmail }) =>
        addUserToTenantAPI({ tenantID, tenantUserEmail }),
      retry: false,
      onSuccess: () => {
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
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-md p-4">
        <form className="space-y-4" onSubmit={addUserToTenantForm.handleSubmit}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-sm font-semibold">
              {CONSTANTS.STRINGS.ADD_MEMBER_TO_TENANT_DIALOG_TITLE}
            </DialogTitle>
            <DialogDescription>
              {CONSTANTS.STRINGS.ADD_MEMBER_TO_TENANT_DIALOG_DESCRIPTION}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="tenantUserEmail">
              {
                CONSTANTS.STRINGS
                  .ADD_MEMBER_TO_TENANT_DIALOG_FORM_MEMBER_EMAIL_LABEL
              }
            </Label>
            <Input
              type="email"
              name="tenantUserEmail"
              id="tenantUserEmail"
              placeholder={
                CONSTANTS.STRINGS
                  .ADD_MEMBER_TO_TENANT_DIALOG_FORM_MEMBER_EMAIL_PLACEHOLDER
              }
              required={true}
              onChange={addUserToTenantForm.handleChange}
              onBlur={addUserToTenantForm.handleBlur}
              value={addUserToTenantForm.values.tenantUserEmail}
            />
            {addUserToTenantForm.touched.tenantUserEmail &&
              addUserToTenantForm.errors.tenantUserEmail && (
                <p className="text-xs text-red-500">
                  {addUserToTenantForm.errors.tenantUserEmail}
                </p>
              )}
          </div>

          <DialogFooter className="gap-2">
            <Button onClick={onClose} type="button" variant="outline">
              {CONSTANTS.STRINGS.ADD_MEMBER_TO_TENANT_DIALOG_FORM_CANCEL_BUTTON}
            </Button>

            <Button type="submit" disabled={isAddingMemberToTenant}>
              {isAddingMemberToTenant && <Spinner className="mr-2" size={16} />}
              {CONSTANTS.STRINGS.ADD_MEMBER_TO_TENANT_DIALOG_FORM_SUBMIT_BUTTON}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
