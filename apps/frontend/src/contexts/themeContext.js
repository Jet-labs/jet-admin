import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import React, { useEffect, useState } from "react";
import { customDarkTheme, customLightTheme } from "../theme";
const ThemeValueContext = React.createContext(undefined);
const ThemeActionContext = React.createContext(undefined);

const themeMap = {
  light: customLightTheme,
  dark: customDarkTheme,
};
const ThemeContextProvider = ({ children }) => {
  const [themeType, setThemeType] = useState(
    localStorage.getItem("jet-theme") ?? "light"
  );

  const toggleTheme = () => {
    if (themeType === "light") {
      setThemeType("dark");
      _changeGlobalCSSProperties("dark")
      localStorage.setItem("jet-theme", "dark");
    } else {
      setThemeType("light");
      _changeGlobalCSSProperties("light");
      localStorage.setItem("jet-theme", "light");
    }
  };
  

  

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
