import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/css-helpers";

interface IProps {
    title: string;
    orientation?: "portrait" | "landscape";
    count?: number;
}

export function MediaCarouselSkeleton({ title, orientation = "landscape", count = 6 }: IProps) {
    return (
        <div className="max-w-[90%] mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                <span className="w-1 bg-primary block h-8" />
                {title}
            </h2>
            <div className="relative">
                <div className="overflow-hidden">
                    <div className="flex">
                        {Array.from({ length: count }).map((_, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "min-w-0 pr-4",
                                    orientation === "landscape"
                                        ? "flex-[0_0_300px]"
                                        : "flex-[0_0_250px]",
                                )}>
                                <Skeleton
                                    className={cn(
                                        "w-full mb-2",
                                        orientation === "landscape" ? "h-40" : "h-100",
                                    )}
                                />
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-3 w-10" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
