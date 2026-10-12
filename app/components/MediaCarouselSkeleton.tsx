import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/css-helpers";
import { SectionHeading } from "./ui/SectionHeading";

interface IProps {
    title: string;
    orientation?: "portrait" | "landscape";
    count?: number;
}

/** Mirrors MediaCarousel's geometry so nothing shifts when the data lands. */
export function MediaCarouselSkeleton({ title, orientation = "landscape", count = 6 }: IProps) {
    return (
        <div className="w-full mx-auto" aria-busy="true">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <SectionHeading>{title}</SectionHeading>
                <Skeleton className="h-11 w-48 rounded-full" />
            </div>
            <div className="overflow-hidden">
                <div className="flex">
                    {Array.from({ length: count }, (_, index) => `slide-${index}`).map(
                        (slideKey) => (
                            <div
                                key={slideKey}
                                className={cn(
                                    "min-w-0 pr-4",
                                    orientation === "landscape"
                                        ? "flex-[0_0_200px] md:flex-[0_0_300px]"
                                        : "flex-[0_0_160px] md:flex-[0_0_250px]",
                                )}
                            >
                                <Skeleton
                                    className={cn(
                                        "w-full",
                                        orientation === "landscape" ? "h-40" : "h-100",
                                    )}
                                />
                                <Skeleton className="h-4 w-3/4 mt-2" />
                                <Skeleton className="h-3 w-1/2 mt-1.5" />
                            </div>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
}
