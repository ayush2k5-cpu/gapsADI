import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import React from "react";
import Loading from "./page";
import * as api from "@/lib/api";

const push = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
}));

vi.mock("@/lib/api", () => ({
    generateScreenplay: vi.fn(),
    analyzeScreenplay: vi.fn(),
    getMoodboard: vi.fn(),
}));

describe("Loading page", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        window.localStorage.clear();
    });

    it(
        "calls generateScreenplay exactly once even under React Strict Mode's double-invoke (covers: bug fix for the duplicate generation pipeline)",
        async () => {
            window.localStorage.setItem(
                "scriptoria_request",
                JSON.stringify({ story_idea: "A story", genre: "Thriller", language: "English", tone: 50 })
            );
            vi.mocked(api.generateScreenplay).mockResolvedValue({
                project_id: "p1",
                screenplay: "INT. HOUSE - DAY",
                scene_count: 1,
                characters: [],
            });
            vi.mocked(api.analyzeScreenplay).mockResolvedValue({} as any);
            vi.mocked(api.getMoodboard).mockResolvedValue({ image_url: "", caption: "" });

            render(
                <React.StrictMode>
                    <Loading />
                </React.StrictMode>
            );

            // Wait for the whole pipeline to finish (not just the generate call) so no
            // dangling timers/promises from this test bleed into the next one.
            await waitFor(() => expect(push).toHaveBeenCalledWith("/output"), { timeout: 3000 });

            expect(api.generateScreenplay).toHaveBeenCalledTimes(1);
        },
        10000
    );

    it(
        "redirects to / without calling generateScreenplay when localStorage has no story idea",
        async () => {
            window.localStorage.removeItem("scriptoria_request");

            render(<Loading />);

            await waitFor(() => expect(push).toHaveBeenCalledWith("/"), { timeout: 3000 });
            expect(api.generateScreenplay).not.toHaveBeenCalled();
        },
        10000
    );
});
