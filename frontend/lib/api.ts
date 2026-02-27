import {
    GenerateRequest, GenerateResponse,
    AnalyzeRequest, AnalyzeResponse,
    MoodboardRequest, MoodboardResponse,
    TranslateRequest, TranslateResponse,
    ExportRequest,
    CBFCRequest, CBFCResponse
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const generateScreenplay = async (payload: GenerateRequest): Promise<GenerateResponse> => {
    const res = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.code || "Failed to generate screenplay");
    }
    return res.json();
};

export const analyzeScreenplay = async (payload: AnalyzeRequest): Promise<AnalyzeResponse> => {
    const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.code || "Failed to analyze screenplay");
    }
    return res.json();
};

export const getMoodboard = async (payload: MoodboardRequest): Promise<MoodboardResponse> => {
    const res = await fetch(`${API_URL}/api/moodboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.code || "Failed to fetch moodboard");
    }
    return res.json();
};

export const translateScreenplay = async (payload: TranslateRequest): Promise<TranslateResponse> => {
    const res = await fetch(`${API_URL}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.code || "Failed to translate screenplay");
    }
    return res.json();
};

export const exportScreenplay = async (payload: ExportRequest): Promise<Blob> => {
    const formData = new URLSearchParams();
    formData.append("project_id", payload.project_id);
    formData.append("format", payload.format);

    const res = await fetch(`${API_URL}/api/export`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
    });
    if (!res.ok) throw new Error("Failed to export screenplay");
    return res.blob();
};

export const getCBFCRating = async (payload: CBFCRequest): Promise<CBFCResponse> => {
    const res = await fetch(`${API_URL}/api/cbfc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to get CBFC rating");
    return res.json();
};
