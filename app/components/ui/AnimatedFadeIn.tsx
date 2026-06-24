import { MOTION_DURATION, MOTION_EASE_OUT } from "@/lib/motion";
import { cn } from "@/utils/css-helpers";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function AnimatedFadeIn({
    children,
    className,
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const reduce = useReducedMotion();

    if (reduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={cn(className)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MOTION_DURATION, ease: MOTION_EASE_OUT, delay }}>
            {children}
        </motion.div>
    );
}
