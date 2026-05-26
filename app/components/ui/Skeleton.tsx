import { cn } from "@/utils/css-helpers";
import type { HTMLAttributes } from "react";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse bg-white/10 rounded-md", className)}
            {...props}
        />
    );
}
