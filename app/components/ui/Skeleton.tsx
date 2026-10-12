import type { HTMLAttributes } from "react";
import { cn } from "@/utils/css-helpers";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("animate-pulse bg-skeleton rounded-md", className)} {...props} />;
}
