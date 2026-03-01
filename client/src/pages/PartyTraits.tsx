import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { TraitDetail } from "../Types/CharacterDetails/traits";
import { useParty } from "../context/PartyContext";
import { TRAIT_ICONS, type TraitSource } from "../constants/icons";

function getTraitIcon(source: string): string {
  const key = (source || "other") as TraitSource;
  return TRAIT_ICONS[key] ?? TRAIT_ICONS.other;
}

function TraitSlot({ trait, charName }: { trait: TraitDetail; charName: string }) {
  const icon = getTraitIcon(trait.source);
  const desc = trait.description ?? "";
  const shortDesc = desc.slice(0, 280) + (desc.length > 280 ? "…" : "");
  const tooltipTitle = (
    <Box sx={{ maxWidth: 320 }}>
      <Typography variant="subtitle2" fontWeight={600}>{trait.name}</Typography>
      <Typography variant="caption" sx={{ opacity: 0.9 }}>{trait.source}{trait.source_type ? ` · ${trait.source_type}` : ""} · {charName}</Typography>
      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>{shortDesc}</Typography>
    </Box>
  );
  return (
    <Tooltip title={tooltipTitle} placement="top" enterDelay={300} leaveDelay={0} slotProps={{ popper: { sx: { "& .MuiTooltip-tooltip": { bgcolor: "grey.900", border: "1px solid", borderColor: "primary.dark" } } } }}>
      <Paper
        variant="outlined"
        sx={{
          p: 0.75,
          minHeight: 52,
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          cursor: "default",
          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
        }}
      >
        <Box component="span" sx={{ fontSize: "1.25rem", lineHeight: 1, flexShrink: 0 }}>{icon}</Box>
        <Typography variant="caption" fontWeight={600} noWrap sx={{ flex: 1, fontSize: "0.75rem" }}>
          {trait.name}
        </Typography>
      </Paper>
    </Tooltip>
  );
}

export default function PartyTraits() {
  const { party, characterIds } = useParty();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const bySource = useMemo(() => {
    if (!party) return new Map<string, { trait: TraitDetail; charId: string; charName: string }[]>();
    const map = new Map<string, { trait: TraitDetail; charId: string; charName: string }[]>();
    for (const id of characterIds) {
      const c = party[id];
      const charName = c?.charName ?? c?.info?.name ?? "Unknown";
      const list = c?.traits?.all ?? [];
      for (const trait of list) {
        const src = trait.source || "other";
        if (!map.has(src)) map.set(src, []);
        map.get(src)!.push({ trait, charId: id, charName });
      }
    }
    return map;
  }, [party, characterIds]);

  const sources = useMemo(() => Array.from(bySource.keys()).sort(), [bySource]);

  const filtered = useMemo(() => {
    const src = sourceFilter === "all" ? sources : [sourceFilter];
    const out: { source: string; items: { trait: TraitDetail; charName: string }[] }[] = [];
    const q = search.toLowerCase().trim();
    for (const s of src) {
      let items = bySource.get(s) ?? [];
      if (q) items = items.filter(({ trait, charName }) => trait.name.toLowerCase().includes(q) || trait.description.toLowerCase().includes(q) || charName.toLowerCase().includes(q));
      if (items.length) out.push({ source: s, items });
    }
    return out;
  }, [bySource, sourceFilter, sources, search]);

  if (!party || characterIds.length === 0) {
    return (
      <Typography color="text.secondary">
        No party data loaded. Load party data from the home page first.
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontFamily: "Cinzel, Georgia, serif" }}>
          Party traits
        </Typography>
        <TextField
          size="small"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 160 }}
        />
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          <Paper
            component="button"
            variant="outlined"
            onClick={() => setSourceFilter("all")}
            sx={{
              px: 1,
              py: 0.5,
              cursor: "pointer",
              borderColor: sourceFilter === "all" ? "primary.main" : undefined,
              bgcolor: sourceFilter === "all" ? "action.selected" : undefined,
            }}
          >
            <Typography variant="caption">All</Typography>
          </Paper>
          {sources.map((s) => (
            <Paper
              key={s}
              component="button"
              variant="outlined"
              onClick={() => setSourceFilter(s)}
              sx={{
                px: 1,
                py: 0.5,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                borderColor: sourceFilter === s ? "primary.main" : undefined,
                bgcolor: sourceFilter === s ? "action.selected" : undefined,
              }}
            >
              <span>{getTraitIcon(s)}</span>
              <Typography variant="caption">{s}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filtered.map(({ source, items }) => (
          <Box key={source}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
              <span style={{ fontSize: "1.1rem" }}>{getTraitIcon(source)}</span>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase" }}>
                {source} ({items.length})
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 0.75 }}>
              {items.map(({ trait, charName }, i) => (
                <TraitSlot key={`${source}-${trait.name}-${charName}-${i}`} trait={trait} charName={charName} />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
