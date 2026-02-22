import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type CharacterDrawerContextValue = {
  openDrawer: (charId: string) => void;
  closeDrawer: () => void;
  drawerCharId: string | null;
};

const CharacterDrawerContext = createContext<CharacterDrawerContextValue | null>(null);

export function CharacterDrawerProvider({ children }: { children: ReactNode }) {
  const [drawerCharId, setDrawerCharId] = useState<string | null>(null);
  const openDrawer = useCallback((charId: string) => setDrawerCharId(charId), []);
  const closeDrawer = useCallback(() => setDrawerCharId(null), []);
  const value: CharacterDrawerContextValue = { openDrawer, closeDrawer, drawerCharId };
  return (
    <CharacterDrawerContext.Provider value={value}>
      {children}
    </CharacterDrawerContext.Provider>
  );
}

export function useCharacterDrawer() {
  const ctx = useContext(CharacterDrawerContext);
  if (!ctx) throw new Error("useCharacterDrawer must be used within CharacterDrawerProvider");
  return ctx;
}
