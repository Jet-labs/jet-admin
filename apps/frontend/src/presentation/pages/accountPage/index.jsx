import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FaCalendarAlt, FaRegClipboard, FaSignOutAlt } from "react-icons/fa";
import { GiEmptyHourglass } from "react-icons/gi";
import { RiArrowRightLine } from "react-icons/ri";
import { SiGoogleforms } from "react-icons/si";
import { Link } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { getCustomerPlanAPI } from "../../../data/api/customer-plan";
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/context/auth-context";
import { ConfirmationDialog } from "../../components/UI/confirmation-dialog";
import { Spinner } from "../../components/ui/spinner";
const AccountPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthState();
  const { signOut } = useAuthActions();
  const [isSignOutConfirmationOpen, setIsSignOutConfirmationOpen] =
    useState(false);

  const {
    isLoading: isLoadingCustomerPlan,
    isFetching: isFetchingCustomerPlan,
    data: customerPlan,
    error: customerPlanError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.CUSTOMER_PLAN],
    queryFn: getCustomerPlanAPI,
    enabled: Boolean(user),
    retry: 3,
    staleTime: 0,
  });

  const _handleOpenSignOutConfirmation = () => {
    setIsSignOutConfirmationOpen(true);
  };
  const _handleCloseSignOutConfirmation = () => {
    setIsSignOutConfirmationOpen(false);
  };

  const _handleSignOut = () => {
    setIsSignOutConfirmationOpen(false);
    signOut();
  };

  return (
    <div className="w-full flex flex-col justify-start items-center p-8">
      <div className="2xl:w-4/5 xl:w-5/6 lg:w-3/4 md:w-full flex-col justify-start items-center p-4">
        {user && (
          <>
            <span className="text-lg font-bold mb-8  text-slate-800">
              Account details
            </span>
            <div className="flex flex-row justify-between items-center  mt-4">
              <p className="text-slate-700">
                <span className="font-medium">{user.email}</span>
              </p>
            </div>
          </>
        )}
        {/* <hr className="mb-4" /> */}
        {isLoadingCustomerPlan || isFetchingCustomerPlan ? (
          <div className="flex flex-row items-center justify-start w-full mt-5">
            <Spinner />
            <p className="text-slate-500 font-base text-base font-semibold ml-2">
              Loading your plan details...
            </p>
          </div>
        ) : customerPlanError ? (
          <div className="flex flex-col items-center justify-center w-full p-5 mt-5 bg-slate-50 border border-dashed border-slate-300 rounded">
            <GiEmptyHourglass className="text-6xl text-slate-400" />
            <p className="text-slate-500 font-base text-sm mt-4">
              You haven't purchased any plan yet.
            </p>
            <Link
              type="submit"
              to={CONSTANTS.ROUTES.PLANS.path()}
              class="px-3 py-2 mt-4 text-xs font-medium text-center text-blue-700 rounded hover:bg-blue-100 flex flex-row justify-center items-center"
            >
              <span className="!text-sm">Purchase our affordable plans</span>
              <RiArrowRightLine className="!text-sm ml-2" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-start justify-start w-full mt-10">
            <h3 className="text-xl font-bold text-slate-800">Plan Details</h3>
            <div className="flex flex-col space-y-4 p-6 bg-white  border border-slate-200 rounded mt-4 w-full">
              {/* Form submission Balance */}
              <div className="flex flex-row items-center">
                <SiGoogleforms className="text-blue-500 text-xl mr-3" />
                <div className="flex flex-col">
                  <span className="text-slate-700 font-medium text-sm">
                    Form submission balance
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {customerPlan?.formSubmissionBalance || "N/A"}
                  </span>
                </div>
              </div>

              {/* Form Balance */}
              <div className="flex flex-row items-center">
                <FaRegClipboard className="text-green-500 text-xl mr-3" />
                <div className="flex flex-col">
                  <span className="text-slate-700 font-medium text-sm">
                    Form creation balance
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {customerPlan?.formBalance || "N/A"}
                  </span>
                </div>
              </div>

              {/* Purchased Date */}
              <div className="flex flex-row items-center">
                <FaCalendarAlt className="text-yellow-500 text-xl mr-3" />
                <div className="flex flex-col">
                  <span className="text-slate-700 font-medium text-sm">
                    Purchased Date
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {new Date(customerPlan?.createdAt).toLocaleDateString() ||
                      "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          className="mt-10 text-blue-600  hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-3 py-1 text-center"
          onClick={_handleOpenSignOutConfirmation}
        >
          <div className="flex flex-row justify-start items-center">
            <span className="text-sm">Log out</span>
            <FaSignOutAlt className="!text-sm !ml-2" />
          </div>
        </button>
      </div>

      <ConfirmationDialog
        open={isSignOutConfirmationOpen}
        onAccepted={_handleSignOut}
        onDecline={_handleCloseSignOutConfirmation}
        title="Sign out"
        message="Are you sure you want to sign out?"
      />
    </div>
  );
};

export default AccountPage;
