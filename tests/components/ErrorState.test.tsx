import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import { ErrorState } from "@/components/ui/ErrorState";
import { renderWithProviders } from "../utils/render";

describe("ErrorState", () => {
    it("renders retry button and calls onRetry", async () => {
        const onRetry = vi.fn();
        const user = userEvent.setup();

        renderWithProviders(
            <ErrorState title="Failed" message="Something broke" onRetry={onRetry} />,
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("Failed")).toBeInTheDocument();
        expect(screen.getByText("Something broke")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Try again" }));
        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("hides home link in section layout", () => {
        const { container } = renderWithProviders(
            <ErrorState layout="section" title="Section error" message="Oops" />,
        );

        expect(container.querySelector(".text-lg")).toBeTruthy();
        expect(screen.queryByRole("link", { name: "Return to Home" })).not.toBeInTheDocument();
    });
});
