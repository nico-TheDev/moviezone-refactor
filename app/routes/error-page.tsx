import type { Route } from "./+types/error-page";
import { Link } from "react-router";
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
                className="text-center text-white max-w-md">
                <h1 className="text-4xl font-bold mb-4 text-primary">Oops!</h1>
                <p className="text-gray-300 mb-8 capitalize">{message}</p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover rounded-full font-medium transition-colors">
                    Return to Home
                </Link>
            </motion.div>
        </main>
    );
}
