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
      contrastText: "rgba(255, 255, 255, 1)",
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
    divider: "rgb(50, 50, 77)",
    background: {
      paper: "#222235",
      default: "#181826",
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


