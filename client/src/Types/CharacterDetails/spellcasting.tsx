export default interface SpellCasting {
    ability: string;
    save_dc: string;
    attack: string;
    slots: SpellSlots
}

interface SpellSlots {
    level_1: SpellDetail;
    level_2: SpellDetail;
    level_3: SpellDetail;
    level_4: SpellDetail;
    level_5: SpellDetail;
    level_6: SpellDetail;
    level_7: SpellDetail;
    level_8: SpellDetail;
    level_9: SpellDetail;
}

interface SpellDetail {
    total: string;
    used: string;
}