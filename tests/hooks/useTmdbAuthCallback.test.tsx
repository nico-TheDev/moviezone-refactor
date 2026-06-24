import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { waitFor } from "@testing-library/dom";
import { MemoryRouter, Route, Routes } from "react-router";
import { useTmdbAuthCallback } from "@/hooks/useTmdbAuthCallback";
import { useAuthStore } from "@/stores/auth";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";

const navigate = vi.fn();

vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useNavigate: () => navigate,
    };
});

function wrapper(initial: string) {
    return ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={[initial]}>
            <Routes>
                <Route path="*" element={children} />
            </Routes>
        </MemoryRouter>
    );
}

describe("useTmdbAuthCallback", () => {
    it("redirects to login when denied", async () => {
        navigate.mockClear();
        renderHook(() => useTmdbAuthCallback(), {
            wrapper: wrapper("/?approved=false"),
        });

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith("/login", { replace: true });
        });
    });

    it("creates session on approved callback", async () => {
        navigate.mockClear();
        useAuthStore.setState({ mode: "none", account: null });

        server.use(
            http.post("/api/auth/session", () =>
                HttpResponse.json({
                    account: { id: 9, username: "neo", name: "Neo" },
                }),
            ),
        );

        renderHook(() => useTmdbAuthCallback(), {
            wrapper: wrapper("/?request_token=abc&approved=true"),
        });

        await waitFor(() => {
            expect(useAuthStore.getState().account?.username).toBe("neo");
            expect(navigate).toHaveBeenCalledWith("/profile", { replace: true });
        });
    });
});
