export default interface Traits {
    all: TraitDetail[];
    racial: TraitDetail[];
    class: TraitDetail[];
    feat: TraitDetail[];
    background: TraitDetail[];
    item: TraitDetail[];
    other: TraitDetail[]
}

interface TraitDetail {
    name: string;
    source: string;
    source_type: string;
    description: string;
}