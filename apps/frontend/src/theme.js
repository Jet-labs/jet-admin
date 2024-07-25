export const customDarkTheme = {
  typography: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    fontSize: 12,
  },
  palette: {
    mode: "dark",
    common: {
      black: "#000",
      white: "#fff",
    },
    primary: {
      main: "#7b79ff",
      light: "#dad6ff",
      dark: "#373078",
      contrastText: "#6a7585",
    },
    secondary: {
      main: "#ce93d8",
      light: "#f3e5f5",
      dark: "#ab47bc",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    error: {
      main: "#f44336",
      light: "#e57373",
      dark: "#d32f2f",
      contrastText: "#fff",
    },
    warning: {
      main: "#ffa726",
      light: "#ffe81c",
      dark: "#f57c00",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    info: {
      main: "#29b6f6",
      light: "#4fc3f7",
      dark: "#0288d1",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    success: {
      main: "#66bb6a",
      light: "#81c784",
      dark: "#388e3c",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    grey: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
      A100: "#f5f5f5",
      A200: "#eeeeee",
      A400: "#bdbdbd",
      A700: "#616161",
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
    text: {
      primary: "#fff",
      secondary: "rgba(255, 255, 255, 0.7)",
      disabled: "rgba(255, 255, 255, 0.5)",
      icon: "rgba(255, 255, 255, 0.5)",
    },
    divider: "#E6E6E6",
    background: {
      paper: "#ffffff",
      default: "##f9fafc",
    },
    action: {
      active: "#fff",
      hover: "rgba(50, 50, 77, 0.481)",
      hoverOpacity: 0.08,
      selected: "#222235",
      selectedOpacity: 0.16,
      disabled: "rgba(255, 255, 255, 0.3)",
      disabledBackground: "rgba(255, 255, 255, 0.12)",
      disabledOpacity: 0.38,
      focus: "rgba(255, 255, 255, 0.12)",
      focusOpacity: 0.12,
      activatedOpacity: 0.24,
    },
  },
  components: {
    MuiList: {
      styleOverrides: {
        // Name of the slot
        root: {
          fontSize: "0.75rem !important",
          // Some CSS
          background: "rgba(34, 34, 53, 1)",
          // paddingTop: 10,
          // paddingBottom: 10,
          // paddingLeft: 16,
          // paddingRight: 16,
        },
      },
    },

    MuiListItemButton: {
      defaultProps: {
        fontSize: "0.75rem !important",
        // The props to change the default for.
        disableRipple: true, // No more ripple, on the whole application 💣!
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        // Name of the slot
        root: {
          fontSize: "0.75rem !important",
          paddingTop: "4px !important",
          paddingBottom: "4px !important",
          paddingLeft: "10px !important",
          paddingRight: "10px !important",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          background: "rgb(24, 24, 38)",
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          background: "rgb(24, 24, 38)",
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          background: "rgba(34, 34, 53, 1)",
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          fontSize: "0.75rem !important",
        },
      },
      defaultProps: {
        // The props to change the default for.
        disableRipple: true, // No more ripple, on the whole application 💣!
        elevation: 0,
        fontSize: "0.75rem !important",
      },
    },
    MuiButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          fontSize: "0.60rem !important",
          paddingTop: "4px !important",
          paddingBottom: "4px !important",
          paddingLeft: "8px !important",
          paddingRight: "8px !important",
          fontWeight: 600,
        },
        contained: {
          border: "1px solid rgb(123, 121, 255)",
          fontWeight: 600,
        },
      },
      defaultProps: {
        // The props to change the default for.
        disableRipple: true, // No more ripple, on the whole application 💣!
        elevation: 0,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        // Name of the slot
        root: {
          fontSize: "0.75rem !important",
          paddingTop: "3px !important",
          paddingBottom: "3px !important",
          paddingLeft: "10px !important",
          paddingRight: "10px !important",

          "& fieldset": {
            borderColor: "rgb(123, 121, 255,0.5)",
          },
          "&:hover fieldset": {
            borderColor: "rgb(123, 121, 255) !important",
          },
          "& .MuiIconButton-root": {
            background: "rgba(255, 255, 255, 0)",

            border: "0px solid rgb(50, 50, 77)",
            fontSize: 10,
          },
        },
        input: {
          fontSize: "0.75rem !important",
          paddingTop: "3px !important",
          paddingBottom: "3px !important",
          paddingLeft: "0px !important",
          paddingRight: "0px !important",

          // lineHeight: "1.75",
        },
      },
    },

    MuiFormLabel: {
      styleOverrides: {
        // Name of the slot
        root: { fontSize: "0.75rem !important" },
      },
    },

    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: "0.75rem !important",
          paddingTop: "3px !important",
          paddingBottom: "3px !important",
          paddingLeft: "0px !important",
          paddingRight: "0px !important",

          height: "unset",
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          // background: "rgba(34, 34, 53, 1)",
          borderRadius: 4,

          border: "1px solid rgb(50, 50, 77)",
          // fontSize: 10,
        },
        row: {
          borderTop: "1px solid rgb(50, 50, 77)",
          background: "rgba(34, 34, 53, 1)",
        },
        virtualScroller: {
          overflowY: "auto !important",
        },
      },
    },
  },
};

export const customLightTheme = {
  typography: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    fontSize: 12,
  },
  palette: {
    mode: "dark",
    common: {
      black: "#000",
      white: "#fff",
    },
    primary: {
      main: "#4A6BFF",
      light: "#B7C4FF",
      dark: "#132C9C",
      contrastText: "#6a7585",
    },
    secondary: {
      main: "#A7A6FF",
      light: "#dad6ff",
      dark: "#231C68",
      contrastText: "#6a7585",
    },
    error: {
      main: "#f44336",
      light: "#e57373",
      dark: "#d32f2f",
      contrastText: "#fff",
    },
    warning: {
      main: "#ffa726",
      light: "#ffe81c",
      dark: "#f57c00",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    info: {
      main: "#29b6f6",
      light: "#4fc3f7",
      dark: "#0288d1",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    success: {
      main: "#66bb6a",
      light: "#81c784",
      dark: "#388e3c",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    grey: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
      A100: "#f5f5f5",
      A200: "#eeeeee",
      A400: "#bdbdbd",
      A700: "#616161",
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
    text: {
      primary: "#6a7585",
      secondary: "#6A7585A6",
      disabled: "rgba(255, 255, 255, 0.5)",
      icon: "rgba(255, 255, 255, 0.5)",
    },
    divider: "#CFCFCF",
    background: {
      paper: "#e6e6e6",
      default: "#ffffff",
      secondary: "#EEEEEE",
    },
    action: {
      active: "#e6e6e6",
      hover: "#E6E6E656",
      hoverOpacity: 0.08,
      selected: "#e6e6e6",
      selectedOpacity: 0.16,
      disabled: "#e6e6e6",
      disabledBackground: "rgba(255, 255, 255, 0.12)",
      disabledOpacity: 0.38,
      focus: "#e6e6e6",
      focusOpacity: 0.12,
      activatedOpacity: 0.24,
    },
  },
  components: {
    MuiList: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem !important",
          background: "#f9fafc",
        },
      },
    },

    MuiListItemButton: {
      defaultProps: {
        fontSize: "0.75rem !important",
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          "&:hover": {
            background: "#e6e6e6",
          },
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem !important",
          paddingTop: "4px !important",
          paddingBottom: "4px !important",
          paddingLeft: "10px !important",
          paddingRight: "10px !important",
          color: "#6a7585",
          "&:hover": {
            background: "#e6e6e6",
          },
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          background: "#ffffff",
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          background: "#ffffff",
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          background: "#ffffff",
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          fontSize: "0.75rem !important",
          color: "#6a7585",
        },
      },
      defaultProps: {
        disableRipple: true,
        elevation: 0,
        fontSize: "0.75rem !important",
      },
    },

    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-track": {
            backgroundColor: "#6a7585",
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "0.60rem !important",
          paddingTop: "4px !important",
          paddingBottom: "4px !important",
          paddingLeft: "8px !important",
          paddingRight: "8px !important",
          fontWeight: 600,
          "&:hover": {
            background: "#4A6BFF",
          },
        },
        contained: {
          border: "1px solid #4A6BFF",
          fontWeight: 600,
          color: "#ffffff",
        },
        outlined: {
          borderWidth: 1,
          "&:hover": {
            background: "#00000000",
          },
        },
        text: {
          "&:hover": {
            background: "#00000000",
          },
        },
      },
      defaultProps: {
        disableRipple: true,
        elevation: 0,
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem !important",
          paddingTop: "3px !important",
          paddingBottom: "3px !important",
          paddingLeft: "10px !important",
          paddingRight: "10px !important",

          "& fieldset": {
            borderColor: "#CFCFCF",
          },
          "&:hover fieldset": {
            borderColor: "#CFCFCF",
          },
          "&:hover": {
            backgroundColor: "#F5F5F5",
          },

          "& .MuiIconButton-root": {
            background: "#00000000",
            color: "#6a7585",
            fontSize: 10,
          },
          "& .MuiSvgIcon-root": {
            color: "#6a7585",
          },
          input: {
            "&:-webkit-autofill": {
              WebkitBoxShadow: "0 0 0 100px #fff inset",
              WebkitTextFillColor: "#6a7585",

              caretColor: "#6a7585",
            },
          },

          color: "#6a7585",
        },
        input: {
          fontSize: "0.75rem !important",
          paddingTop: "3px !important",
          paddingBottom: "3px !important",
          paddingLeft: "0px !important",
          paddingRight: "0px !important",

          // lineHeight: "1.75",
        },
      },
    },

    MuiFormLabel: {
      styleOverrides: {
        // Name of the slot
        root: { fontSize: "0.75rem !important" },
      },
    },

    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: "0.75rem !important",
          paddingTop: "3px !important",
          paddingBottom: "3px !important",
          paddingLeft: "0px !important",
          paddingRight: "0px !important",
          color: "#6a7585",
          height: "unset",
        },
        root: {
          color: "#6a7585",
        },
      },
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            background: "#e6e6e6",
          },
          "& .Mui-selected": {
            background: "#e6e6e6",
            "&:hover": {
              background: "#e6e6e6",
            },
          },
        },
      },
    },

    MuiDataGrid: {
      styleOverrides: {
        root: {
          background: "#ffffff",
          borderWidth: 0,
          "& .MuiDataGrid-main": {
            borderColor: "#CFCFCF",
            borderWidth: 1,
          },
          "& .MuiDataGrid-withBorderColor": {
            borderRadius: 0,
            borderWidth: 0,
            borderBottom: 0,
          },
          "& .MuiDataGrid-columnHeader": {
            background: "#ffffff",
            borderColor: "#00000000",
            outline: 0,
            borderRadius: 0,
            borderWidth: 0,
            borderBottom: 0,
            "&:focus-within": {
              outline: "none !important",
            },
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            color: "#6a7585",
            border: 0,
            borderBottom: 0,
          },
          "& .MuiCheckbox-root": {
            color: "#6a7585",
          },
          "& .MuiDataGrid-cell": {
            borderColor: "#00000000",
            outline: "none",
            "&:focus-within": {
              outline: "none !important",
            },
          },
        },
        row: {
          background: "#ffffff",
          borderTopWidth: 1,
          borderColor: "#CFCFCF",
          "&:hover": {
            background: "#e6e6e6",
          },
        },
        virtualScroller: {
          overflowY: "auto !important",
        },
      },
    },
  },
};

