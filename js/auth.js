/**
 * AI Prompt Studio — Auth Module
 */
const Auth = {
    init() {
        const overlay = document.getElementById('auth-overlay');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const skipBtn = document.getElementById('skip-auth');
        const authTrigger = document.getElementById('auth-trigger');
        const tabs = overlay.querySelectorAll('.auth-tab');

        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (tab.dataset.tab === 'login') {
                    loginForm.classList.remove('hidden');
                    registerForm.classList.add('hidden');
                } else {
                    loginForm.classList.add('hidden');
                    registerForm.classList.remove('hidden');
                }
            });
        });

        // Login
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            this._login({ name: email.split('@')[0], email, plan: 'Free' });
        });

        // Register
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            this._login({ name, email, plan: 'Free' });
        });

        // Skip
        skipBtn.addEventListener('click', () => {
            this._login({ name: 'Guest User', email: '', plan: 'Free' });
        });

        // Auth trigger (top bar sign-in)
        authTrigger.addEventListener('click', () => {
            const user = Store.get('user');
            if (user) {
                // Already logged in — show user menu or logout
                if (confirm('Sign out?')) {
                    Store.set('user', null);
                    this._updateUI(null);
                    Utils.toast('Signed out', 'info');
                }
            } else {
                overlay.classList.remove('hidden');
            }
        });

        // Initial state check
        const user = Store.get('user');
        if (!user) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
            this._updateUI(user);
        }
    },

    _login(user) {
        Store.set('user', user);
        document.getElementById('auth-overlay').classList.add('hidden');
        this._updateUI(user);
        Utils.toast(`Welcome, ${user.name}!`, 'success');
    },

    _updateUI(user) {
        const trigger = document.getElementById('auth-trigger');
        const avatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-name');
        const userPlan = document.querySelector('.user-plan');

        if (user) {
            trigger.textContent = user.name === 'Guest User' ? 'Sign In' : user.name.split(' ')[0];
            avatar.textContent = (user.name[0] || 'G').toUpperCase();
            userName.textContent = user.name;
            userPlan.textContent = user.plan + ' Plan';
        } else {
            trigger.textContent = 'Sign In';
            avatar.textContent = 'G';
            userName.textContent = 'Guest User';
            userPlan.textContent = 'Free Plan';
        }
    }
};
