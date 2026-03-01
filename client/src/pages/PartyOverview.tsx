import { Link as RouterLink } from "react-router-dom";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useParty } from "../context/PartyContext";

function Stat({ label, value }: { label: string; value: string | undefined }) {
  if (value === undefined || value === "") return null;
  return (
    <Typography variant="body2" color="text.secondary">
      <strong>{label}:</strong> {value}
    </Typography>
  );
}

export default function PartyOverview() {
  const { party, characterIds } = useParty();

  if (!party || characterIds.length === 0) {
    return (
      <Typography color="text.secondary">
        No party data loaded. Go to the home page and paste your Roll20 extension JSON to load the party.
      </Typography>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "Cinzel, Georgia, serif" }}>
        Party roster
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {characterIds.length} character{characterIds.length !== 1 ? "s" : ""}. Click a card for details.
      </Typography>
      <Grid container spacing={2}>
        {characterIds.map((id) => {
          const c = party[id];
          if (!c) return null;
          const info = c.info ?? {};
          const combat = c.combat ?? {};
          const prof = c.proficiency ?? {};
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={id}>
              <Card variant="outlined">
                <CardActionArea component={RouterLink} to={`/character/${id}`}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontFamily: "Cinzel, Georgia, serif" }}>
                      {c.charName || info.name || "Unnamed"}
                    </Typography>
                    <Chip
                      label={info.class || "—"}
                      size="small"
                      sx={{ mb: 1, bgcolor: "primary.main", color: "primary.contrastText" }}
                    />
                    <Stat label="Level" value={info.level} />
                    <Stat label="AC" value={combat.ac} />
                    <Stat label="HP" value={combat.hp_current ? `${combat.hp_current}/${combat.hp_max}` : combat.hp_max} />
                    <Stat label="Passive PP" value={prof.passive_perception} />
                    <Stat label="Speed" value={combat.speed ? `${combat.speed} ft` : ""} />
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
