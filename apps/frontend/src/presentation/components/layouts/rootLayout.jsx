import React, { useEffect } from "react";
import { Outlet, useMatches } from "react-router-dom";

export const RootLayout = () => {
  const matches = useMatches();

  // Find the deepest route that declares a handle.title
  const routeTitle = matches.findLast((m) => m.handle?.title)?.handle?.title;

  useEffect(() => {
    document.title = routeTitle ? `${routeTitle} | Jet Admin` : "Jet Admin";
  }, [routeTitle]);

  return <Outlet />;
};
