import React, { useEffect } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import logo from "../../../assets/logo.png";

import { CONSTANTS } from "../../../constants";
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/contexts/authContext";
import { MainDrawerList } from "../drawerList/mainDrawerList";
import { Breadcrumbs } from "../ui/breadCrumbs";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { UserAvatar } from "../ui/userAvatar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
export const ProtectedLayout = () => {
  const { firebaseUserState } = useAuthState();
  const { tenantID } = useParams();
  const { getUserConfig } = useAuthActions();

  const navigate = useNavigate();

  useEffect(() => {
    if (tenantID && firebaseUserState && firebaseUserState.user) {
      getUserConfig({ tenantID });
    }
  }, [tenantID, getUserConfig, firebaseUserState]);
  useEffect(() => {
    if (
      firebaseUserState &&
      !firebaseUserState.isLoading &&
      !firebaseUserState.user
    ) {
      navigate(CONSTANTS.ROUTES.SIGN_IN.path());
    }
  }, [firebaseUserState]);

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={!firebaseUserState || firebaseUserState.isLoading}
      error={firebaseUserState.error}
      loadingContainerClass="h-screen w-screen bg-white flex flex-col justify-center items-center"
    >
      <div className="flex h-screen w-screen flex-col justify-start items-stretch overflow-hidden">
        <nav className="w-full  border-b-2 border-[#646cff] bg-white">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start rtl:justify-end">
                <Link to={"/"} className="flex">
                  <img src={logo} className="w-8 h-8"></img>
                  <span className="ml-2 self-center text-xl !font-extrabold whitespace-nowrap text-[#00203e] aldrich-logo">
                    {CONSTANTS.APP_NAME}
                  </span>
                </Link>
              </div>
              <Breadcrumbs />

              {/* <button onClick={signOut}>Logout</button> */}
              <div>
                <UserAvatar />
              </div>
            </div>
          </div>
        </nav>
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.MAIN_DRAWER_LIST_SEPARATION
          }
          className={"h-full"}
        >
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <MainDrawerList />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            <div className="w-full h-[calc(100vh-50px)] overflow-y-auto bg-white">
              <Outlet />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </ReactQueryLoadingErrorWrapper>
  );
};
