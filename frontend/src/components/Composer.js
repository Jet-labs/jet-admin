import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContextProvider } from "../contexts/authContext";
import { SocketContextProvider } from "../contexts/socketContext";
import { ConstantsContextProvider } from "../contexts/constantsContext";
import { customDarkTheme, customLightTheme } from "../theme";

const theme = createTheme(customDarkTheme);

// console.log({ theme });
const queryClient = new QueryClient();
function Composer({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConstantsContextProvider>
        <SocketContextProvider>
          <AuthContextProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </AuthContextProvider>
        </SocketContextProvider>
      </ConstantsContextProvider>
      <ToastContainer />
    </QueryClientProvider>
  );
}

export default Composer;
