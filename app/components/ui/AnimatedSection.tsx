import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type AnimatedSectionProps = {
    children: ReactNode;
    className?: string;
    delay?: number;
};

export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
    const reduce = useReducedMotion();

    if (reduce) {
        return <section className={className}>{children}</section>;
    }

    return (
        <motion.section
            className={className}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.35, ease: "easeOut", delay }}>
            {children}
        </motion.section>
    );
}
