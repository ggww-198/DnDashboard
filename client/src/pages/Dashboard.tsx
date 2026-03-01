import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { useParty } from "../context/PartyContext";
import { useCharacterDrawer } from "../context/CharacterDrawerContext";
import { ABILITY_KEYS, ABILITY_SHORT, SKILL_LABELS } from "../constants/skills";

const SKILL_ORDER = Object.keys(SKILL_LABELS);

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle1" color="primary" fontWeight={600} sx={{ fontFamily: "Cinzel, Georgia, serif", mb: 1.5, mt: 3 }}>
      {children}
    </Typography>
  );
}

function CharNameChip({ charId, name }: { charId: string; name: string }) {
  const { openDrawer } = useCharacterDrawer();
  return (
    <Tooltip title="Open sheet" placement="top">
      <Chip
        label={name}
        size="small"
        onClick={() => openDrawer(charId)}
        sx={{ cursor: "pointer", fontWeight: 600, "&:hover": { bgcolor: "primary.dark", color: "primary.contrastText" } }}
      />
    </Tooltip>
  );
}

export default function Dashboard() {
  const { party, characterIds } = useParty();

  if (!party || characterIds.length === 0) {
    return (
      <Typography color="text.secondary">
        No party data loaded. Go to the home page and paste your Roll20 extension JSON to load the party.
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "Cinzel, Georgia, serif" }}>
        Party at a glance
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Hover for details · click a name to open sheet.
      </Typography>

      <SectionTitle>Combat & core stats</SectionTitle>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Character</TableCell>
              <TableCell align="right">Class</TableCell>
              <TableCell align="right">Level</TableCell>
              <TableCell align="right">AC</TableCell>
              <TableCell align="right">HP</TableCell>
              <TableCell align="right">PP</TableCell>
              <TableCell align="right">Speed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {characterIds.map((id) => {
              const c = party[id];
              if (!c) return null;
              const info = c.info ?? {};
              const combat = c.combat ?? {};
              const prof = c.proficiency ?? {};
              const name = c.charName || info.name || "Unnamed";
              return (
                <TableRow key={id} hover>
                  <TableCell>
                    <CharNameChip charId={id} name={name} />
                  </TableCell>
                  <TableCell align="right">{info.class || "—"}</TableCell>
                  <TableCell align="right">{info.level ?? "—"}</TableCell>
                  <TableCell align="right">{combat.ac || "—"}</TableCell>
                  <TableCell align="right">{combat.hp_current ? `${combat.hp_current}/${combat.hp_max}` : combat.hp_max || "—"}</TableCell>
                  <TableCell align="right">{prof.passive_perception ?? "—"}</TableCell>
                  <TableCell align="right">{combat.speed ? `${combat.speed} ft` : "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <SectionTitle>Ability modifiers</SectionTitle>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Character</TableCell>
              {ABILITY_KEYS.map((k) => (
                <TableCell key={k} align="center">{ABILITY_SHORT[k]}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {characterIds.map((id) => {
              const c = party[id];
              if (!c) return null;
              const abilities = c.abilities ?? {} as Record<string, { modifier: string }>;
              const name = c.charName || c.info?.name || "Unnamed";
              return (
                <TableRow key={id} hover>
                  <TableCell>
                    <CharNameChip charId={id} name={name} />
                  </TableCell>
                  {ABILITY_KEYS.map((k) => {
                    const a = abilities[k];
                    const mod = a?.modifier ?? "—";
                    const num = mod !== "—" ? Number(mod) : NaN;
                    const isPositive = !Number.isNaN(num) && num >= 0;
                    return (
                      <TableCell key={k} align="center">
                        <Typography variant="body2" color={isPositive ? "primary" : "text.secondary"}>
                          {mod !== "—" && num >= 0 ? "+" : ""}{mod}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <SectionTitle>Skills</SectionTitle>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 1, overflowX: "auto" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Skill</TableCell>
              {characterIds.map((id) => (
                <TableCell key={id} align="center" sx={{ minWidth: 56 }}>
                  {party[id]?.charName || party[id]?.info?.name || id.slice(0, 6)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {SKILL_ORDER.map((skillKey) => (
              <TableRow key={skillKey} hover>
                <TableCell sx={{ fontWeight: 500 }}>{SKILL_LABELS[skillKey] ?? skillKey}</TableCell>
                {characterIds.map((id) => {
                  const skills = (party[id]?.skills ?? {}) as unknown as Record<string, { bonus: string; prof: boolean }>;
                  const s = skills[skillKey];
                  const bonus = s?.bonus ?? "—";
                  const prof = s?.prof ?? false;
                  const num = bonus !== "—" ? Number(bonus) : NaN;
                  const skillName = SKILL_LABELS[skillKey] ?? skillKey;
                  const hoverText = bonus !== "—" ? `${skillName} ${num >= 0 ? "+" : ""}${bonus}${prof ? " (proficient)" : ""}` : "";
                  return (
                    <TableCell key={id} align="center">
                      <Tooltip title={hoverText} placement="top">
                        <Typography component="span" variant="body2" color={prof ? "primary" : "text.secondary"}>
                          {bonus !== "—" && num >= 0 ? "+" : ""}{bonus}{prof ? " ✓" : ""}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <SectionTitle>Languages & proficiencies</SectionTitle>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Character</TableCell>
              <TableCell>Languages</TableCell>
              <TableCell>Tools</TableCell>
              <TableCell>Armor</TableCell>
              <TableCell>Weapons</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {characterIds.map((id) => {
              const c = party[id];
              if (!c) return null;
              const op = c.other_profs;
              const name = c.charName || c.info?.name || "Unnamed";
              const langs = op?.languages ?? [];
              const tools = op?.tools ?? [];
              const toolNames = tools.map((t: { name?: string }) => typeof t === "string" ? t : t.name);
              const armor = op?.armor ?? [];
              const weapons = op?.weapons ?? [];
              return (
                <TableRow key={id} hover>
                  <TableCell>
                    <CharNameChip charId={id} name={name} />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    {langs.length ? langs.join(", ") : "—"}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    {toolNames.length ? toolNames.join(", ") : "—"}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 160 }}>
                    {armor.length ? armor.join(", ") : "—"}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 160 }}>
                    {weapons.length ? weapons.join(", ") : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
