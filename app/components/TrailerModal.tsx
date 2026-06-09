import type { MovieVideo } from "@/types/tmdb";
import { Modal } from "./ui/Modal";

export function TrailerModal({
    open,
    onClose,
    videos,
}: {
    open: boolean;
    onClose: () => void;
    videos: MovieVideo[];
}) {
    const youtubeVideos = videos.filter((v) => v.site === "YouTube");

    return (
        <Modal open={open} onClose={onClose} title="Trailers">
            {youtubeVideos.length === 0 ? (
                <p className="text-gray-400 text-sm">No trailers available.</p>
            ) : (
                <div className="space-y-6">
                    {youtubeVideos.map((video) => (
                        <div key={video.id}>
                            <p className="text-sm text-gray-300 mb-2">{video.name}</p>
                            <div className="aspect-video w-full rounded-md overflow-hidden">
                                <iframe
                                    src={`https://www.youtube.com/embed/${video.key}`}
                                    title={video.name}
                                    className="w-full h-full"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
}
