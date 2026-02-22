import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#c9a227" },
    secondary: { main: "#8b6914" },
    background: {
      default: "#1a1612",
      paper: "#252019",
    },
    text: {
      primary: "#e8e0d5",
      secondary: "#a89888",
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Cinzel", "Georgia", serif', fontWeight: 600 },
    h2: { fontFamily: '"Cinzel", "Georgia", serif', fontWeight: 600 },
    h3: { fontFamily: '"Cinzel", "Georgia", serif', fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(201, 162, 39, 0.2)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(201, 162, 39, 0.25)",
        },
      },
    },
  },
});
