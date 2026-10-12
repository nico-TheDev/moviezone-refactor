import { ErrorState } from "@/components/ui/ErrorState";
import { Reveal } from "@/components/ui/Reveal";
import type { Route } from "./+types/error-page";

export function meta({ params }: Route.MetaArgs) {
    const message = decodeURIComponent(params.message).replace(/-/g, " ");
    return [{ title: `${message} | MovieZone` }];
}

export default function ErrorPage({ params }: Route.ComponentProps) {
    const message = decodeURIComponent(params.message).replace(/-/g, " ");

    return (
        <main className="min-h-[70vh] flex items-center justify-center px-4">
            <Reveal className="w-full max-w-md">
                <ErrorState title="Oops!" message={message} />
            </Reveal>
        </main>
    );
}
