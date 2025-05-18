import { Avatar, CircularProgress, Divider } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  getUserTenantByIDAPI,
  updateTenantAPI,
} from "../../../data/apis/tenant";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import moment from "moment";
import { useTenantActions } from "../../../logic/contexts/tenantContext";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { TenantUserAdditionForm } from "../tenantUsersComponents/tenantUserAdditionForm";
import { TenantEditor } from "./tenantEditor";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { TenantDeletionForm } from "./tenantDeletionForm";

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
      tenantName,
      tenantLogoURL,
      tenantDBType,
      tenantDBURL,
    }) =>
      updateTenantAPI({
        tenantID,
        tenantName,
        tenantLogoURL,
        tenantDBType,
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
      tenantName: tenant ? tenant.tenantName : "",
      tenantLogoURL: tenant ? tenant.tenantLogoURL : "",
      tenantDBType: tenant
        ? tenant.tenantDBType
        : CONSTANTS.SUPPORTED_DATABASES.postgresql.name,
    },
    validationSchema: formValidations.updateTenantFormValidationSchema,
    onSubmit: ({
      tenantID,
      tenantName,
      tenantLogoURL,
      tenantDBType,
      tenantDBURL,
    }) => {
      updateTenant({
        tenantID,
        tenantName,
        tenantLogoURL,
        tenantDBType,
        tenantDBURL,
      });
    },
  });

  useEffect(() => {
    if (tenant) {
      updateTenantForm.setFieldValue("tenantID", tenant.tenantID);
      updateTenantForm.setFieldValue("tenantName", tenant.tenantName);
      updateTenantForm.setFieldValue("tenantLogoURL", tenant.tenantLogoURL);
      updateTenantForm.setFieldValue("tenantDBURL", tenant.tenantDBURL);
      updateTenantForm.setFieldValue("tenantDBType", tenant.tenantDBType);
    }
  }, [tenant]);

  const _handleOpenAddTenantUserDialog = () => {
    setIsAddTenantUserDialogOpen(true);
  };
  const _handleCloseAddTenantUserDialog = () => {
    setIsAddTenantUserDialogOpen(false);
  };
  return (
    <div className="flex w-full h-full flex-col justify-start items-center overflow-y-auto">
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingTenant}
        isFetching={isFetchingTenant}
        error={tenantError}
      >
        {tenant && (
          <section className="max-w-3xl w-full">
            <TenantUserAdditionForm
              tenantID={tenant.tenantID}
              onClose={_handleCloseAddTenantUserDialog}
              open={isAddTenantUserDialogOpen}
            />
            <div className="p-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl ">
                {CONSTANTS.STRINGS.UPDATE_TENANT_FORM_TITLE}
              </h1>
              <span className="text-sm font-normal  text-slate-700">
                {`Tenant id: ${tenant.tenantID}`}
              </span>
              <div className="flex flex-row justify-between items-center mt-4 w-full">
                <div className="flex flex-row justify-start items-center">
                  <div className="flex flex-col justify-start items-start">
                    <span className="!text-slate-600 font-semibold text-sm">
                      Created by{" "}
                      {tenant.creator ? tenant.creator.email : "Deleted User"}
                    </span>
                    <span className="!text-slate-600 font-normal text-xs ">
                      {`Tenant created: ${moment(tenant.createdAt).format(
                        "MMM Do YY"
                      )}`}
                    </span>
                  </div>
                </div>
              </div>
              <form
                className="space-y-4 md:space-y-6 mt-4"
                onSubmit={(e) => {
                  e.preventDefault(), updateTenantForm.handleSubmit();
                }}
              >
                <TenantEditor tenantEditorForm={updateTenantForm} />
                <div className="flex flex-row justify-start items-center w-full">
                  <button
                    type="submit"
                    disabled={isUpdatingTenant}
                    className="flex flex-row justify-center items-center px-3 py-1.5 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none focus:ring-blue-300 "
                  >
                    {isUpdatingTenant && (
                      <CircularProgress
                        className="!mr-3"
                        size={16}
                        color="white"
                      />
                    )}
                    {CONSTANTS.STRINGS.UPDATE_TENANT_FORM_SUBMIT_BUTTON}
                  </button>
                  <TenantDeletionForm tenantID={tenantID} />
                </div>

                {/* {JSON.stringify(tenant.relationships)} */}
              </form>
              <div className="mt-6 flex flex-col justify-start items-stretch w-full">
                <span className="!text-slate-700 text-lg font-bold w-full mb-3 mt-4">
                  {CONSTANTS.STRINGS.UPDATE_TENANT_MEMBERS_TITLE}
                </span>
                {tenant.relationships?.map((relationship, index) => {
                  return (
                    <>
                      <div className="flex flex-row justify-between items-center mb-3 w-full">
                        <div className="flex flex-row justify-start items-center">
                          <Avatar
                            alt={relationship.tblUsers.email}
                            src="/broken-image.jpg"
                            sx={{ width: 32, height: 32 }}
                          ></Avatar>
                          <div className="flex flex-col justify-start items-start ml-2">
                            <span className="!text-slate-600 font-semibold text-sm">
                              {relationship.tblUsers.email}
                            </span>
                            <span className="!text-slate-600 font-normal text-xs ">
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
                        <Divider className="!w-full !mb-2" />
                      )}
                    </>
                  );
                })}
                <button
                  type="button"
                  onClick={_handleOpenAddTenantUserDialog}
                  className="w-fit py-1 px-2 mt-8 text-sm flex flex-row items-center font-medium text-slate-600 focus:outline-none bg-white rounded border border-gray-200 hover:bg-gray-100 hover:text-[#646cff]"
                >
                  <PersonAddIcon className="!text-base !me-2" />
                  {CONSTANTS.STRINGS.UPDATE_TENANT_ADD_MEMBERS_BUTTON}
                </button>
              </div>
            </div>
          </section>
        )}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};

