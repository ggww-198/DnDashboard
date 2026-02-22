import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { PartyProvider } from "./context/PartyContext";
import { CharacterDrawerProvider } from "./context/CharacterDrawerContext";
import AppLayout from "./components/AppLayout";
import CharacterDrawer from "./components/CharacterDrawer";
import LoadParty from "./pages/LoadParty";
import Dashboard from "./pages/Dashboard";
import PartyTraits from "./pages/PartyTraits";
import PartyInventory from "./pages/PartyInventory";
import CharacterDetail from "./pages/CharacterDetail";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PartyProvider>
        <CharacterDrawerProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<LoadParty />} />
                <Route path="party" element={<Dashboard />} />
                <Route path="inventory" element={<PartyInventory />} />
                <Route path="traits" element={<PartyTraits />} />
                <Route path="character/:id" element={<CharacterDetail />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <CharacterDrawer />
        </CharacterDrawerProvider>
      </PartyProvider>
    </ThemeProvider>
  );
}

export default App;
