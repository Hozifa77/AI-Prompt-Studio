/**
 * AI Prompt Studio — Global State Store
 * Simple reactive state management
 */
const Store = {
    _state: {
        currentPage: 'dashboard',
        theme: localStorage.getItem('aps-theme') || 'dark',
        user: JSON.parse(localStorage.getItem('aps-user')) || null,
        savedPrompts: JSON.parse(localStorage.getItem('aps-saved')) || [],
        isPremium: false,
        searchQuery: '',
        // Subscription & Credit System
        plan: localStorage.getItem('aps-plan') || 'free', // 'free', 'pro', 'creator', 'business'
        credits: parseInt(localStorage.getItem('aps-credits') || '200', 10),
        creditResetDate: localStorage.getItem('aps-reset-date') || null,
    },
    _listeners: [],

    get(key) {
        return this._state[key];
    },

    set(key, value) {
        this._state[key] = value;
        this._persist(key, value);
        this._notify(key, value);
    },

    _persist(key, value) {
        if (key === 'theme') localStorage.setItem('aps-theme', value);
        if (key === 'user') localStorage.setItem('aps-user', JSON.stringify(value));
        if (key === 'savedPrompts') localStorage.setItem('aps-saved', JSON.stringify(value));
        if (key === 'plan') localStorage.setItem('aps-plan', value);
        if (key === 'credits') localStorage.setItem('aps-credits', value);
        if (key === 'creditResetDate') localStorage.setItem('aps-reset-date', value);
    },

    subscribe(fn) {
        this._listeners.push(fn);
        return () => {
            this._listeners = this._listeners.filter(l => l !== fn);
        };
    },

    _notify(key, value) {
        this._listeners.forEach(fn => fn(key, value));
    },

    // Prompt CRUD
    savePrompt(prompt) {
        const prompts = this.get('savedPrompts');
        prompt.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        prompt.createdAt = new Date().toISOString();
        prompt.tags = prompt.tags || [];
        prompts.unshift(prompt);
        this.set('savedPrompts', prompts);
        return prompt;
    },

    deletePrompt(id) {
        const prompts = this.get('savedPrompts').filter(p => p.id !== id);
        this.set('savedPrompts', prompts);
    },

    updatePrompt(id, updates) {
        const prompts = this.get('savedPrompts').map(p =>
            p.id === id ? { ...p, ...updates } : p
        );
        this.set('savedPrompts', prompts);
    },

    getPromptsByModule(module) {
        return this.get('savedPrompts').filter(p => p.module === module);
    },

    searchPrompts(query) {
        const q = query.toLowerCase();
        return this.get('savedPrompts').filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
        );
    },

    // Credit System
    initCredits() {
        // Initialize reset date to +7 days if it's the first time
        if (!this.get('creditResetDate')) {
            const nextReset = new Date();
            nextReset.setDate(nextReset.getDate() + 7);
            this.set('creditResetDate', nextReset.toISOString());
        }

        this.checkCreditReset();
    },

    checkCreditReset() {
        const resetDate = new Date(this.get('creditResetDate'));
        const now = new Date();

        if (now >= resetDate) {
            // It's time to reset credits
            const plan = this.get('plan');
            let resetAmount = 200; // Free
            if (plan === 'pro') resetAmount = 1500;
            if (plan === 'creator') resetAmount = 4000;
            if (plan === 'business') resetAmount = 10000;

            this.set('credits', resetAmount);

            // Set next reset date based on plan length (weekly vs. monthly)
            // Just assume weekly for everything for simplicity in demo or monthly if specified.
            // Prompt says: "Credits reset weekly (7 days from first usage)". For pro/creator says "/month".
            // Let's reset 7 days for free, 30 days for others.
            const nextReset = new Date();
            nextReset.setDate(nextReset.getDate() + (plan === 'free' ? 7 : 30));
            this.set('creditResetDate', nextReset.toISOString());
        }
    },

    useCredits(amount) {
        this.checkCreditReset();
        const current = this.get('credits');
        if (current >= amount) {
            this.set('credits', current - amount);
            return true; // Success
        }
        return false; // Insufficient credits
    },

    setPlan(planName) {
        this.set('plan', planName);
        this.set('isPremium', planName !== 'free');

        let amount = 200;
        if (planName === 'pro') amount = 1500;
        if (planName === 'creator') amount = 4000;
        if (planName === 'business') amount = 10000;

        this.set('credits', amount);

        const nextReset = new Date();
        nextReset.setDate(nextReset.getDate() + (planName === 'free' ? 7 : 30));
        this.set('creditResetDate', nextReset.toISOString());
    }
};

// Initialize credits on load
Store.initCredits();
