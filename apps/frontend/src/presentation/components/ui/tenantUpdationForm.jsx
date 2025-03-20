import { Avatar, CircularProgress, Divider } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import {
    getUserTenantByIDAPI,
    updateTenantAPI,
} from "../../../data/apis/tenant";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import moment from "moment";
import { useTenantActions } from "../../../logic/contexts/tenantContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { TenantUserAdditionForm } from "../../components/ui/tenantUserAdditionForm";
import { TenantEditor } from "./tenantEditor";
export const TenantUpdationForm = ({tenantID}) => {
  
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

  const {
    isPending: isUpdatingTenant,
    isSuccess: isUpdatingTenantSuccess,
    isError: isUpdatingTenantError,
    error: updateTenantError,
    mutate: updateTenant,
  } = useMutation({
    mutationFn: ({ tenantID, tenantName, tenantLogoURL, tenantDBURL }) =>
      updateTenantAPI({ tenantID, tenantName, tenantLogoURL, tenantDBURL }),
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
    },
    validate: ({ tenantName, tenantLogoURL }) => {
      const errors = {};
      if (!tenantName || String(tenantName).trim().length == 0) {
        errors.tenantName = "Tenant name is required";
      }
      if (!tenantLogoURL || String(tenantLogoURL).trim().length == 0) {
        errors.tenantLogoURL = "Tenant logo is required";
      }
    },
    onSubmit: ({ tenantID, tenantName, tenantLogoURL, tenantDBURL }) => {
      updateTenant({ tenantID, tenantName, tenantLogoURL, tenantDBURL });
    },
  });

  useEffect(() => {
    if (tenant) {
      updateTenantForm.setFieldValue("tenantID", tenant.tenantID);
      updateTenantForm.setFieldValue("tenantName", tenant.tenantName);
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
    <div className="flex w-full h-full flex-col justify-start items-center overflow-y-auto">
      {tenant ? (
        <section class="max-w-3xl w-full">
          <TenantUserAdditionForm
            tenantID={tenant.tenantID}
            onClose={_handleCloseAddTenantUserDialog}
            open={isAddTenantUserDialogOpen}
          />
          <div class="p-6 sm:p-8">
            <h1 class="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl ">
              {CONSTANTS.STRINGS.UPDATE_TENANT_FORM_TITLE}
            </h1>
            <span class="text-sm font-normal  text-slate-700">
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
            {/* <div className="flex flex-row justify-start items-stretch mt-4">
              {updateTenantForm?.values?.tenantLogoURL ? (
                <TenantLogo
                  src={updateTenantForm.values.tenantLogoURL}
                  height={100}
                  width={100}
                  className="!w-12 !h-12 !rounded !border-slate-300 !border mr-3"
                />
              ) : null}
              <LogoUpload
                isUploadingLogo={isUploadingLogo}
                uploadError={uploadLogoError}
                onLogoUpload={_handleLogoUpload}
              />
            </div> */}
            <form
              class="space-y-4 md:space-y-6 mt-4"
              onSubmit={(e) => {
                e.preventDefault(), updateTenantForm.handleSubmit();
              }}
            >
              <TenantEditor tenantEditorForm={updateTenantForm} />

              <button
                type="submit"
                disabled={isUpdatingTenant}
                class="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none focus:ring-blue-300 "
              >
                {isUpdatingTenant && (
                  <CircularProgress
                    className="!text-sm !mr-3"
                    size={20}
                    color="white"
                  />
                )}
                {CONSTANTS.STRINGS.UPDATE_TENANT_FORM_SUBMIT_BUTTON}
              </button>

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
                class="w-fit py-1 px-2 mt-8 text-sm flex flex-row items-center font-medium text-slate-600 focus:outline-none bg-white rounded border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 "
              >
                <PersonAddIcon className="!text-base !me-2" />
                {CONSTANTS.STRINGS.UPDATE_TENANT_ADD_MEMBERS_BUTTON}
              </button>
            </div>
          </div>
        </section>
      ) : tenantError ? (
        <div className="p-3 w-full">
          <div
            class="p-4 text-sm text-blue-800 rounded bg-blue-50"
            role="alert"
          >
            <span class="font-medium">
              {CONSTANTS.STRINGS.NO_PERMISSION_TO_VIEW_TENANT_TITLE}
            </span>
            {"  "}
            <span class="font-normal">
              {CONSTANTS.STRINGS.NO_PERMISSION_TO_VIEW_TENANT_DESCRIPTION}
            </span>
          </div>
        </div>
      ) : (
        <div className="m-10">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

