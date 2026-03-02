// Additional helper functions
window.frexibs = {
    reset: () => {
        window.frexibsVerified = false;
        document.querySelectorAll('xibs').forEach(el => {
            el.verified = false;
            // Trigger re-render
            el.innerHTML = '';
            el.connectedCallback();
        });
    },
    
    check: () => window.frexibsVerified,
    
    config: (options) => {
        // Future: theme customization
        console.log('FREEXIBS config:', options);
    }
};