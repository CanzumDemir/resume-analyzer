// AI assistance disclosure: AI tools assisted with frontend UI implementation,
// styling, Tailwind CSS, layout, and implementation details during development.
// Exact historical line-level provenance is unavailable; see AI_ASSISTANCE.md.
//
// AI assistance (2026-08-30): OpenAI Codex helped correct the Sol/Luna labels
// against the official OpenAI model documentation.
// Source: https://developers.openai.com/api/docs/models

import { AiModel } from "@/types/AiModel";

export const AI_MODELS: AiModel[] = [
    {
        id: "gpt-5.6-luna",
        name: "Fast",
        description: "Cost-efficient model for quick analysis."
    },
    {
        id: "gpt-5.6-terra",
        name: "Standard",
        description: "Best balance between pricing and quality."
    },
    {
        id: "gpt-5.6-sol",
        name: "Expert",
        description: "Most capable model for complex analysis."
    }
]
