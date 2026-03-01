// Category icons (emoji) — no API, no image requests. Used for at-a-glance recognition.

export type ItemCategory = "Weapon" | "Armor" | "Tool" | "Wondrous" | "Gear";

export const ITEM_ICONS: Record<ItemCategory, string> = {
  Weapon: "⚔️",
  Armor: "🛡️",
  Tool: "🔧",
  Wondrous: "✨",
  Gear: "🎒",
};

export type TraitSource = "Racial" | "Class" | "Item" | "Background" | "Feat" | "other";

export const TRAIT_ICONS: Record<TraitSource, string> = {
  Racial: "🧬",
  Class: "📜",
  Item: "💎",
  Background: "📖",
  Feat: "⭐",
  other: "❓",
};
