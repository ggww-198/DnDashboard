import type Abilities from "./CharacterDetails/abilities";
import type Attack from "./CharacterDetails/attack";
import type Combat from "./CharacterDetails/combat";
import type Currency from "./CharacterDetails/currency";
import type Information from "./CharacterDetails/information";
import type InventoryItem from "./CharacterDetails/inventoryitem";
import type OtherProficiencies from "./CharacterDetails/otherprofs";
import type Personality from "./CharacterDetails/personality";
import type Proficiency from "./CharacterDetails/proficiency";
import type Skills from "./CharacterDetails/skills";
import type SpellCasting from "./CharacterDetails/spellcasting";
import type Spells from "./CharacterDetails/spells";
import type Traits from "./CharacterDetails/traits";

export default interface Character {
    charId: string;
    charName: string;
    info: Information;
    abilities: Abilities;
    combat: Combat;
    proficiency: Proficiency;
    skills: Skills;
    currency: Currency;
    spellcasting: SpellCasting;
    attacks: Attack[];
    inventory: InventoryItem[];
    spells: Spells;
    traits: Traits;
    other_profs: OtherProficiencies;
    personality: Personality;
}