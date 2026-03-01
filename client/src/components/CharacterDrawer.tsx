import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useParty } from "../context/PartyContext";
import { useCharacterDrawer } from "../context/CharacterDrawerContext";
import { ABILITY_KEYS, ABILITY_SHORT, SKILL_LABELS } from "../constants/skills";
import type { TraitDetail } from "../Types/CharacterDetails/traits";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="primary" fontWeight={600} sx={{ fontFamily: "Cinzel, Georgia, serif", textTransform: "uppercase" }}>
        {title}
      </Typography>
      <Box sx={{ mt: 0.5 }}>{children}</Box>
    </Box>
  );
}

function TraitRow({ trait }: { trait: TraitDetail }) {
  return (
    <Box sx={{ py: 0.5 }}>
      <Typography variant="body2" fontWeight={600}>{trait.name}</Typography>
      <Typography variant="caption" color="text.secondary">{trait.source}{trait.source_type ? ` · ${trait.source_type}` : ""}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", mt: 0.25 }}>{trait.description}</Typography>
    </Box>
  );
}

export default function CharacterDrawer() {
  const { party } = useParty();
  const { drawerCharId, closeDrawer } = useCharacterDrawer();

  const c = (drawerCharId && party?.[drawerCharId]) ?? null;
  if (!c) return null;

  const info = c.info ?? {};
  const combat = c.combat ?? {};
  const abilities = c.abilities ?? {} as Record<string, { score: string; modifier: string }>;
  const skills = c.skills ?? {} as Record<string, { bonus: string; prof: boolean }>;
  const traits = c.traits?.all ?? [];
  const attacks = c.attacks ?? [];
  const personality = c.personality ?? {} as Record<string, string>;
  const otherProf = c.other_profs;

  return (
    <Drawer
      anchor="right"
      open={!!drawerCharId}
      onClose={closeDrawer}
      slotProps={{ backdrop: { sx: { bgcolor: "rgba(0,0,0,0.6)" } } }}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 400 },
          maxWidth: "100%",
          bgcolor: "background.paper",
          borderLeft: "1px solid",
          borderColor: "primary.main",
        },
      }}
    >
      <Box sx={{ p: 2, overflow: "auto", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: "Cinzel, Georgia, serif" }}>
            {c.charName || info.name || "Unnamed"}
          </Typography>
          <IconButton size="small" onClick={closeDrawer} aria-label="Close">
            ×
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
          <Chip label={info.class || "—"} size="small" />
          <Chip label={info.race || "—"} size="small" variant="outlined" />
          <Chip label={`Level ${info.level ?? "—"}`} size="small" variant="outlined" />
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Section title="Combat">
          <Typography variant="body2">AC {combat.ac} · Init {combat.initiative} · Speed {combat.speed} ft · HP {combat.hp_current}/{combat.hp_max}</Typography>
        </Section>
        <Section title="Abilities">
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {ABILITY_KEYS.map((key) => {
              const a = abilities[key];
              if (!a) return null;
              return (
                <Chip
                  key={key}
                  size="small"
                  label={`${ABILITY_SHORT[key]} ${a.score} (${Number(a.modifier) >= 0 ? "+" : ""}${a.modifier})`}
                  variant="outlined"
                />
              );
            })}
          </Box>
        </Section>
        <Section title="Passive Perception">
          <Typography variant="body2">{c.proficiency?.passive_perception ?? "—"}</Typography>
        </Section>
        <Section title="Skills">
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {Object.entries(skills).map(([k, v]) => (
              <Chip
                key={k}
                size="small"
                label={`${SKILL_LABELS[k] ?? k}: ${Number(v.bonus) >= 0 ? "+" : ""}${v.bonus}${v.prof ? " ✓" : ""}`}
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            ))}
          </Box>
        </Section>
        {otherProf && (
          <Section title="Languages & Proficiencies">
            {otherProf.languages?.length > 0 && (
              <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Languages:</strong> {otherProf.languages.join(", ")}</Typography>
            )}
            {otherProf.tools?.length > 0 && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Tools:</strong> {otherProf.tools.map((t: { name?: string }) => typeof t === "string" ? t : t.name).join(", ")}
              </Typography>
            )}
            {otherProf.armor?.length > 0 && (
              <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Armor:</strong> {otherProf.armor.join(", ")}</Typography>
            )}
            {otherProf.weapons?.length > 0 && (
              <Typography variant="body2"><strong>Weapons:</strong> {otherProf.weapons.join(", ")}</Typography>
            )}
          </Section>
        )}
        {attacks.length > 0 && (
          <Section title="Attacks">
            {attacks.map((a, i) => (
              <Typography key={i} variant="body2">
                {a.name} {a.attack_bonus} {a.damage_type ?? ""} {"range" in a && a.range ? `(${a.range})` : ""}
              </Typography>
            ))}
          </Section>
        )}
        {traits.length > 0 && (
          <Section title="Traits & Features">
            {traits.slice(0, 8).map((t, i) => <TraitRow key={i} trait={t} />)}
            {traits.length > 8 && (
              <Typography variant="caption" color="text.secondary">+{traits.length - 8} more</Typography>
            )}
          </Section>
        )}
        {(personality.traits || personality.ideals || personality.bonds || personality.flaws) && (
          <Section title="Personality">
            {personality.traits && <Typography variant="body2"><strong>Traits:</strong> {personality.traits}</Typography>}
            {personality.ideals && <Typography variant="body2"><strong>Ideals:</strong> {personality.ideals}</Typography>}
            {personality.bonds && <Typography variant="body2"><strong>Bonds:</strong> {personality.bonds}</Typography>}
            {personality.flaws && <Typography variant="body2"><strong>Flaws:</strong> {personality.flaws}</Typography>}
          </Section>
        )}
      </Box>
    </Drawer>
  );
}
