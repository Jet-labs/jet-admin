import React, { useEffect } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import logo from "../../../assets/logo.png";

import {
  useAuthActions,
  useAuthState,
} from "../../../logic/contexts/authContext";
import { MainDrawerList } from "../drawerList/mainDrawerList";
import { Spinner } from "../ui/spinner";
import { UserAvatar } from "../ui/userAvatar";
import { CONSTANTS } from "../../../constants";
import { Breadcrumbs } from "../ui/breadCrumbs";
export const ProtectedLayout = () => {
  const { firebaseUserState } = useAuthState();
  const { tenantID } = useParams();
  const { signOut, getUserConfig } = useAuthActions();
  const location = useLocation();

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

  if (!firebaseUserState || firebaseUserState.isLoading)
    return (
      <div className="flex h-screen w-screen flex-col justify-center items-center overflow-hidden">
        <Spinner />
      </div>
    );

  return (
    <div className="flex h-screen w-screen flex-col justify-start items-stretch overflow-hidden">
      <nav class="w-full  border-b-2 border-[#646cff] bg-white">
        <div class="px-3 py-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center justify-start rtl:justify-end">
              <Link to={"/"} class="flex">
                <img src={logo} className="w-8 h-8"></img>
                <span class="ml-2 self-center text-xl !font-extrabold whitespace-nowrap text-[#00203e] aldrich-logo">
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
      <div class="flex w-full flex-grow flex-row justify-start items-start h-[calc(100vh-50px)]">
        <MainDrawerList />
        <div class="w-full h-[calc(100vh-50px)] overflow-y-auto bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
