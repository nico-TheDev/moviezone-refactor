import { ToastProvider } from "@/components/ui/Toast";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { ReactElement, ReactNode } from "react";

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
