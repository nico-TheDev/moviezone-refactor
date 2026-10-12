import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
    MOTION_DURATION,
    MOTION_EASE_OUT,
    MOTION_RISE,
    STAGGER_CAP,
    STAGGER_DELAY,
} from "@/lib/motion";

type RevealProps = {
    children: ReactNode;
    className?: string;
    as?: "div" | "section";
    /** `mount` plays on arrival; `inView` waits until the block scrolls in. */
    when?: "mount" | "inView";
    /** Position in a list, for a capped sibling stagger. */
    index?: number;
    delay?: number;
};

/**
 * The app's one entrance: a short rise and fade on the shared ease. Content is
 * rendered in its final state under reduced motion, so nothing depends on the
 * animation running.
 */
export function Reveal({
    children,
    className,
    as = "div",
    when = "mount",
    index = 0,
    delay = 0,
}: RevealProps) {
    const reduce = useReducedMotion();

    if (reduce) {
        const Tag = as;
        return <Tag className={className}>{children}</Tag>;
    }

    const Component = as === "section" ? motion.section : motion.div;
    const target = { opacity: 1, y: 0 };

    return (
        <Component
            className={className}
            initial={{ opacity: 0, y: MOTION_RISE }}
            {...(when === "inView"
                ? { whileInView: target, viewport: { once: true, margin: "-60px" } }
                : { animate: target })}
            transition={{
                duration: MOTION_DURATION,
                ease: MOTION_EASE_OUT,
                delay: delay + Math.min(index, STAGGER_CAP) * STAGGER_DELAY,
            }}
        >
            {children}
        </Component>
    );
}
