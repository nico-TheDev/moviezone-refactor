import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { ReviewsSection } from "@/components/ReviewsSection";

describe("ReviewsSection", () => {
    it("renders linked review when url is present", () => {
        render(
            <ReviewsSection
                reviews={[
                    {
                        id: "1",
                        author: "Critic",
                        content: "Great film.",
                        url: "https://www.themoviedb.org/review/abc",
                    },
                ]}
            />,
        );

        const link = screen.getByRole("link", { name: /critic/i });
        expect(link).toHaveAttribute("href", "https://www.themoviedb.org/review/abc");
        expect(link).toHaveAttribute("target", "_blank");
        cleanup();
    });

    it("renders static card when url is missing", () => {
        render(
            <ReviewsSection
                reviews={[{ author: "Anon", content: "No link." }]}
            />,
        );

        expect(screen.queryByRole("link")).not.toBeInTheDocument();
        expect(screen.getByText("Anon")).toBeInTheDocument();
    });
});
