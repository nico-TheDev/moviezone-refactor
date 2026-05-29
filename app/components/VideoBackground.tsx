import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { API } from "@/constants/api";

const YT_ORIGIN = "https://www.youtube-nocookie.com";

interface IProps {
    backdropPath: string | null | undefined;
    youtubeId: string | undefined;
    children?: React.ReactNode;
}

export default function VideoBackground({ backdropPath, youtubeId, children }: IProps) {
    const [activated, setActivated] = useState(false);
    const [muted, setMuted] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!youtubeId) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const saveData =
            (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
                ?.saveData === true;
        if (reduce || saveData) return;

        const t = setTimeout(() => setActivated(true), 1500);
        return () => clearTimeout(t);
    }, [youtubeId]);

    const sendCommand = (func: "mute" | "unMute" | "playVideo") => {
        iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func, args: [] }),
            YT_ORIGIN,
        );
    };

    const toggleMute = () => {
        if (muted) {
            sendCommand("unMute");
            // iOS Safari may pause the video when unmuting; nudge it back to play.
            sendCommand("playVideo");
            setMuted(false);
        } else {
            sendCommand("mute");
            setMuted(true);
        }
    };

    return (
        <section className="relative h-svh w-full overflow-hidden bg-black">
            {backdropPath && (
                <img
                    src={`${API.IMAGE_BACKDROP_URL}${backdropPath}`}
                    alt=""
                    aria-hidden
                    fetchPriority="high"
                    className={`absolute inset-0 w-full h-full object-cover brightness-50 transition-opacity duration-700 ${activated ? "opacity-0" : "opacity-100"}`}
                />
            )}
            {activated && youtubeId && (
                <iframe
                    ref={iframeRef}
                    title="Background trailer"
                    src={`${YT_ORIGIN}/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    loading="lazy"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[1.3] w-[177.78vh] h-[56.25vw] min-w-full min-h-full pointer-events-none brightness-50 border-0"
                />
            )}

            <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-black pointer-events-none" />

            {activated && youtubeId && (
                <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={muted ? "Unmute trailer" : "Mute trailer"}
                    aria-pressed={!muted}
                    className="absolute bottom-4 right-4 z-20 inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur transition-colors cursor-pointer border border-white/70">
                    {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            )}

            {children}
        </section>
    );
}
