import { QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { ToastProvider } from "@/components/ui/Toast";
import { queryClient } from "@/lib/queryClient";

function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <MemoryRouter>{children}</MemoryRouter>
            </ToastProvider>
        </QueryClientProvider>
    );
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
    return render(ui, { wrapper: Providers, ...options });
}
