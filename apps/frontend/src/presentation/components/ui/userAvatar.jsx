import { Link, useNavigate } from "react-router-dom";

import {
  useAuthActions,
  useAuthState,
} from "../../../logic/contexts/authContext";
import { CONSTANTS } from "../../../constants";

export const UserAvatar = () => {
  const { user } = useAuthState();
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const _navigateToAccountPage = () => {
    navigate(CONSTANTS.ROUTES.ACCOUNT.path());
  };

  return (
    <>
      <Link
        onClick={signOut}
        class="relative cursor-pointer inline-flex items-center justify-center w-6 h-6 overflow-hidden bg-slate-100 rounded-full border-2 border-white"
      >
        <span class="font-medium text-slate-600 ">
          {user
            ? String(user.email).charAt(0) + String(user.email).charAt(1)
            : `Us`}
        </span>
      </Link>
    </>
  );
};
