export default interface Spells {
    cantrips: SpellDetail[];
    [levels: string]: SpellDetail[]
}

interface SpellDetail {
    name: string;
    level: string;
    school: string;
    casting_time: string;
    range: string;
    target: string;
    duration: string;
    components: string;
    materials?: string;
    ritual: string;
    concentration: string;
    prepared: string;
    description: string;
    attack_bonus: string;
}