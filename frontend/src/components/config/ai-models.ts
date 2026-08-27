import { AiModel } from "@/types/AiModel";

export const AI_MODELS: AiModel[] = [
    {
        id: "gpt-5.6-sol",
        name: "Fast",
        description: "Good for first analysis and quick results.",
        reasoning: "medium"
    },
    {
        id: "gpt-5.6-terra",
        name: "Standard",
        description: "Best balance between pricing and quality.",
        reasoning: "medium"
    },
    {
        id: "gpt-5.6-luna",
        name: "Expert",
        description: "Maximum reasoning capabilities for complex tasks.",
        reasoning: "medium"
    }
]