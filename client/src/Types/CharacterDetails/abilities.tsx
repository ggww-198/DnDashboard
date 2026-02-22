interface AbilityDetail {
    score: string;
    modifier: string;
}

export default interface Abilities {
    strength: AbilityDetail;
    dexterity: AbilityDetail;
    constitution: AbilityDetail;
    intelligence: AbilityDetail;
    wisdom: AbilityDetail;
    charisma: AbilityDetail;
}