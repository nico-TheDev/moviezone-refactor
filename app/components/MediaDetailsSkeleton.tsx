import { Skeleton } from "./ui/Skeleton";

export function MediaDetailsSkeleton() {
    return (
        <div className="bg-canvas text-ink min-h-screen">
            <Skeleton className="h-[70vh] w-full rounded-none" />
            <div className="max-w-[85%] mx-auto py-12 space-y-12">
                <div>
                    <Skeleton className="h-8 w-32 mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {["crew-1", "crew-2", "crew-3", "crew-4", "crew-5", "crew-6"].map((key) => (
                            <Skeleton key={key} className="h-20 rounded-lg" />
                        ))}
                    </div>
                </div>
                <div>
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="flex gap-4 overflow-hidden">
                        {["card-1", "card-2", "card-3", "card-4", "card-5"].map((key) => (
                            <Skeleton key={key} className="h-40 w-[300px] shrink-0 rounded-md" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
