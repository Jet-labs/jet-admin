import { UserPlus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  getUserTenantByIDAPI,
  updateTenantAPI,
} from "../../../data/apis/tenant";


import moment from "moment";
import { useTenantActions } from "../../../logic/contexts/tenantContext";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { TenantUserAdditionForm } from "../tenantUsersComponents/tenantUserAdditionForm";
import { TenantEditor } from "./tenantEditor";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { TenantDeletionForm } from "./tenantDeletionForm";
import { Link } from "react-router-dom";
import { MdOutlineLockPerson } from "react-icons/md";

import { Button, Separator, Spinner } from "@jet-admin/ui";
export const TenantUpdationForm = ({ tenantID }) => {
  TenantUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
  };
  const queryClient = useQueryClient();
  const { saveTenantLocally } = useTenantActions();
  const [isAddTenantUserDialogOpen, setIsAddTenantUserDialogOpen] =
    useState(false);

  const {
    isLoading: isLoadingTenant,
    isFetching: isFetchingTenant,
    data: tenant,
    error: tenantError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANTS, tenantID],
    queryFn: () => getUserTenantByIDAPI({ tenantID }),
    retry: 0,
  });

  const { isPending: isUpdatingTenant, mutate: updateTenant } = useMutation({
    mutationFn: ({
      tenantID,
      tenantTitle,
      tenantLogoURL,
      tenantDBURL,
    }) =>
      updateTenantAPI({
        tenantID,
        tenantTitle,
        tenantLogoURL,
        tenantDBURL,
      }),
    retry: false,
    onSuccess: (tenant) => {
      saveTenantLocally(tenant);
      displaySuccess(CONSTANTS.STRINGS.UPDATE_TENANT_SUCCESS_TOAST);
      queryClient.invalidateQueries([CONSTANTS.REACT_QUERY_KEYS.TENANTS]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const updateTenantForm = useFormik({
    initialValues: {
      tenantID: tenant ? tenant.tenantID : "",
      tenantTitle: tenant ? tenant.tenantTitle : "",
      tenantLogoURL: tenant ? tenant.tenantLogoURL : "",
    },
    validationSchema: formValidations.updateTenantFormValidationSchema,
    onSubmit: ({
      tenantID,
      tenantTitle,
      tenantLogoURL,
      tenantDBURL,
    }) => {
      updateTenant({
        tenantID,
        tenantTitle,
        tenantLogoURL,
        tenantDBURL,
      });
    },
  });

  useEffect(() => {
    if (tenant) {
      updateTenantForm.setFieldValue("tenantID", tenant.tenantID);
      updateTenantForm.setFieldValue("tenantTitle", tenant.tenantTitle);
      updateTenantForm.setFieldValue("tenantLogoURL", tenant.tenantLogoURL);
      updateTenantForm.setFieldValue("tenantDBURL", tenant.tenantDBURL);
    }
  }, [tenant]);

  const _handleOpenAddTenantUserDialog = () => {
    setIsAddTenantUserDialogOpen(true);
  };
  const _handleCloseAddTenantUserDialog = () => {
    setIsAddTenantUserDialogOpen(false);
  };

  return (
    <div className="flex w-full h-full flex-col items-center overflow-y-auto p-4 md:p-6 bg-background text-foreground">

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingTenant}
        isFetching={isFetchingTenant}
        error={tenantError}
      >
        {tenant && (
          <section className="max-w-2xl w-full">
            <TenantUserAdditionForm
              tenantID={tenant.tenantID}
              onClose={_handleCloseAddTenantUserDialog}
              open={isAddTenantUserDialogOpen}
            />
            <div className="space-y-4 mt-3">
              <div className="flex flex-row justify-between items-center w-full">
                <div className="flex flex-col justify-start items-start">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {CONSTANTS.STRINGS.UPDATE_TENANT_FORM_TITLE}
                  </h1>
                  <span className="text-sm font-normal text-muted-foreground">
                    {`Tenant id: ${tenant.tenantID}`}
                  </span>
                </div>

                <Link
                  to={CONSTANTS.ROUTES.VIEW_AUDIT_LOGS.path(tenantID)}
                  key={CONSTANTS.ROUTES.VIEW_AUDIT_LOGS.path(tenantID)}
                  className={`flex items-center rounded-md mb-2 p-2 hover:bg-muted transition duration-75 group flex-row text-sm font-medium`}
                >
                  <MdOutlineLockPerson className={`!text-sm`} />
                  <span className={`ml-2`}>
                    {CONSTANTS.STRINGS.MAIN_DRAWER_AUDIT_LOGS_TITLE}
                  </span>
                </Link>
              </div>

              <div className="flex flex-row justify-between items-center w-full">
                <div className="flex flex-row justify-start items-center">
                  <div className="flex flex-col justify-start items-start">
                    <span className="text-sm font-semibold">
                      Created by{" "}
                      {tenant.creator ? tenant.creator.email : "Deleted User"}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {`Tenant created: ${moment(tenant.createdAt).format(
                        "MMM Do YY"
                      )}`}
                    </span>
                  </div>
                </div>
              </div>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault(), updateTenantForm.handleSubmit();
                }}
              >
                <TenantEditor tenantEditorForm={updateTenantForm} />
                <div className="flex flex-row justify-start items-center w-full">
                  <Button
                    type="submit"
                    disabled={isUpdatingTenant}
                  >
                    {isUpdatingTenant && (
                      <Spinner className="mr-2" size={16} />
                    )}
                    {CONSTANTS.STRINGS.UPDATE_TENANT_FORM_SUBMIT_BUTTON}
                  </Button>
                  <div className="ml-4">
                    <TenantDeletionForm tenantID={tenantID} />
                  </div>
                </div>
              </form>

              <div className="flex flex-col justify-start items-stretch w-full pt-4 border-t border-border">
                <span className="text-lg font-bold w-full mb-3">
                  {CONSTANTS.STRINGS.UPDATE_TENANT_MEMBERS_TITLE}
                </span>
                {tenant.relationships?.map((relationship, index) => {
                  return (
                    <React.Fragment key={relationship.id || index}>
                      <div className="flex flex-row justify-between items-center mb-3 w-full">
                        <div className="flex flex-row justify-start items-center">
                          <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-medium shrink-0">
                            {relationship.tblUsers.email?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="flex flex-col justify-start items-start ml-3">
                            <span className="text-sm font-semibold">
                              {relationship.tblUsers.email}
                            </span>
                            <span className="text-xs font-normal text-muted-foreground">
                              {relationship.role ===
                              CONSTANTS.ROLES.PRIMARY.ADMIN.value
                                ? `Admin from: ${moment(
                                    relationship.createdAt
                                  ).format("MMM Do YY")}`
                                : `Member from: ${moment(
                                    relationship.createdAt
                                  ).format("MMM Do YY")}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      {tenant.relationships.length - 1 > index && (
                        <Separator className="w-full mb-3" />
                      )}
                    </React.Fragment>
                  );
                })}
                <Button
                  type="button"
                  onClick={_handleOpenAddTenantUserDialog}
                  variant="outline"
                  className="mt-4 w-min"
                >
                  <UserPlus className="w-4 h-4 me-2" />
                  {CONSTANTS.STRINGS.UPDATE_TENANT_ADD_MEMBERS_BUTTON}
                </Button>
              </div>
            </div>
          </section>
        )}
      </ReactQueryLoadingErrorWrapper>

    </div>
  );
};

