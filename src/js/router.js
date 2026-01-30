/**
 * Hash-based Router
 * Handles navigation between #/dashboard, #/realtime, etc.
 */

export class Router {
    constructor(routes) {
        this.routes = routes; // dictionary: { '/path': ComponentClass }
        this.currentPath = null;
        this.contentArea = document.getElementById('content-area');
        this.activeComponent = null;

        // Bind events
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    async handleRoute() {
        // Get hash or default to #/dashboard
        let hash = window.location.hash.slice(1) || '/dashboard';

        // Remove query params if any for matching
        const [path, query] = hash.split('?');

        console.log(`Navigating to: ${path}`);

        // Update Sidebar Active State
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.toggle('active', el.getAttribute('href') === `#${path}`);
        });

        // Resolve Component
        const Component = this.routes[path]; // || NotFoundComponent;

        if (Component) {
            // Cleanup previous component
            if (this.activeComponent && typeof this.activeComponent.destroy === 'function') {
                this.activeComponent.destroy();
            }

            // Render new component
            this.contentArea.innerHTML = ''; // basic clear
            this.activeComponent = new Component(this.contentArea);

            if (typeof this.activeComponent.mount === 'function') {
                await this.activeComponent.mount();
            }
        } else {
            this.contentArea.innerHTML = `
                <div class="error-page">
                    <h2>404 - Page Not Found</h2>
                    <p>The requested path <code>${path}</code> does not exist.</p>
                </div>`;
        }

        this.currentPath = path;
    }
}
