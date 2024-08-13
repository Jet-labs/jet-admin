import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import React, { useEffect, useState } from "react";
import { customDarkTheme, customLightTheme } from "../theme";
import { LOCAL_CONSTANTS } from "../constants";
const ThemeValueContext = React.createContext(undefined);
const ThemeActionContext = React.createContext(undefined);

const themeMap = {
  light: customLightTheme,
  dark: customDarkTheme,
};
const ThemeContextProvider = ({ children }) => {
  const [themeType, setThemeType] = useState(
    localStorage.getItem(LOCAL_CONSTANTS.STRINGS.THEME_LOCAL_STORAGE_STRING) ??
      "light"
  );

  const toggleTheme = () => {
    if (themeType === "light") {
      setThemeType("dark");
      localStorage.setItem(
        LOCAL_CONSTANTS.STRINGS.THEME_LOCAL_STORAGE_STRING,
        "dark"
      );
    } else {
      setThemeType("light");
      localStorage.setItem(
        LOCAL_CONSTANTS.STRINGS.THEME_LOCAL_STORAGE_STRING,
        "light"
      );
    }
  };

  useEffect(() => {
    _changeGlobalCSSProperties(themeType);
  }, [themeType]);

  const _changeGlobalCSSProperties = (theme) => {
    try {
      document.body.style.setProperty(
        "--scrollbar-track-bg",
        themeMap[theme].palette.scroll.trackBackground
      );
      document.body.style.setProperty(
        "--scrollbar-thumb-bg",
        themeMap[theme].palette.scroll.thumbBackground
      );
      document.body.style.setProperty(
        "--scrollbar-thumb-corner",
        themeMap[theme].palette.scroll.thumbCorner
      );
      document.body.style.setProperty(
        "--scrollbar-thumb-hover-bg",
        themeMap[theme].palette.scroll.thumbHoverBackground
      );
      // document.body.style.setProperty(
      //   "--toastify-color-light",
      //   themeMap[theme].palette.background.paper
      // );
    } catch (error) {
      console.log({ error });
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
