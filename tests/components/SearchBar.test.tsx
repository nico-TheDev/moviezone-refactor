import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/dom";
import { SearchBar } from "@/components/SearchBar";
import { renderWithProviders } from "../utils/render";

const navigate = vi.fn();

vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useNavigate: () => navigate,
    };
});

describe("SearchBar", () => {
    it("debounces autocomplete and navigates on select", async () => {
        navigate.mockClear();
        const user = userEvent.setup();
        renderWithProviders(<SearchBar />);

        await user.type(screen.getByPlaceholderText("Search ..."), "fight");

        await waitFor(() => {
            expect(screen.getByText("Fight Club")).toBeInTheDocument();
        });

        expect(document.querySelector('img[src*="image.tmdb.org"]')).toBeTruthy();

        await user.click(screen.getByText("Fight Club"));
        expect(navigate).toHaveBeenCalledWith("/media/movie/550");
    });
});
