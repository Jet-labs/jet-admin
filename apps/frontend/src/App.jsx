import React from "react";
import "./App.css";
import { Composer } from "./presentation/components/composer";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const miroTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#171717',
      paper: '#171717',
    },
    primary: {
      main: '#7582ff',
    },
    secondary: {
      main: '#2e2e2e',
    },
    success: {
      main: '#7582ff',
    },
    text: {
      primary: '#fafafa',
      secondary: '#898989',
    },
  },
  typography: {
    fontFamily: '"Circular", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={miroTheme}>
      <CssBaseline />
      <Composer />
    </ThemeProvider>
  );
}

export default App;
