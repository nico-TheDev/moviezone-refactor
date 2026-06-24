export function registerPwa() {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

    import("virtual:pwa-register").then(({ registerSW }) => {
        registerSW({ immediate: true });
    });
}
