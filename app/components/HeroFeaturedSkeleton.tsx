import { Skeleton } from "@/components/ui/Skeleton";

export function HeroFeaturedSkeleton() {
    return (
        <div className="flex-[0_0_100%] min-w-0 h-svh relative">
            <Skeleton className="absolute z-0 w-full h-full rounded-none" />

            <div className="relative flex max-w-7xl w-full mx-auto h-full z-10 flex-col justify-center pt-50">
                <div className="p-4">
                    <Skeleton className="h-10 w-2/3 max-w-2xl mb-4" />

                    <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-40" />
                    </div>

                    <div className="max-w-xl mb-6 space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                        <Skeleton className="h-3 w-3/4" />
                    </div>

                    <Skeleton className="h-10 w-36 rounded-full" />
                </div>
            </div>
        </div>
    );
}
