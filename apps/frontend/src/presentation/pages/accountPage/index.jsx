import {
  FaCalendarAlt,
  FaEnvelope,
  FaKey,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/contexts/authContext";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displaySuccess } from "../../../utils/notification";
import { AccountNotificationList } from "../../components/accountComponents/accountNotificationList";

const AccountPage = () => {
  const { user, firebaseUserState } = useAuthState();
  const { signOut, resetPassword } = useAuthActions();
  const { showConfirmation } = useGlobalUI();

  const _handleSignOut = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.ACCOUNT_PAGE_LOGOUT_CONFIRMATION_TITLE,
      message: CONSTANTS.STRINGS.ACCOUNT_PAGE_LOGOUT_CONFIRMATION_MESSAGE,
    });
    signOut();
  };

  const _handleResetPassword = async () => {
    if (!user?.email) return;

    await showConfirmation({
      title:
        CONSTANTS.STRINGS.ACCOUNT_PAGE_PASSWORD_RESET_LINK_CONFIRMATION_TITLE,
      message:
        CONSTANTS.STRINGS.ACCOUNT_PAGE_PASSWORD_RESET_LINK_CONFIRMATION_MESSAGE,
    });

    await resetPassword(user.email);
    displaySuccess(
      CONSTANTS.STRINGS.ACCOUNT_PAGE_PASSWORD_RESET_LINK_SENT_SUCCESS
    );
  };

  return (
    <div className="flex w-full h-full flex-col justify-start items-center overflow-y-auto">
      <section class="max-w-3xl w-full">
        <div class="p-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl ">
            {CONSTANTS.STRINGS.ACCOUNT_PAGE_TITLE || "Your Account"}
          </h1>

          {firebaseUserState?.isLoading ? (
            <div className="flex justify-center items-center mt-10 space-x-6 animate-pulse ">
              <div
                role="status"
                className="flex flex-row justify-start items-center gap-5"
              >
                <div className="bg-slate-50 rounded-full text-slate-400">
                  <FaUserCircle size={48} />
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-start items-start space-y-4">
                <div class="h-6 bg-gray-200 rounded w-full"></div>
                <div class="h-6 bg-gray-200 rounded  w-full"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center items-center mt-10 space-x-6 ">
                <div className="flex flex-row justify-start items-center gap-5">
                  <div className="bg-slate-50 rounded-full text-slate-400">
                    <FaUserCircle size={60} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-start items-start space-y-4">
                  <div className="flex items-center text-slate-500 text-sm">
                    <FaEnvelope className="mr-2 text-slate-400" />
                    <span>{user?.email || "No email available"}</span>
                  </div>
                  <div className="flex items-center text-slate-500 text-sm">
                    <FaCalendarAlt className="mr-2 text-slate-400" />
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
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-slate-200">
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 text-xs font-medium text-[#646cff] bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-[#646cff] focus:ring-opacity-30 transition-colors"
                  onClick={_handleResetPassword}
                >
                  <FaKey className="mr-2 opacity-70" size={14} />
                  Reset Password
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:ring-opacity-30 transition-colors"
                  onClick={_handleSignOut}
                >
                  <FaSignOutAlt className="mr-2 opacity-70" size={14} />
                  {CONSTANTS.STRINGS.ACCOUNT_PAGE_LOGOUT_BUTTON || "Sign Out"}
                </button>
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
