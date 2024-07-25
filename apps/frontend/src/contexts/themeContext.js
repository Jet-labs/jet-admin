import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import React, { useState } from "react";
import { customDarkTheme, customLightTheme } from "../theme";
const ThemeValueContext = React.createContext(undefined);
const ThemeActionContext = React.createContext(undefined);

const themeMap = {
  light: customLightTheme,
  dark: customDarkTheme,
};
const ThemeContextProvider = ({ children }) => {
  const [themeType, setThemeType] = useState("light");
  const toggleTheme = () => {
    if (themeType === "light") {
      setThemeType("dark");
    } else {
      setThemeType("light");
    }
  };

  const theme = createTheme(themeMap[themeType]);
  return (
    <ThemeValueContext.Provider
      value={{
        themeType,
      }}
    >
      <ThemeActionContext.Provider
        value={{
          toggleTheme,
          setThemeType,
        }}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeActionContext.Provider>
    </ThemeValueContext.Provider>
  );
};

const useThemeValue = () => {
  const context = React.useContext(ThemeValueContext);
  if (context === undefined) {
    throw new Error("useThemeValue error");
  }

  return context;
};

const useThemeActions = () => {
  const context = React.useContext(ThemeActionContext);
  if (context === undefined) {
    throw new Error("useThemeActions error");
  }

  return context;
};

export { ThemeContextProvider, useThemeActions, useThemeValue };
