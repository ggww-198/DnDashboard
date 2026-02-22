export default interface OtherProficiencies {
    tools: ToolDetail[];
    languages: string[];
    armor: string[];
    weapons: string[];
    other: string[];
}

interface ToolDetail {
    name: string;
    bonus: string;
}