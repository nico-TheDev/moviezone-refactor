import type { Route } from "./+types/error-page";
import { ErrorState } from "@/components/ui/ErrorState";
import { motion } from "motion/react";

export function meta({ params }: Route.MetaArgs) {
    const message = decodeURIComponent(params.message).replace(/-/g, " ");
    return [{ title: `${message} | MovieZone` }];
}

export default function ErrorPage({ params }: Route.ComponentProps) {
    const message = decodeURIComponent(params.message).replace(/-/g, " ");

    return (
        <main className="min-h-[70vh] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md">
                <ErrorState title="Oops!" message={message} />
            </motion.div>
        </main>
    );
}
