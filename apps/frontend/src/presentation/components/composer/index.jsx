import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContextProvider } from "../../../logic/contexts/authContext";
import { GlobalUIProvider } from "../../../logic/contexts/globalUIContext";
import { TenantContextProvider } from "../../../logic/contexts/tenantContext";
import { SocketContextProvider } from "../../../logic/contexts/socketContext";
import { RootRouter } from "../routes/rootRouter";
import { SuspenseFallback } from "../ui/suspenseFallback";

const queryClient = new QueryClient(
  {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    }
  }
);

export const Composer = () => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <GlobalUIProvider>
            <TenantContextProvider>
              <SocketContextProvider>
                <RootRouter />
              </SocketContextProvider>
            </TenantContextProvider>
          </GlobalUIProvider>
        </AuthContextProvider>
      </QueryClientProvider>
      <ToastContainer />
    </Suspense>
  );
};
