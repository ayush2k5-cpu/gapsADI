export interface GenerateRequest { story_idea: string; genre: string; language: string; tone: number }
export interface Character {
    name: string;
    role: "PROTAGONIST" | "ANTAGONIST" | "SUPPORTING" | "MINOR";
    bio: string;
    arc: string;
}
export interface GenerateResponse { project_id: string; screenplay: string; scene_count: number; characters: Character[] }

export interface AnalyzeRequest { project_id: string }
export interface TensionPoint { scene: number; score: number }
export interface ActScores { act1: number; act2: number; act3: number }
export interface PacingBlock { scene: number; speed: "fast" | "medium" | "slow" }
export interface Flag { scene_range: string; issue: string; suggestion: string }
export interface AnalyzeResponse { health_score: number; pacing_score: number; balance_score: number; tension_score: number; tension_curve: TensionPoint[]; character_heatmap: Record<string, ActScores>; pacing_blocks: PacingBlock[]; flags: Flag[] }

export interface MoodboardRequest { project_id: string; act: 1 | 2 | 3 }
export interface MoodboardResponse { image_url: string; caption: string }

export interface TranslateRequest { project_id: string; target_language: string }
export interface TranslateResponse { translated_screenplay: string; language: string; note: string; fallback?: boolean }

export interface ExportRequest { project_id: string; format: "pdf" | "docx" | "txt" }
