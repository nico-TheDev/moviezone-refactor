import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { MovieReviewsResponse } from "@/types/tmdb";
import { motion, useReducedMotion } from "motion/react";

type Review = NonNullable<MovieReviewsResponse["results"]>[number];

function getReviewUrl(review: Review): string | undefined {
    return review.url ?? (review.id ? `https://www.themoviedb.org/review/${review.id}` : undefined);
}

const linkedCardClassName =
    "block bg-gray-900/80 p-4 rounded-lg border border-transparent hover:border-primary transition-all duration-300 cursor-pointer";
const staticCardClassName = "bg-gray-900/80 p-4 rounded-lg border border-white/5";

function ReviewCard({ review, index }: { review: Review; index: number }) {
    const reduce = useReducedMotion();
    const href = getReviewUrl(review);

    const content = (
        <>
            <p className="text-sm font-medium text-primary mb-1">{review.author}</p>
            <p className="text-sm text-gray-300 line-clamp-4">{review.content}</p>
        </>
    );

    const card = href ? (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkedCardClassName}>
            {content}
        </a>
    ) : (
        <article className={staticCardClassName}>{content}</article>
    );

    if (reduce) {
        return <div key={review.id ?? index}>{card}</div>;
    }

    return (
        <motion.div
            key={review.id ?? index}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.05 }}>
            {card}
        </motion.div>
    );
}

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
    const visible = reviews.slice(0, 5);

    return (
        <AnimatedSection className="my-12" delay={0.1}>
            <div className="max-w-[85%] mx-auto py-6">
                <h4 className="text-2xl font-bold mb-8 flex items-center gap-2 text-white">
                    <span className="inline-block w-1 h-10 bg-primary" />
                    Reviews
                </h4>
                {visible.length === 0 ? (
                    <p className="text-gray-400 text-sm">No reviews yet.</p>
                ) : (
                    <div className="space-y-4">
                        {visible.map((review, index) => (
                            <ReviewCard key={review.id ?? index} review={review} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </AnimatedSection>
    );
}
