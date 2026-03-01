import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useParty } from "../context/PartyContext";

export default function LoadParty() {
  const { party, loadParty, clearParty } = useParty();
  const navigate = useNavigate();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    setError(null);
    const result = loadParty(raw);
    if (result.ok) {
      navigate("/party");
    } else {
      setError(result.error);
    }
  };

  const handleClear = () => {
    clearParty();
    setRaw("");
    setError(null);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "Cinzel, Georgia, serif" }}>
        Party data
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Paste the JSON exported from the Roll20 extension (party character data). It will be stored in this browser only.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {party && Object.keys(party).length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have {Object.keys(party).length} character(s) loaded. Paste new JSON to replace, or clear to start over.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={8}
          maxRows={20}
          placeholder='Paste JSON here, e.g. { "-charId1": { "charId": "...", "charName": "...", ... }, ... }'
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ "& textarea": { fontFamily: "monospace", fontSize: "0.85rem" } }}
        />
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <Button variant="contained" onClick={handleLoad} disabled={!raw.trim()}>
            Load party
          </Button>
          <Button variant="outlined" onClick={handleClear}>
            Clear stored data
          </Button>
          {party && Object.keys(party).length > 0 && (
            <Button variant="text" onClick={() => navigate("/party")}>
              Go to Party view
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
