import { docManager } from './app';

// Ensure docManager is available on window for Alpine x-data="docManager()"
if (typeof window !== 'undefined') {
    window.docManager = docManager;

    document.addEventListener('alpine:init', () => {
        if (window.Alpine) {
            window.Alpine.data('docManager', docManager);
        }
    });
}

export { docManager };

