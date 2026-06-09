type Review = {
    id?: string;
    author?: string;
    content?: string;
    created_at?: string;
};

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
    const visible = reviews.slice(0, 5);

    return (
        <section className="my-12">
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
                            <article
                                key={review.id ?? index}
                                className="bg-gray-900/80 p-4 rounded-lg border border-white/5">
                                <p className="text-sm font-medium text-primary mb-1">
                                    {review.author}
                                </p>
                                <p className="text-sm text-gray-300 line-clamp-4">{review.content}</p>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
