export interface AiModel {
    id: string;
    name: string;
    description: string;
    reasoning: ReasoningEfforts;
}

export type ReasoningEfforts = "low" | "medium" | "high";