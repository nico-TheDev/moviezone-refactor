import { Skeleton } from "./ui/Skeleton";

export function MediaDetailsSkeleton() {
    return (
        <div className="bg-black text-white min-h-screen">
            <Skeleton className="h-[70vh] w-full rounded-none" />
            <div className="max-w-[85%] mx-auto py-12 space-y-12">
                <div>
                    <Skeleton className="h-8 w-32 mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 rounded-lg" />
                        ))}
                    </div>
                </div>
                <div>
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="flex gap-4 overflow-hidden">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 w-[300px] shrink-0 rounded-md" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
