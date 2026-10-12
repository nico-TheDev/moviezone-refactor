import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

export function Modal({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        const onPointerDown = (e: MouseEvent) => {
            if (!panelRef.current?.contains(e.target as Node)) onClose();
        };
        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onPointerDown);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onPointerDown);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-scrim/80"
            role="presentation"
        >
            <div
                ref={panelRef}
                className="bg-surface text-ink rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-line"
            >
                <div className="flex items-center justify-between p-4 border-b border-line">
                    {title && <h3 className="text-lg font-semibold text-ink">{title}</h3>}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="ml-auto -mr-2 inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}
