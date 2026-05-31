import { CONSTANTS } from "../../../constants";
import { Calendar, Key, LogOut, Mail, UserCircle } from 'lucide-react';
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/hooks/useAuth";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displaySuccess } from "../../../utils/notification";
import { AccountNotificationList } from "../../components/accountComponents/accountNotificationList";
import React from "react";

import { Button } from "@jet-admin/ui";
const AccountPage = () => {
  const { user, firebaseUserState } = useAuthState();
  const { signOut, resetPassword } = useAuthActions();
  const { showConfirmation } = useGlobalUI();

  const _handleSignOut = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.ACCOUNT_PAGE_LOGOUT_CONFIRMATION_TITLE,
      message: CONSTANTS.STRINGS.ACCOUNT_PAGE_LOGOUT_CONFIRMATION_MESSAGE,
    });
    if (!confirmed) return;
    signOut();
  };

  const _handleResetPassword = async () => {
    if (!user?.email) return;

    const confirmed = await showConfirmation({
      title:
        CONSTANTS.STRINGS.ACCOUNT_PAGE_PASSWORD_RESET_LINK_CONFIRMATION_TITLE,
      message:
        CONSTANTS.STRINGS.ACCOUNT_PAGE_PASSWORD_RESET_LINK_CONFIRMATION_MESSAGE,
    });
    if (!confirmed) return;

    await resetPassword(user.email);
    displaySuccess(
      CONSTANTS.STRINGS.ACCOUNT_PAGE_PASSWORD_RESET_LINK_SENT_SUCCESS
    );
  };

  return (
    <div className="flex w-full h-full flex-col justify-start items-center overflow-y-auto">
      <section className="max-w-3xl w-full">
        <div className="p-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-foreground md:text-2xl ">
            {CONSTANTS.STRINGS.ACCOUNT_PAGE_TITLE || "Your Account"}
          </h1>

          {firebaseUserState?.isLoading ? (
            <div className="flex justify-center items-center mt-10 space-x-6 animate-pulse ">
              <div
                role="status"
                className="flex flex-row justify-start items-center gap-5"
              >
                <div className="bg-background rounded-full text-foreground">
                  <UserCircle size={48} />
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-start items-start space-y-4">
                <div className="h-6 bg-background rounded-sm w-full"></div>
                <div className="h-6 bg-background rounded-sm  w-full"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center items-center mt-10 space-x-6 ">
                <div className="flex flex-row justify-start items-center gap-5">
                  <div className="bg-background rounded-full text-foreground">
                    <UserCircle size={60} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-start items-start space-y-4">
                  <div className="flex items-center text-foreground text-sm">
                    <Mail className="mr-2 text-foreground" />
                    <span>{user?.email || "No email available"}</span>
                  </div>
                  <div className="flex items-center text-foreground text-sm">
                    <Calendar className="mr-2 text-foreground" />
                    <span>
                      {user?.createdAt
                        ? `Account created: ${new Date(
                            user.createdAt
                          ).toLocaleDateString()}`
                        : "Account creation date unavailable"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-border">
                <Button
                  type="button"
                  variant="outline" className="text-xs"
                  onClick={_handleResetPassword}
                >
                  <Key className="mr-2 opacity-70" size={14} />
                  Reset Password
                </Button>

                <Button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 text-xs font-medium text-foreground bg-background border border-border rounded-sm  hover:bg-muted focus:outline-none focus:ring-1 focus:ring-brand-border-mid focus:ring-opacity-30 transition-colors"
                  onClick={_handleSignOut}
                >
                  <LogOut className="mr-2 opacity-70" size={14} />
                  {CONSTANTS.STRINGS.ACCOUNT_PAGE_LOGOUT_BUTTON || "Sign Out"}
                </Button>
              </div>
              <AccountNotificationList />
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default AccountPage;
