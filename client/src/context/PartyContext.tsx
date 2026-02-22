import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type CharacterMap from "../Types";

const STORAGE_KEY = "dndashboard_party_data";

interface PartyContextValue {
  party: CharacterMap | null;
  loadParty: (raw: string) => { ok: true } | { ok: false; error: string };
  clearParty: () => void;
  characterIds: string[];
}

const PartyContext = createContext<PartyContextValue | null>(null);

function parseParty(raw: string): CharacterMap | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (data === null || typeof data !== "object" || Array.isArray(data))
      return null;
    const entries = Object.entries(data);
    if (entries.length === 0) return null;
    for (const [, v] of entries) {
      if (!v || typeof v !== "object") return null;
      const c = v as Record<string, unknown>;
      if (typeof c.charId !== "string" || typeof c.charName !== "string")
        return null;
    }
    return data as CharacterMap;
  } catch {
    return null;
  }
}

function loadFromStorage(): CharacterMap | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseParty(raw);
  } catch {
    return null;
  }
}

export function PartyProvider({ children }: { children: ReactNode }) {
  const [party, setParty] = useState<CharacterMap | null>(loadFromStorage);

  const loadParty = useCallback((raw: string): { ok: true } | { ok: false; error: string } => {
    const parsed = parseParty(raw);
    if (!parsed) {
      return { ok: false, error: "Invalid JSON or not a Roll20-style character map." };
    }
    localStorage.setItem(STORAGE_KEY, raw);
    setParty(parsed);
    return { ok: true };
  }, []);

  const clearParty = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setParty(null);
  }, []);

  const characterIds = useMemo(
    () => (party ? Object.keys(party) : []),
    [party]
  );

  const value = useMemo<PartyContextValue>(
    () => ({ party, loadParty, clearParty, characterIds }),
    [party, loadParty, clearParty, characterIds]
  );

  return (
    <PartyContext.Provider value={value}>
      {children}
    </PartyContext.Provider>
  );
}

export function useParty() {
  const ctx = useContext(PartyContext);
  if (!ctx) throw new Error("useParty must be used within PartyProvider");
  return ctx;
}
