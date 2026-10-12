import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { MovieReviewsResponse } from "@/types/tmdb";

type Review = NonNullable<MovieReviewsResponse["results"]>[number];

function getReviewUrl(review: Review): string | undefined {
    return review.url ?? (review.id ? `https://www.themoviedb.org/review/${review.id}` : undefined);
}

const cardClassName = "block rounded-xl border border-line bg-surface p-5";
const linkedCardClassName = `${cardClassName} transition-colors duration-200 hover:border-primary`;

function ReviewCard({ review, index }: { review: Review; index: number }) {
    const href = getReviewUrl(review);

    const content = (
        <>
            <p className="text-sm font-medium text-primary-text mb-1">{review.author}</p>
            <p className="text-sm text-ink-muted leading-relaxed line-clamp-4">{review.content}</p>
        </>
    );

    return (
        <Reveal when="inView" index={index}>
            {href ? (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkedCardClassName}
                >
                    {content}
                </a>
            ) : (
                <article className={cardClassName}>{content}</article>
            )}
        </Reveal>
    );
}

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
    const visible = reviews.slice(0, 5);

    return (
        <Reveal as="section" when="inView" className="my-12">
            <div className="max-w-[85%] mx-auto py-6">
                <SectionHeading className="mb-8">Reviews</SectionHeading>
                {visible.length === 0 ? (
                    <p className="text-ink-muted text-sm">No reviews yet.</p>
                ) : (
                    <div className="space-y-4">
                        {visible.map((review, index) => (
                            <ReviewCard key={review.id ?? index} review={review} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </Reveal>
    );
}
