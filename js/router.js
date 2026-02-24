/**
 * AI Prompt Studio — Client-side Router
 */
const Router = {
    _pages: {},
    _currentPage: null,

    register(name, renderFn) {
        this._pages[name] = renderFn;
    },

    navigate(page) {
        if (!this._pages[page]) return;

        Store.set('currentPage', page);
        this._currentPage = page;

        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Render page
        const container = document.getElementById('page-container');
        container.innerHTML = '';
        const content = this._pages[page]();
        if (typeof content === 'string') {
            container.innerHTML = content;
        } else if (content instanceof Node) {
            container.appendChild(content);
        }

        // Add page entrance animation
        container.firstElementChild?.classList.add('page-enter');

        // Scroll to top
        container.scrollTop = 0;

        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    },

    init() {
        // Nav click handlers
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;

                // Premium lock check
                const premiumPages = ['carousel', 'video', 'analysts', 'researchers'];
                if (premiumPages.includes(page) && Store.get('plan') === 'free') {
                    document.getElementById('premium-modal').classList.remove('hidden');
                    return;
                }

                this.navigate(page);
            });
        });

        // Premium modal close
        document.getElementById('premium-close').addEventListener('click', () => {
            document.getElementById('premium-modal').classList.add('hidden');
        });
        document.getElementById('premium-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.classList.add('hidden');
            }
        });

        // Sidebar upgrade click — show premium modal
        const upgradeEl = document.querySelector('.sidebar-upgrade');
        if (upgradeEl) {
            upgradeEl.addEventListener('click', () => {
                document.getElementById('premium-modal').classList.remove('hidden');
            });
        }

        // Navigate to initial page
        this.navigate('dashboard');
    }
};
