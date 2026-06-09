import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { X } from "lucide-react";

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
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="bg-gray-900 text-white border border-white/10 rounded-lg p-4 shadow-lg flex items-start gap-3">
                        <p className="text-sm flex-1">
                            {toast.message}{" "}
                            {toast.loginLink && (
                                <Link to="/login" className="text-primary underline">
                                    Log in
                                </Link>
                            )}
                        </p>
                        <button
                            type="button"
                            onClick={() => dismiss(toast.id)}
                            className="text-gray-400 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}
