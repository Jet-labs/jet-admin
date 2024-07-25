import { CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppConstantsContextProvider } from "../contexts/appConstantsContext";
import { AuthContextProvider } from "../contexts/authContext";
import { SocketContextProvider } from "../contexts/socketContext";
import { ThemeContextProvider } from "../contexts/themeContext";

const queryClient = new QueryClient();
function Composer({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppConstantsContextProvider>
        <SocketContextProvider>
          <AuthContextProvider>
            <ThemeContextProvider>
              <CssBaseline />
              {children}
            </ThemeContextProvider>
          </AuthContextProvider>
        </SocketContextProvider>
      </AppConstantsContextProvider>
      <ToastContainer />
    </QueryClientProvider>
  );
}

export default Composer;
