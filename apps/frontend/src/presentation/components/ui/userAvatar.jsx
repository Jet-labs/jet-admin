import { Link } from "react-router-dom";

import { CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../logic/hooks/useAuth";
import React from "react";

export const UserAvatar = () => {
  const { user } = useAuthState();

  return (
    <>
      <Link
        to={CONSTANTS.ROUTES.ACCOUNT.path()}
        className="relative cursor-pointer inline-flex items-center justify-center w-8 h-8 overflow-hidden bg-muted rounded-full border-2 border-border"
      >
        <span className="font-medium text-foreground ">
          {user
            ? String(user.email).charAt(0) + String(user.email).charAt(1)
            : `Us`}
        </span>
      </Link>
    </>
  );
};
