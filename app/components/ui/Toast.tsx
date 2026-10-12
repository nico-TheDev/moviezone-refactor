import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, type ReactNode, useCallback, useContext, useState } from "react";
import { Link } from "react-router";
import { MOTION_DURATION, MOTION_EASE_OUT } from "@/lib/motion";

type ToastMessage = {
    id: number;
    message: string;
    loginLink?: boolean;
};

type ToastContextValue = {
    showToast: (message: string, options?: { loginLink?: boolean }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const reduce = useReducedMotion();

    const showToast = useCallback((message: string, options?: { loginLink?: boolean }) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, loginLink: options?.loginLink }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div
                role="status"
                aria-live="polite"
                className="fixed bottom-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col items-end gap-2 sm:max-w-sm pb-[max(0px,env(safe-area-inset-bottom))] pr-[max(0px,env(safe-area-inset-right))]"
            >
                <AnimatePresence initial={false}>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            layout={!reduce}
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.15 } }}
                            transition={{ duration: MOTION_DURATION, ease: MOTION_EASE_OUT }}
                            className="w-full bg-surface text-ink border border-line rounded-xl p-4 shadow-popover flex items-start gap-3"
                        >
                            <p className="text-sm flex-1">
                                {toast.message}{" "}
                                {toast.loginLink && (
                                    <Link to="/login" className="text-primary-text underline">
                                        Log in
                                    </Link>
                                )}
                            </p>
                            <button
                                type="button"
                                onClick={() => dismiss(toast.id)}
                                aria-label="Dismiss"
                                className="-m-1 cursor-pointer rounded-md p-1 text-ink-muted transition-colors hover:text-ink"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}
