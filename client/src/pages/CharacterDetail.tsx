import { useParams, Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useParty } from "../context/PartyContext";
import type { TraitDetail } from "../Types/CharacterDetails/traits";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" color="primary" fontWeight={600} gutterBottom sx={{ fontFamily: "Cinzel, Georgia, serif" }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function TraitBlock({ trait }: { trait: TraitDetail }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, mb: 1 }}>
      <Typography variant="body2" fontWeight={600}>{trait.name}</Typography>
      <Typography variant="caption" color="text.secondary">
        {trait.source}{trait.source_type ? ` · ${trait.source_type}` : ""}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
        {trait.description}
      </Typography>
    </Paper>
  );
}

export default function CharacterDetail() {
  const { id } = useParams<{ id: string }>();
  const { party } = useParty();

  if (!party || !id || !party[id]) {
    return (
      <Typography color="text.secondary">
        Character not found. <Link component={RouterLink} to="/party">Back to party</Link>
      </Typography>
    );
  }

  const c = party[id];
  const info = c.info ?? {};
  const combat = c.combat ?? {};
  const abilities = c.abilities ?? {} as Record<string, { score: string; modifier: string }>;
  const skills = c.skills ?? {} as Record<string, { bonus: string; prof: boolean }>;
  const traits = c.traits?.all ?? [];
  const attacks = c.attacks ?? [];
  const personality = c.personality ?? {} as Record<string, string>;

  const abilityKeys = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const;
  const skillLabels: Record<string, string> = {
    acrobatics: "Acrobatics",
    animal_handling: "Animal Handling",
    arcana: "Arcana",
    athletics: "Athletics",
    deception: "Deception",
    history: "History",
    insight: "Insight",
    intimidation: "Intimidation",
    investigation: "Investigation",
    medicine: "Medicine",
    nature: "Nature",
    perception: "Perception",
    performance: "Performance",
    persuasion: "Persuasion",
    religion: "Religion",
    sleight_of_hand: "Sleight of Hand",
    stealth: "Stealth",
    survival: "Survival",
  };

  return (
    <>
      <Link component={RouterLink} to="/party" sx={{ display: "inline-block", mb: 2 }}>
        ← Back to overview
      </Link>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "Cinzel, Georgia, serif" }}>
        {c.charName || info.name || "Unnamed"}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Chip label={info.class || "—"} size="small" />
        <Chip label={info.race || "—"} size="small" variant="outlined" />
        <Chip label={info.background || "—"} size="small" variant="outlined" />
        <Chip label={info.alignment || "—"} size="small" variant="outlined" />
        <Chip label={`Level ${info.level ?? "—"}`} size="small" variant="outlined" />
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Section title="Combat">
                <Typography variant="body2">AC {combat.ac} · Init {combat.initiative} · Speed {combat.speed} ft</Typography>
                <Typography variant="body2">HP {combat.hp_current}/{combat.hp_max}{combat.hp_temp ? ` (+${combat.hp_temp} temp)` : ""}</Typography>
              </Section>
              <Section title="Abilities">
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {abilityKeys.map((key) => {
                    const a = abilities[key];
                    if (!a) return null;
                    const label = key.slice(0, 3).toUpperCase();
                    return (
                      <Chip
                        key={key}
                        size="small"
                        label={`${label} ${a.score} (${a.modifier >= "0" ? "+" : ""}${a.modifier})`}
                        variant="outlined"
                      />
                    );
                  })}
                </Box>
              </Section>
              <Section title="Saving throws & skills">
                <Typography variant="caption" color="text.secondary" component="div">
                  Passive Perception: {c.proficiency?.passive_perception ?? "—"}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                  {Object.entries(skills).map(([k, v]) => (
                    <Chip
                      key={k}
                      size="small"
                      label={`${skillLabels[k] ?? k}: ${v.bonus >= "0" ? "+" : ""}${v.bonus}${v.prof ? " ✓" : ""}`}
                      variant="outlined"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  ))}
                </Box>
              </Section>
              {attacks.length > 0 && (
                <Section title="Attacks">
                  {attacks.map((a, i) => (
                    <Typography key={i} variant="body2">
                      {a.name} {a.attack_bonus} {a.damage_type ?? ""} {"range" in a && a.range ? `(${a.range})` : ""}
                    </Typography>
                  ))}
                </Section>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Traits & features">
            {traits.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No traits listed.</Typography>
            ) : (
              traits.map((t, i) => <TraitBlock key={i} trait={t} />)
            )}
          </Section>
          {(personality.traits || personality.ideals || personality.bonds || personality.flaws) && (
            <Section title="Personality">
              {personality.traits && <Typography variant="body2"><strong>Traits:</strong> {personality.traits}</Typography>}
              {personality.ideals && <Typography variant="body2"><strong>Ideals:</strong> {personality.ideals}</Typography>}
              {personality.bonds && <Typography variant="body2"><strong>Bonds:</strong> {personality.bonds}</Typography>}
              {personality.flaws && <Typography variant="body2"><strong>Flaws:</strong> {personality.flaws}</Typography>}
            </Section>
          )}
        </Grid>
      </Grid>
    </>
  );
}
