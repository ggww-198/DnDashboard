import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import type { TraitDetail } from "../Types/CharacterDetails/traits";
import { useParty } from "../context/PartyContext";

type SourceFilter = "all" | "Racial" | "Class" | "Item" | "Background" | "Feat" | "other";

function TraitChip({
  trait,
  charName,
  onOpen,
}: { trait: TraitDetail; charName: string; onOpen: (anchor: HTMLElement, trait: TraitDetail, charName: string) => void }) {
  return (
    <Chip
      label={trait.name}
      size="small"
      onClick={(e) => onOpen(e.currentTarget, trait, charName)}
      sx={{
        cursor: "pointer",
        maxWidth: 220,
        "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
        "&:hover": { bgcolor: "primary.dark", color: "primary.contrastText" },
      }}
    />
  );
}

export default function PartyTraits() {
  const { party, characterIds } = useParty();
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [charFilter, setCharFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [popover, setPopover] = useState<{ anchor: HTMLElement; trait: TraitDetail; charName: string } | null>(null);

  const bySource = useMemo(() => {
    if (!party) return new Map<string, { trait: TraitDetail; charId: string; charName: string }[]>();
    const map = new Map<string, { trait: TraitDetail; charId: string; charName: string }[]>();
    for (const id of characterIds) {
      const c = party[id];
      const list = c?.traits?.all ?? [];
      const charName = c?.charName ?? c?.info?.name ?? "Unknown";
      for (const trait of list) {
        const source = trait.source || "other";
        if (!map.has(source)) map.set(source, []);
        map.get(source)!.push({ trait, charId: id, charName });
      }
    }
    return map;
  }, [party, characterIds]);

  const sources = useMemo(() => Array.from(bySource.keys()).sort(), [bySource]);

  const filteredBySource = useMemo(() => {
    const chosen = sourceFilter === "all" ? sources : [sourceFilter];
    const out: { source: string; items: { trait: TraitDetail; charId: string; charName: string }[] }[] = [];
    for (const src of chosen) {
      const items = bySource.get(src) ?? [];
      let list = items;
      if (charFilter !== "all") list = list.filter((x) => x.charId === charFilter);
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter(
          ({ trait, charName }) =>
            trait.name.toLowerCase().includes(q) ||
            trait.description.toLowerCase().includes(q) ||
            charName.toLowerCase().includes(q)
        );
      }
      if (list.length) out.push({ source: src, items: list });
    }
    return out;
  }, [bySource, sourceFilter, sources, charFilter, search]);

  if (!party || characterIds.length === 0) {
    return (
      <Typography color="text.secondary">
        No party data loaded. Load party data from the home page first.
      </Typography>
    );
  }

  const handleOpen = (anchor: HTMLElement, trait: TraitDetail, charName: string) => {
    setPopover({ anchor, trait, charName });
  };
  const handleClose = () => setPopover(null);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "Cinzel, Georgia, serif" }}>
        Party traits
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Group by source, then scan the grid. Click a trait for full description.
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 180 }}
        />
        <ToggleButtonGroup
          value={sourceFilter}
          exclusive
          onChange={(_, v) => v != null && setSourceFilter(v)}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          {sources.map((s) => (
            <ToggleButton key={s} value={s}>{s}</ToggleButton>
          ))}
        </ToggleButtonGroup>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Character</InputLabel>
          <Select value={charFilter} label="Character" onChange={(e) => setCharFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {characterIds.map((id) => (
              <MenuItem key={id} value={id}>{party[id]?.charName ?? party[id]?.info?.name ?? id}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {filteredBySource.map(({ source, items }) => (
          <Box key={source}>
            <Typography variant="subtitle2" color="primary" sx={{ fontFamily: "Cinzel, Georgia, serif", mb: 1 }}>
              {source} ({items.length})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {items.map(({ trait, charId, charName }) => (
                <Box key={`${charId}-${trait.name}`} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                  <TraitChip trait={trait} charName={charName} onOpen={handleOpen} />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    {charName}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Popover
        open={!!popover}
        anchorEl={popover?.anchor ?? null}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { maxWidth: 360, p: 2 } } }}
      >
        {popover && (
          <>
            <Typography variant="subtitle1" fontWeight={600}>{popover.trait.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {popover.trait.source}{popover.trait.source_type ? ` · ${popover.trait.source_type}` : ""} · {popover.charName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
              {popover.trait.description}
            </Typography>
          </>
        )}
      </Popover>
    </Box>
  );
}
