import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { useParty } from "../context/PartyContext";
import type Character from "../Types/character";
import type InventoryItem from "../Types/CharacterDetails/inventoryitem";

type ItemCategory = "all" | "Weapon" | "Armor" | "Tool" | "Wondrous" | "Gear";

function inferCategory(item: InventoryItem & { description?: string }): ItemCategory {
  const d = (item.description ?? "").toLowerCase();
  const n = (item.name ?? "").toLowerCase();
  if (d.includes("weapon") || d.includes("melee") || d.includes("ranged") || n.includes("crossbow") || n.includes("rapier") || n.includes("axe")) return "Weapon";
  if (d.includes("armor") || d.includes("shield") || n.includes("armor") || n.includes("shield") || n.includes("leather") || n.includes("mail")) return "Armor";
  if (d.includes("tool") || n.includes("tools") || n.includes("kit")) return "Tool";
  if (d.includes("wondrous") || d.includes("requires attunement") || n.includes("stone") || n.includes("decanter")) return "Wondrous";
  return "Gear";
}

function ItemTile({
  item,
  charName,
  onOpen,
}: {
  item: InventoryItem & { description?: string; properties?: string };
  charName: string;
  onOpen: (anchor: HTMLElement, item: InventoryItem & { description?: string }, charName: string) => void;
}) {
  const cat = inferCategory(item);
  const weight = item.weight ? Number(item.weight) : 0;
  const count = item.count ? Number(item.count) : 1;
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        height: "100%",
        minHeight: 88,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
      }}
      onClick={(e) => onOpen(e.currentTarget, item, charName)}
    >
      <Typography variant="body2" fontWeight={600} noWrap title={item.name}>
        {item.name}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {charName}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          {count > 1 && (
            <Typography variant="caption" color="text.secondary">×{count}</Typography>
          )}
          {weight > 0 && (
            <Typography variant="caption" color="text.secondary">{weight} lb</Typography>
          )}
        </Box>
      </Box>
      <Typography variant="caption" color="primary" sx={{ textTransform: "uppercase", fontSize: "0.65rem" }}>
        {cat}
      </Typography>
    </Paper>
  );
}

function flattenPartyInventory(party: Record<string, Character>): { item: InventoryItem & { description?: string; properties?: string }; charId: string; charName: string }[] {
  const out: { item: InventoryItem & { description?: string; properties?: string }; charId: string; charName: string }[] = [];
  for (const [charId, c] of Object.entries(party)) {
    const name = c.charName ?? c.info?.name ?? "Unknown";
    const inv = c.inventory ?? [];
    for (const item of inv) {
      out.push({ item: item as InventoryItem & { description?: string; properties?: string }, charId, charName: name });
    }
  }
  return out;
}

export default function PartyInventory() {
  const { party, characterIds } = useParty();
  const [charFilter, setCharFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory>("all");
  const [search, setSearch] = useState("");
  const [popover, setPopover] = useState<{ anchor: HTMLElement; item: InventoryItem & { description?: string }; charName: string } | null>(null);

  const allItems = useMemo(() => (party ? flattenPartyInventory(party) : []), [party]);

  const filtered = useMemo(() => {
    return allItems.filter(({ item, charId }) => {
      if (charFilter !== "all" && charId !== charFilter) return false;
      if (categoryFilter !== "all" && inferCategory(item) !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !(item.description ?? "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allItems, charFilter, categoryFilter, search]);

  const weightByChar = useMemo(() => {
    const map = new Map<string, number>();
    for (const { charId, item } of allItems) {
      const w = (item.weight ? Number(item.weight) : 0) * (item.count ? Number(item.count) : 1);
      map.set(charId, (map.get(charId) ?? 0) + w);
    }
    return map;
  }, [allItems]);

  if (!party || characterIds.length === 0) {
    return (
      <Typography color="text.secondary">
        No party data loaded. Load party data from the home page first.
      </Typography>
    );
  }

  const handleOpen = (anchor: HTMLElement, item: InventoryItem & { description?: string }, charName: string) => {
    setPopover({ anchor, item, charName });
  };
  const handleClose = () => setPopover(null);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "Cinzel, Georgia, serif" }}>
        Party inventory
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        All items across the party. Click an item for details.
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Character</InputLabel>
          <Select value={charFilter} label="Character" onChange={(e) => setCharFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {characterIds.map((id) => (
              <MenuItem key={id} value={id}>
                {party[id]?.charName ?? party[id]?.info?.name ?? id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value as ItemCategory)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Weapon">Weapon</MenuItem>
            <MenuItem value="Armor">Armor</MenuItem>
            <MenuItem value="Tool">Tool</MenuItem>
            <MenuItem value="Wondrous">Wondrous</MenuItem>
            <MenuItem value="Gear">Gear</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        {characterIds.map((id) => {
          const w = weightByChar.get(id) ?? 0;
          const name = party[id]?.charName ?? party[id]?.info?.name ?? id;
          return (
            <Typography key={id} variant="body2" color="text.secondary">
              <strong>{name}:</strong> {w.toFixed(1)} lb
            </Typography>
          );
        })}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {filtered.length} item{filtered.length !== 1 ? "s" : ""}
      </Typography>
      <Grid container spacing={1.5}>
        {filtered.map(({ item, charId, charName }, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={`${charId}-${item.name}-${i}`}>
            <ItemTile item={item} charName={charName} onOpen={handleOpen} />
          </Grid>
        ))}
      </Grid>

      <Popover
        open={!!popover}
        anchorEl={popover?.anchor ?? null}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { maxWidth: 400, maxHeight: 400, p: 2, overflow: "auto" } } }}
      >
        {popover && (() => {
          const desc = (popover.item.description ?? "").replace(/\s+/g, " ").trim() || "—";
          return (
            <>
              <Typography variant="subtitle1" fontWeight={600}>{popover.item.name}</Typography>
              <Typography variant="caption" color="primary">Carried by: {popover.charName}</Typography>
              {popover.item.count && Number(popover.item.count) > 1 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Quantity: {popover.item.count}</Typography>
              )}
              {popover.item.weight && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Weight: {popover.item.weight} lb</Typography>
              )}
              {"properties" in popover.item && popover.item.properties && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>{String(popover.item.properties)}</Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, whiteSpace: "pre-wrap" }}>
                {desc}
              </Typography>
            </>
          );
        })()}
      </Popover>
    </Box>
  );
}
