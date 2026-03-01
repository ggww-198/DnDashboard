import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useParty } from "../context/PartyContext";
import type InventoryItem from "../Types/CharacterDetails/inventoryitem";
import type { TraitDetail } from "../Types/CharacterDetails/traits";
import { ITEM_ICONS, TRAIT_ICONS, type ItemCategory, type TraitSource } from "../constants/icons";
import type Attack from "../Types/CharacterDetails/attack";

const SLOT_SIZE = 100;
const COLUMN_WIDTH = 480;

function inferCategory(item: InventoryItem & { description?: string }): ItemCategory {
  const d = (item.description ?? "").toLowerCase();
  const n = (item.name ?? "").toLowerCase();
  if (d.includes("weapon") || d.includes("melee") || d.includes("ranged") || n.includes("crossbow") || n.includes("rapier") || n.includes("axe") || n.includes("bow")) return "Weapon";
  if (d.includes("armor") || d.includes("shield") || n.includes("armor") || n.includes("shield") || n.includes("leather") || n.includes("mail") || n.includes("chain")) return "Armor";
  if (d.includes("tool") || n.includes("tools") || n.includes("kit")) return "Tool";
  if (d.includes("wondrous") || d.includes("requires attunement") || n.includes("stone") || n.includes("decanter") || n.includes("luck")) return "Wondrous";
  return "Gear";
}

function getTraitIcon(source: string): string {
  return TRAIT_ICONS[(source || "other") as TraitSource] ?? TRAIT_ICONS.other;
}

function AttackSlot({ attack, charName }: { attack: Attack & { range?: string }; charName: string }) {
  const icon = ITEM_ICONS.Weapon;


  const tooltipTitle = (
    <Box sx={{ maxWidth: 320 }}>
      <Typography variant="subtitle2" fontWeight={600}>{attack.name}</Typography>
      <Typography variant="caption" color="inherit" sx={{ opacity: 0.9 }}>{charName} · {attack.range ?? ""}</Typography>
      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>{attack.attack_bonus} {attack.damage_type ?? ""}</Typography>
    </Box>
  );
  return (
    <Tooltip title={tooltipTitle} placement="top" enterDelay={300} leaveDelay={0} slotProps={{ popper: { sx: { "& .MuiTooltip-tooltip": { bgcolor: "grey.900", border: "1px solid", borderColor: "primary.dark" } } } }}>
      <Paper
        variant="outlined"
        sx={{
          width: SLOT_SIZE,
          height: SLOT_SIZE,
          minWidth: SLOT_SIZE,
          minHeight: SLOT_SIZE,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 0.5,
          cursor: "default",
          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
        }}
      >
        <Box component="span" sx={{ fontSize: "1.2rem", lineHeight: 1 }}>{icon}</Box>
        <Typography variant="caption" fontWeight={600} sx={{ width: "100%", textAlign: "center", fontSize: "0.6rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2, mt: 0.25 }} title={attack.name}>
          {attack.name} · {attack.attack_bonus} {attack.damage_type ?? ""}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.55rem" }}> {attack.attack_bonus}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.55rem" }}> {attack.damage_type}</Typography>
      </Paper>
    </Tooltip>
  );
}

function ItemSlot({ item, charName }: { item: InventoryItem & { description?: string; properties?: string }; charName: string }) {
  const cat = inferCategory(item);
  const icon = ITEM_ICONS[cat];
  const count = item.count ? Number(item.count) : 1;
  const weight = item.weight ? Number(item.weight) : 0;
  const desc = (item.description ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
  const props = "properties" in item && item.properties ? `\n${item.properties}` : "";
  const tooltipTitle = (
    <Box sx={{ maxWidth: 320 }}>
      <Typography variant="subtitle2" fontWeight={600}>{item.name}</Typography>
      <Typography variant="caption" color="inherit" sx={{ opacity: 0.9 }}>{charName} · {weight > 0 ? `${weight} lb` : ""} {count > 1 ? `×${count}` : ""}</Typography>
      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>{desc}{desc.length >= 300 ? "…" : ""}{props}</Typography>
    </Box>
  );
  return (
    <Tooltip title={tooltipTitle} placement="top" enterDelay={300} leaveDelay={0} slotProps={{ popper: { sx: { "& .MuiTooltip-tooltip": { bgcolor: "grey.900", border: "1px solid", borderColor: "primary.dark" } } } }}>
      <Paper
        variant="outlined"
        sx={{
          width: SLOT_SIZE,
          height: SLOT_SIZE,
          minWidth: SLOT_SIZE,
          minHeight: SLOT_SIZE,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 0.5,
          cursor: "default",
          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
        }}
      >
        <Box component="span" sx={{ fontSize: "1.2rem", lineHeight: 1 }}>{icon}</Box>
        <Typography variant="caption" fontWeight={600} sx={{ width: "100%", textAlign: "center", fontSize: "0.6rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2, mt: 0.25 }} title={item.name}>
          {item.name}
        </Typography>
        {(count > 1 || weight > 0) && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.55rem" }}>{count > 1 ? `×${count}` : ""}{count > 1 && weight > 0 ? " " : ""}{weight > 0 ? `${weight}lb` : ""}</Typography>
        )}
      </Paper>
    </Tooltip>
  );
}

type SpellEntry = { name: string; level: string; school?: string; description?: string; casting_time?: string; range?: string };

function SpellRow({ spell }: { spell: SpellEntry }) {
  const desc = (spell.description ?? "").slice(0, 280) + ((spell.description ?? "").length > 280 ? "…" : "");
  const tooltip = (
    <Box sx={{ maxWidth: 320 }}>
      <Typography variant="subtitle2" fontWeight={600}>{spell.name}</Typography>
      <Typography variant="caption" color="inherit" sx={{ opacity: 0.9 }}>Level {spell.level} · {spell.school ?? ""}</Typography>
      {spell.casting_time && <Typography variant="caption" display="block">{spell.casting_time} · {spell.range ?? ""}</Typography>}
      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>{desc}</Typography>
    </Box>
  );
  return (
    <Tooltip title={tooltip} placement="top" enterDelay={300} slotProps={{ popper: { sx: { "& .MuiTooltip-tooltip": { bgcolor: "grey.900", border: "1px solid", borderColor: "primary.dark" } } } }}>
      <Typography variant="caption" sx={{ display: "block", py: 0.25, cursor: "default", "&:hover": { color: "primary.main" } }}>
        {spell.name}
      </Typography>
    </Tooltip>
  );
}

function TraitChip({ trait }: { trait: TraitDetail }) {
  const icon = getTraitIcon(trait.source);
  const desc = (trait.description ?? "").slice(0, 280) + ((trait.description ?? "").length > 280 ? "…" : "");
  const tooltip = (
    <Box sx={{ maxWidth: 320 }}>
      <Typography variant="subtitle2" fontWeight={600}>{trait.name}</Typography>
      <Typography variant="caption" color="inherit" sx={{ opacity: 0.9 }}>{trait.source}{trait.source_type ? ` · ${trait.source_type}` : ""}</Typography>
      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>{desc}</Typography>
    </Box>
  );
  return (
    <Tooltip title={tooltip} placement="top" enterDelay={300} slotProps={{ popper: { sx: { "& .MuiTooltip-tooltip": { bgcolor: "grey.900", border: "1px solid", borderColor: "primary.dark" } } } }}>
      <Paper variant="outlined" sx={{ px: 0.75, py: 0.5, mb: 0.5, cursor: "default", display: "flex", alignItems: "center", gap: 0.5, "&:hover": { borderColor: "primary.main" } }}>
        <span style={{ fontSize: "0.9rem" }}>{icon}</span>
        <Typography variant="caption" noWrap sx={{ flex: 1, minWidth: 0, fontSize: "0.65rem" }}>{trait.name}</Typography>
      </Paper>
    </Tooltip>
  );
}

function CharacterColumn({ charId, charName, tabIndex, onTabChange }: { charId: string; charName: string; tabIndex: number; onTabChange: (idx: number) => void }) {
  const { party } = useParty();
  const c = party?.[charId];
  if (!c) return null;

  const inv = (c.inventory ?? []) as (InventoryItem & { description?: string; properties?: string; equipped?: string })[];
  const attackList = c.attacks ?? [] as (Attack & ({ range?: string } | undefined))[];
  const equipped = attackList
  const allItems = inv; // full list so user always sees everything
  const totalWeight = inv.reduce((w, i) => w + (i.weight ? Number(i.weight) : 0) * (i.count ? Number(i.count) : 1), 0);

  const spellsData = c.spells as Record<string, unknown> | undefined;
  const spellList = useMemo(() => {
    if (!spellsData || typeof spellsData !== "object") return [];
    const out: SpellEntry[] = [];
    for (const key of Object.keys(spellsData)) {
      const val = spellsData[key];
      if (Array.isArray(val)) {
        for (const s of val) {
          if (s && typeof s === "object" && "name" in s) out.push(s as SpellEntry);
        }
      }
    }
    return out.sort((a, b) => {
      const aL = a.level === "cantrip" ? 0 : parseInt(a.level, 10) || 0;
      const bL = b.level === "cantrip" ? 0 : parseInt(b.level, 10) || 0;
      return aL - bL;
    });
  }, [spellsData]);

  const traits = (c.traits?.all ?? []) as TraitDetail[];

  const scrollSx = { overflowY: "auto", overflowX: "hidden", flex: 1, minHeight: 0 };

  return (
    <Paper variant="outlined" sx={{ width: COLUMN_WIDTH, minWidth: COLUMN_WIDTH, flexShrink: 0, display: "flex", flexDirection: "column", height: "100%", bgcolor: "background.default" }}>
      <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ fontFamily: "Cinzel, Georgia, serif" }} noWrap>
            {charName}
          </Typography>
          <Typography variant="caption" color="text.secondary">{totalWeight.toFixed(1)} lb</Typography>
        </Box>
        <Tabs value={tabIndex} onChange={(_, v) => onTabChange(v)} variant="fullWidth" sx={{ minHeight: 36, "& .MuiTab-root": { minHeight: 36, py: 0.5, fontSize: "0.7rem" } }}>
          <Tab label="Inventory" />
          <Tab label="Spells" />
          <Tab label="Traits" />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, p: 1.5, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {tabIndex === 0 && (
          <Box sx={scrollSx}>
            {equipped.length > 0 && (
              <>
                <Typography variant="caption" color="primary" fontWeight={700} sx={{ display: "block", mb: 0.5, textTransform: "uppercase" }}>Equipped</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: `repeat(4, ${SLOT_SIZE}px)`, gap: 0.75, mb: 1.5 }}>
                  {equipped.map((item, i) => (
                    <AttackSlot key={`e-${item.name}-${i}`} attack={item} charName={charName} />
                  ))}
                </Box>
              </>
            )}
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 0.5, textTransform: "uppercase" }}>All items ({allItems.length})</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: `repeat(4, ${SLOT_SIZE}px)`, gap: 0.75 }}>
              {allItems.map((item, i) => (
                <ItemSlot key={`a-${item.name}-${i}`} item={item} charName={charName} />
              ))}
            </Box>
          </Box>
        )}
        {tabIndex === 1 && (
          <Box sx={scrollSx}>
            {spellList.length === 0 ? (
              <Typography variant="caption" color="text.secondary">No spells</Typography>
            ) : (
              spellList.map((spell, i) => (
                <SpellRow key={`${spell.name}-${i}`} spell={spell} />
              ))
            )}
          </Box>
        )}
        {tabIndex === 2 && (
          <Box sx={scrollSx}>
            {traits.length === 0 ? (
              <Typography variant="caption" color="text.secondary">No traits</Typography>
            ) : (
              traits.map((t, i) => (
                <TraitChip key={`${t.name}-${i}`} trait={t} />
              ))
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

const GAP = 5;
const SCROLL_STEP = COLUMN_WIDTH + GAP;

export default function PartyInventory() {
  const { party, characterIds } = useParty();
  const [search, setSearch] = useState("");
  const [tabPerChar, setTabPerChar] = useState<Record<string, number>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredIds = useMemo(() => {
    if (!search.trim() || !party) return characterIds;
    const q = search.toLowerCase();
    return characterIds.filter((id) => {
      const c = party[id];
      const name = (c?.charName ?? c?.info?.name ?? "").toLowerCase();
      return name.includes(q);
    });
  }, [characterIds, party, search]);

  const setTab = (charId: string, idx: number) => {
    setTabPerChar((prev) => ({ ...prev, [charId]: idx }));
  };

  const [scrollState, setScrollState] = useState({ left: false, right: true });
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollState({ left: el.scrollLeft > 0, right: el.scrollLeft < el.scrollWidth - el.clientWidth - 1 });
  };
  useEffect(() => {
    updateScrollState();
    const t = setTimeout(updateScrollState, 100);
    return () => clearTimeout(t);
  }, [filteredIds.length]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -SCROLL_STEP : SCROLL_STEP, behavior: "smooth" });
  };

  if (!party || characterIds.length === 0) {
    return (
      <Typography color="text.secondary">
        No party data loaded. Load party data from the home page first.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", minHeight: 400, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5, flexShrink: 0 }}>
        <Typography variant="h5" sx={{ fontFamily: "Cinzel, Georgia, serif" }}>
          Party inventory
        </Typography>
        <TextField size="small" placeholder="Filter characters…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: 180 }} />
      </Box>
      <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
        {scrollState.left && (
          <IconButton
            onClick={() => scroll("left")}
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": { bgcolor: "action.hover" },
              "&.MuiIconButton-root": { boxShadow: 1 },
            }}
            aria-label="Scroll left"
          >
            ‹
          </IconButton>
        )}
        {scrollState.right && (
          <IconButton
            onClick={() => scroll("right")}
            sx={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": { bgcolor: "action.hover" },
              "&.MuiIconButton-root": { boxShadow: 1 },
            }}
            aria-label="Scroll right"
          >
            ›
          </IconButton>
        )}
        <Box
          ref={scrollRef}
          onScroll={updateScrollState}
          sx={{
            display: "flex",
            gap: GAP,
            height: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            pb: 1,
          }}
        >
          {filteredIds.map((id) => (
            <CharacterColumn
              key={id}
              charId={id}
              charName={party[id]?.charName ?? party[id]?.info?.name ?? id}
              tabIndex={tabPerChar[id] ?? 0}
              onTabChange={(idx) => setTab(id, idx)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
