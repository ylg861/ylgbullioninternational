/* PWA service worker registration */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/notification-sw.js')
            .catch(function () {});
    });
}
