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

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-500">{message}</p>;
}

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
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
        <form
          className="flex flex-col bg-brand-dark"
          onSubmit={addUserToTenantForm.handleSubmit}
          noValidate
        >
          <DialogHeader className="p-4 border-b border-border bg-muted/20">
            <DialogTitle className="text-base font-semibold uppercase font-mono text-[10px] tracking-widest text-muted-foreground mb-1">
              {CONSTANTS.STRINGS.ADD_MEMBER_TO_TENANT_DIALOG_TITLE}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0">
              {CONSTANTS.STRINGS.ADD_MEMBER_TO_TENANT_DIALOG_DESCRIPTION}
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tenantUserEmail">
                {
                  CONSTANTS.STRINGS
                    .ADD_MEMBER_TO_TENANT_DIALOG_FORM_MEMBER_EMAIL_LABEL
                }{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                type="email"
                name="tenantUserEmail"
                id="tenantUserEmail"
                placeholder={
                  CONSTANTS.STRINGS
                    .ADD_MEMBER_TO_TENANT_DIALOG_FORM_MEMBER_EMAIL_PLACEHOLDER
                }
                required
                onChange={addUserToTenantForm.handleChange}
                onBlur={addUserToTenantForm.handleBlur}
                value={addUserToTenantForm.values.tenantUserEmail}
              />
              <FieldError message={addUserToTenantForm.touched.tenantUserEmail && addUserToTenantForm.errors.tenantUserEmail} />
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-border bg-muted/5 gap-2">
            <Button
              onClick={onClose}
              type="button"
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isAddingMemberToTenant}
            >
              {isAddingMemberToTenant && <Spinner className="mr-2" size={14} />}
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
