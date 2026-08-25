import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { rootRouter } from "./presentation/components/routes/rootRouter";
import { Toaster } from "./presentation/components/ui/toaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={rootRouter} />
    </QueryClientProvider>
  );
}

export default App;
