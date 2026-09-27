import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MultilingualTab from "./MultilingualTab";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
    translateScreenplay: vi.fn(),
}));

describe("MultilingualTab", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        window.localStorage.clear();
    });

    it("shows the original screenplay by default", () => {
        render(
            <MultilingualTab originalScript="INT. HOUSE - DAY" projectId="p1" />
        );
        expect(screen.getByText(/INT\. HOUSE - DAY/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "ORIGINAL" })).toBeInTheDocument();
    });

    it("shows the default status note before any translation has been requested", () => {
        render(<MultilingualTab originalScript="INT. HOUSE - DAY" projectId="p1" />);
        expect(screen.getByText("Culturally Generated — Not Translated · Sarvam AI")).toBeInTheDocument();
    });

    it("displays the backend's actual note after a successful translation, not the hardcoded default (covers: bug fix for stale footer text)", async () => {
        const user = userEvent.setup();
        vi.mocked(api.translateScreenplay).mockResolvedValue({
            translated_screenplay: "INT. GHAR - DIN",
            language: "Hindi",
            note: "Culturally Generated via Sarvam mayura:v1",
        });

        render(<MultilingualTab originalScript="INT. HOUSE - DAY" projectId="p1" />);
        await user.click(screen.getByRole("button", { name: "TRANSLATED" }));

        await waitFor(() => expect(screen.getByText(/INT\. GHAR - DIN/)).toBeInTheDocument());

        expect(screen.getByText("Culturally Generated via Sarvam mayura:v1")).toBeInTheDocument();
        expect(screen.queryByText("Culturally Generated — Not Translated · Sarvam AI")).not.toBeInTheDocument();
    });

    it("shows a loading state while the translation request is in flight", async () => {
        const user = userEvent.setup();
        let resolveTranslate!: (value: any) => void;
        vi.mocked(api.translateScreenplay).mockReturnValue(
            new Promise((resolve) => { resolveTranslate = resolve; })
        );

        render(<MultilingualTab originalScript="INT. HOUSE - DAY" projectId="p1" />);
        await user.click(screen.getByRole("button", { name: "TRANSLATED" }));

        expect(screen.getByText(/Generating .* dialogue via Sarvam AI/)).toBeInTheDocument();

        resolveTranslate({ translated_screenplay: "INT. GHAR - DIN", language: "Hindi", note: "done" });
        await waitFor(() => expect(screen.getByText(/INT\. GHAR - DIN/)).toBeInTheDocument());
    });

    it("shows a warning banner and keeps the original text when the backend reports a fallback", async () => {
        const user = userEvent.setup();
        vi.mocked(api.translateScreenplay).mockResolvedValue({
            translated_screenplay: "INT. HOUSE - DAY",
            language: "Hindi",
            note: "Culturally Generated — Not Translated",
            fallback: true,
            error_message: "Translation engine unavailable — showing original screenplay",
        });

        render(<MultilingualTab originalScript="INT. HOUSE - DAY" projectId="p1" />);
        await user.click(screen.getByRole("button", { name: "TRANSLATED" }));

        await waitFor(() =>
            expect(
                screen.getByText("Translation engine unavailable — showing original screenplay")
            ).toBeInTheDocument()
        );
    });

    it("shows an error banner when the translate request throws", async () => {
        const user = userEvent.setup();
        vi.mocked(api.translateScreenplay).mockRejectedValue(new Error("network down"));

        render(<MultilingualTab originalScript="INT. HOUSE - DAY" projectId="p1" />);
        await user.click(screen.getByRole("button", { name: "TRANSLATED" }));

        await waitFor(() =>
            expect(screen.getByText("Translation failed — please try again")).toBeInTheDocument()
        );
    });

    it("does not re-fetch the translation on a second click once it has already loaded", async () => {
        const user = userEvent.setup();
        vi.mocked(api.translateScreenplay).mockResolvedValue({
            translated_screenplay: "INT. GHAR - DIN",
            language: "Hindi",
            note: "Culturally Generated via Sarvam mayura:v1",
        });

        render(<MultilingualTab originalScript="INT. HOUSE - DAY" projectId="p1" />);
        await user.click(screen.getByRole("button", { name: "TRANSLATED" }));
        await waitFor(() => expect(screen.getByText(/INT\. GHAR - DIN/)).toBeInTheDocument());

        await user.click(screen.getByRole("button", { name: "ORIGINAL" }));
        await user.click(screen.getByRole("button", { name: "TRANSLATED" }));

        expect(api.translateScreenplay).toHaveBeenCalledTimes(1);
    });
});
