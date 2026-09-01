import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    primary: {
      main: "#2A7C13",
      light: "#76C457",
      dark: "#1D570D",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#76C457",
      light: "#A7D88F",
      dark: "#4F9635",
      contrastText: "#FFFFFF",
    },

    background: {
      default: "#FFF8CF",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#26351F",
      secondary: "#60705A",
    },

    divider: "#D8E4C8",

    success: {
      main: "#2A7C13",
    },

    error: {
      main: "#C62828",
    },

    warning: {
      main: "#D99000",
    },
  },

  typography: {
    fontFamily: ["Roboto", "Arial", "sans-serif"].join(","),

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 700,
    },

    h6: {
      fontWeight: 700,
    },

    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },

  shape: {
    borderRadius: 10,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          backgroundColor: "#FFF8CF",
        },

        "*": {
          boxSizing: "border-box",
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 40,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid #D8E4C8",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#FBE6C2",
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#26351F",
          fontWeight: 700,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export { theme };
