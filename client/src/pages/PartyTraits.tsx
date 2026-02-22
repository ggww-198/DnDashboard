import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { TraitDetail } from "../Types/CharacterDetails/traits";
import { useParty } from "../context/PartyContext";

type SourceFilter = "all" | "Racial" | "Class" | "Item" | "Background" | "Feat" | "other";

function TraitCard({ trait, charName }: { trait: TraitDetail; charName: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography fontWeight={600}>{trait.name}</Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {trait.source}{trait.source_type ? ` · ${trait.source_type}` : ""}
        </Typography>
        <Typography variant="caption" color="primary">{charName}</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
        {trait.description}
      </Typography>
    </Paper>
  );
}

export default function PartyTraits() {
  const { party, characterIds } = useParty();
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [charFilter, setCharFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const flatTraits = useMemo(() => {
    if (!party) return [];
    const out: { trait: TraitDetail; charId: string; charName: string }[] = [];
    for (const id of characterIds) {
      const c = party[id];
      const list = c?.traits?.all ?? [];
      const charName = c?.charName ?? c?.info?.name ?? "Unknown";
      for (const trait of list) {
        out.push({ trait, charId: id, charName });
      }
    }
    return out;
  }, [party, characterIds]);

  const filtered = useMemo(() => {
    return flatTraits.filter(({ trait, charId, charName }) => {
      if (sourceFilter !== "all" && trait.source !== sourceFilter) return false;
      if (charFilter !== "all" && charId !== charFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !trait.name.toLowerCase().includes(q) &&
          !trait.description.toLowerCase().includes(q) &&
          !charName.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [flatTraits, sourceFilter, charFilter, search]);

  const sources = useMemo(() => {
    const set = new Set<string>();
    for (const { trait } of flatTraits) if (trait.source) set.add(trait.source);
    return Array.from(set).sort();
  }, [flatTraits]);

  if (!party || characterIds.length === 0) {
    return (
      <Typography color="text.secondary">
        No party data loaded. Load party data from the home page first.
      </Typography>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "Cinzel, Georgia, serif" }}>
        Party traits
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        All traits across the party. Filter by source or character to find useful abilities.
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search traits…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Source</InputLabel>
          <Select
            value={sourceFilter}
            label="Source"
            onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
          >
            <MenuItem value="all">All sources</MenuItem>
            {sources.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Character</InputLabel>
          <Select
            value={charFilter}
            label="Character"
            onChange={(e) => setCharFilter(e.target.value)}
          >
            <MenuItem value="all">All characters</MenuItem>
            {characterIds.map((id) => (
              <MenuItem key={id} value={id}>
                {party[id]?.charName ?? party[id]?.info?.name ?? id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {filtered.length} trait{filtered.length !== 1 ? "s" : ""}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {filtered.map(({ trait, charId, charName }) => (
          <TraitCard key={`${charId}-${trait.name}`} trait={trait} charName={charName} />
        ))}
      </Box>
    </>
  );
}
