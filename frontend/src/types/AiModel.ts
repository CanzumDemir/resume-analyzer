// AI assistance disclosure: AI tools assisted with frontend UI implementation,
// styling, Tailwind CSS, layout, and implementation details during development.
// Exact historical line-level provenance is unavailable; see AI_ASSISTANCE.md.
//
// AI assistance (2026-08-30): OpenAI Codex helped remove the unused
// reasoning field so this type reflects what the API actually receives.

export interface AiModel {
    id: string;
    name: string;
    description: string;
}
