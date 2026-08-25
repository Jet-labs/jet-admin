import React, { useEffect, useState } from "react";
import { getOperatorMeAPI } from "@/data/apis/auth";
import { useAdminStore } from "@/logic/stores/useAdminStore";

/**
 * Resolves the current operator session.
 *
 * Returns:
 *   undefined — session check in flight
 *   null      — not signed in (or token missing)
 *   object    — the signed-in operator ({operatorID, email, operatorTitle})
 *
 * A rejected /me with HTTP 401 clears the store via the axios interceptor,
 * which flips this to null and lets ProtectedLayout redirect.
 */
export const useOperator = () => {
  const operatorToken = useAdminStore((s) => s.operatorToken);
  const [state, setState] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    if (!operatorToken) {
      setState(null);
      return undefined;
    }
    setState(undefined);
    getOperatorMeAPI()
      .then((operator) => {
        if (!cancelled) setState(operator);
      })
      .catch(() => {
        if (!cancelled) setState(null);
      });
    return () => {
      cancelled = true;
    };
  }, [operatorToken]);

  return state;
};
