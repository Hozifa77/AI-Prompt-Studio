/**
 * AI Prompt Studio — Main Application Entry
 */
(function () {
    'use strict';

    // Apply saved theme
    const savedTheme = Store.get('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    _updateThemeIcon(savedTheme);

    // Register all pages with the router
    Router.register('dashboard', () => DashboardPage.render());
    Router.register('prompt-image', () => PromptImagePage.render());
    Router.register('prompt-video', () => PromptVideoPage.render());
    Router.register('developers', () => DevelopersPage.render());
    Router.register('writers', () => WritersPage.render());
    Router.register('gen-image', () => GenImagePage.render());
    Router.register('gen-video', () => GenVideoPage.render());
    Router.register('gen-doc', () => GenDocPage.render());
    Router.register('gen-audio', () => GenAudioPage.render());
    Router.register('analysts', () => AnalystsPage.render());
    Router.register('marketers', () => MarketersPage.render());
    Router.register('researchers', () => ResearchersPage.render());
    Router.register('saved', () => SavedPage.render());

    // Initialize auth
    Auth.init();

    // Initialize router (renders dashboard)
    Router.init();

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const current = Store.get('theme');
        const next = current === 'dark' ? 'light' : 'dark';
        Store.set('theme', next);
        document.documentElement.setAttribute('data-theme', next);
        _updateThemeIcon(next);
    });

    function _updateThemeIcon(theme) {
        const sunIcon = document.querySelector('.icon-sun');
        const moonIcon = document.querySelector('.icon-moon');
        if (theme === 'dark') {
            sunIcon?.classList.remove('hidden');
            moonIcon?.classList.add('hidden');
        } else {
            sunIcon?.classList.add('hidden');
            moonIcon?.classList.remove('hidden');
        }
    }

    // Mobile sidebar toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarClose = document.getElementById('sidebar-close');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
    });

    sidebarClose.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    });

    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    });

    // Global search
    const globalSearch = document.getElementById('global-search');
    globalSearch.addEventListener('input', Utils.debounce(() => {
        const query = globalSearch.value.trim();
        if (query.length > 1) {
            SavedPage._searchQuery = query;
            SavedPage._filterModule = 'all';
            Router.navigate('saved');
        }
    }, 400));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Cmd/Ctrl + K = Focus search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            globalSearch.focus();
        }
        // Escape = Close modals
        if (e.key === 'Escape') {
            document.getElementById('premium-modal')?.classList.add('hidden');
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        }
    });

    // Premium modal — plan selection
    document.querySelectorAll('.plan-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const plan = btn.dataset.plan;
            Store.setPlan(plan);
            document.getElementById('premium-modal').classList.add('hidden');
            Utils.toast(`Upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan! 🎉`, 'success');

            document.querySelectorAll('.badge-pro').forEach(badge => {
                badge.textContent = '✓';
                badge.style.background = 'rgba(34, 197, 94, 0.15)';
                badge.style.color = '#22C55E';
            });
        });
    });

    // Update sidebar info dynamically based on Store
    function _updateSidebar() {
        const plan = Store.get('plan');
        const credits = Store.get('credits');
        const isPremium = plan !== 'free';

        document.getElementById('sidebar-plan-name').textContent = plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan';
        document.getElementById('sidebar-credits').textContent = credits.toLocaleString() + ' credits available';
        document.getElementById('sidebar-plan-tag').textContent = plan;

        if (isPremium) {
            document.getElementById('sidebar-upgrade-btn').style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))';
            document.getElementById('sidebar-upgrade-btn').style.borderColor = 'rgba(34, 197, 94, 0.2)';
            document.querySelector('#sidebar-upgrade-btn .upgrade-icon').style.color = '#22c55e';

            document.querySelectorAll('.badge-pro').forEach(badge => {
                badge.textContent = '✓';
                badge.style.background = 'rgba(34, 197, 94, 0.15)';
                badge.style.color = '#22C55E';
            });
        }
    }

    // Call initially
    _updateSidebar();

    // Module card clicks on dashboard
    Store.subscribe((key) => {
        if (key === 'savedPrompts' && Store.get('currentPage') === 'dashboard') {
            // Refresh dashboard when prompts change
        }
        if (key === 'credits' || key === 'plan') {
            _updateSidebar();
        }
    });

    console.log('%c🚀 AI Prompt Studio loaded', 'color: #8B5CF6; font-size: 16px; font-weight: bold;');
})();
