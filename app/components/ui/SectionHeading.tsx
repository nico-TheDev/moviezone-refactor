import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { MOTION_EASE_OUT } from "@/lib/motion";
import { cn } from "@/utils/css-helpers";

type SectionHeadingProps = {
    children: ReactNode;
    as?: "h1" | "h2";
    /** `page` titles a route; `section` titles a block inside one. */
    size?: "page" | "section";
    className?: string;
};

/**
 * The brand rule plus a heading: the one heading treatment across every route.
 * The rule draws upward the first time the heading enters view, so each
 * section announces itself with the brand mark rather than a generic fade.
 */
export function SectionHeading({
    children,
    as: Tag = "h2",
    size = "section",
    className,
}: SectionHeadingProps) {
    const reduce = useReducedMotion();
    const ruleClassName = cn(
        "block w-1 shrink-0 rounded-full bg-primary",
        size === "page" ? "h-10" : "h-8",
    );

    return (
        <Tag
            className={cn(
                "flex items-center gap-3 font-bold text-ink text-balance",
                size === "page" ? "text-3xl" : "text-2xl",
                className,
            )}
        >
            {reduce ? (
                <span aria-hidden className={ruleClassName} />
            ) : (
                <motion.span
                    aria-hidden
                    className={cn(ruleClassName, "origin-bottom")}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: MOTION_EASE_OUT, delay: 0.1 }}
                />
            )}
            {children}
        </Tag>
    );
}
