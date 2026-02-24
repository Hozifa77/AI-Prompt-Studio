/**
 * AI Prompt Studio — Dashboard Page
 */
const DashboardPage = {
  render() {
    const saved = Store.get('savedPrompts') || [];
    const user = Store.get('user');

    const html = `
    <div class="dashboard-page">
      <div class="dashboard-header">
        <h1>Welcome back${user && user.name !== 'Guest User' ? ', ' + user.name.split(' ')[0] : ''} 👋</h1>
        <p>Create optimized prompts for any AI model. Choose a module to get started.</p>
      </div>

      <div class="stats-grid stagger-children">
        <div class="stat-card" style="--card-accent: var(--grad-designers)">
          <div class="stat-icon" style="background: var(--clr-designers-glow); color: var(--clr-designers)">📝</div>
          <div class="stat-value">${saved.length}</div>
          <div class="stat-label">Saved Prompts</div>
          <div class="stat-change positive">↑ Active</div>
        </div>
        <div class="stat-card" style="--card-accent: var(--grad-developers)">
          <div class="stat-icon" style="background: var(--clr-developers-glow); color: var(--clr-developers)">🤖</div>
          <div class="stat-value">7</div>
          <div class="stat-label">AI Models</div>
          <div class="stat-change positive">GPT, Claude, Gemini...</div>
        </div>
        <div class="stat-card" style="--card-accent: var(--grad-marketers)">
          <div class="stat-icon" style="background: var(--clr-marketers-glow); color: var(--clr-marketers)">📦</div>
          <div class="stat-value">7</div>
          <div class="stat-label">Modules</div>
          <div class="stat-change positive">All active</div>
        </div>
        <div class="stat-card" style="--card-accent: var(--grad-writers)">
          <div class="stat-icon" style="background: var(--clr-writers-glow); color: var(--clr-writers)">⚡</div>
          <div class="stat-value">∞</div>
          <div class="stat-label">Prompt Power</div>
          <div class="stat-change positive">Unlimited</div>
        </div>
      </div>

      <div class="modules-section">
        <h2>Prompt Lab <span style="font-size:0.5em; opacity:0.6; font-weight:normal; vertical-align:middle; margin-left:8px;">100% Free</span></h2>
        <div class="modules-grid stagger-children" style="margin-bottom: var(--sp-8);">
          ${this._moduleCard('optimizer', '✨', 'Prompt Optimizer', 'Enhance your basic prompts into highly effective, structured instructions.', ['Enhance', 'Structure', 'Best Practices'], '#10B981')}
          ${this._moduleCard('writers', '✍️', 'Writers', 'Improve, expand, simplify, or SEO optimize any content with AI frameworks.', ['Content', 'SEO', 'Copy'], 'var(--grad-writers)')}
          ${this._moduleCard('developers', '⌨️', 'Developers', 'Build code prompts, architecture plans, database schemas, and API structures.', ['Code', 'Architecture', 'API'], 'var(--grad-developers)')}
          ${this._moduleCard('marketers', '📈', 'Marketers', 'Create ad copy, hooks, funnel structures, and full campaign strategies.', ['Marketing', 'Ads', 'Funnel'], 'var(--grad-marketers)')}
        </div>

        <h2>Generator Studio <span style="font-size:0.5em; opacity:0.6; font-weight:normal; vertical-align:middle; margin-left:8px;">Credit Based</span></h2>
        <div class="modules-grid stagger-children">
          ${this._moduleCard('designers', '🎨', 'Image Generator', 'Generate final images directly or fine-tuned visual AI prompts.', ['DALL-E', 'Midjourney', 'Styles'], 'var(--grad-designers)')}
          ${this._moduleCard('carousel', '🎠', 'Carousel Plan', 'Generate high-converting carousels with slide text and visual layouts.', ['Social', 'Slides', 'Hook'], '#EC4899', true)}
          ${this._moduleCard('video', '🎬', 'Video Generator', 'Generate scripts, voiceovers, and Runway/Sora scene generation.', ['Video', 'Voice', 'Script'], 'var(--grad-video)', true)}
          ${this._moduleCard('analysts', '📊', 'Data Analysis', 'Summarize data, extract insights, and generate full analytical reports.', ['Data', 'Export', 'Reports'], 'var(--grad-analysts)', true)}
          ${this._moduleCard('researchers', '🔬', 'Research & Export', 'Build research outlines, literature reviews, and export formatted papers.', ['Academic', 'Documents', 'PDF'], 'var(--grad-researchers)', true)}
        </div>
      </div>

      ${saved.length > 0 ? `
      <div class="recent-section">
        <h2>Recent Prompts</h2>
        <div class="recent-list stagger-children">
          ${saved.slice(0, 5).map(p => this._recentItem(p)).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = html;

    // Bind module card clicks
    setTimeout(() => {
      document.querySelectorAll('.module-card').forEach(card => {
        card.addEventListener('click', () => {
          const page = card.dataset.page;
          if (page) Router.navigate(page);
        });
      });
      // Bind recent item copy
      document.querySelectorAll('.recent-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          const prompt = Store.get('savedPrompts').find(p => p.id === id);
          if (prompt) Utils.copyToClipboard(prompt.content);
        });
      });
    }, 50);

    return html;
  },

  _moduleCard(page, icon, title, desc, tags, gradient, isPro = false) {
    const isFreePlan = Store.get('plan') === 'free';
    return `
    <div class="module-card hover-lift" data-page="${isPro && isFreePlan ? '' : page}" style="--module-gradient: ${gradient}" onclick="${isPro && isFreePlan ? "document.getElementById('premium-modal').classList.remove('hidden')" : "Router.navigate('" + page + "')"}">
      <div class="module-card-header">
        <div class="module-icon" style="background: ${gradient}">${icon}</div>
        <div class="module-card-title">${title}</div>
      </div>
      <div class="module-card-desc">${desc}</div>
      <div class="module-card-tags">
        ${tags.map(t => `<span class="module-tag">${t}</span>`).join('')}
      </div>
      <div class="module-card-footer">
        <span class="module-card-action">Open module →</span>
        ${isPro ? '<span class="module-card-lock">🔒 PRO</span>' : ''}
      </div>
    </div>`;
  },

  _recentItem(prompt) {
    const colors = {
      designers: 'var(--clr-designers)',
      developers: 'var(--clr-developers)',
      writers: 'var(--clr-writers)',
      video: 'var(--clr-video)',
      analysts: 'var(--clr-analysts)',
      marketers: 'var(--clr-marketers)',
      researchers: 'var(--clr-researchers)',
    };
    return `
    <div class="recent-item">
      <div class="recent-module-dot" style="background: ${colors[prompt.module] || 'var(--clr-designers)'}"></div>
      <div class="recent-info">
        <div class="recent-title">${Utils.escapeHTML(prompt.title)}</div>
        <div class="recent-meta">
          <span>${prompt.module}</span>
          <span>${prompt.model || ''}</span>
          <span>${Utils.formatDate(prompt.createdAt)}</span>
        </div>
      </div>
      <div class="recent-actions">
        <button class="recent-copy-btn" data-id="${prompt.id}" title="Copy">📋</button>
      </div>
    </div>`;
  }
};
