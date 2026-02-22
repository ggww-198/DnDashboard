import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { PartyProvider } from "./context/PartyContext";
import AppLayout from "./components/AppLayout";
import LoadParty from "./pages/LoadParty";
import PartyOverview from "./pages/PartyOverview";
import PartyTraits from "./pages/PartyTraits";
import CharacterDetail from "./pages/CharacterDetail";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PartyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<LoadParty />} />
              <Route path="party" element={<PartyOverview />} />
              <Route path="traits" element={<PartyTraits />} />
              <Route path="character/:id" element={<CharacterDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PartyProvider>
    </ThemeProvider>
  );
}

export default App;
