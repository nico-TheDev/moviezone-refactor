import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: (failureCount, error) => {
                if (
                    typeof error === "object" &&
                    error !== null &&
                    "status" in error &&
                    (error as { status: number }).status === 429
                ) {
                    return false;
                }
                return failureCount < 1;
            },
            refetchOnWindowFocus: false,
        },
    },
});
