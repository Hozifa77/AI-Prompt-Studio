/**
 * AI Prompt Studio — Saved Prompts Library
 */
const SavedPage = {
    _filterModule: 'all',
    _searchQuery: '',

    render() {
        const prompts = this._getFilteredPrompts();
        const modules = ['all', 'designers', 'developers', 'writers', 'video', 'analysts', 'marketers', 'researchers'];
        const moduleColors = {
            designers: 'var(--clr-designers)',
            developers: 'var(--clr-developers)',
            writers: 'var(--clr-writers)',
            video: 'var(--clr-video)',
            analysts: 'var(--clr-analysts)',
            marketers: 'var(--clr-marketers)',
            researchers: 'var(--clr-researchers)',
        };

        const html = `
    <div class="module-page">
      <div class="saved-header">
        <div>
          <h1 style="font-size:var(--fs-2xl);font-weight:var(--fw-bold);margin-bottom:var(--sp-1);">📚 Saved Prompts</h1>
          <p style="color:var(--text-secondary)">${Store.get('savedPrompts').length} prompts saved</p>
        </div>
        <div style="display:flex;gap:var(--sp-3);align-items:center;">
          <div class="topbar-search" style="max-width:250px">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="saved-search" placeholder="Search saved..." />
          </div>
        </div>
      </div>

      <div class="saved-filters" id="saved-filters">
        ${modules.map(m => `
          <button class="chip ${m === this._filterModule ? 'active' : ''}" data-value="${m}" style="text-transform:capitalize">
            ${m === 'all' ? '📋 All' : m}
          </button>
        `).join('')}
      </div>

      <div style="margin-top:var(--sp-5);">
        ${prompts.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <h3>No saved prompts yet</h3>
            <p>Generate prompts from any module and save them to build your library.</p>
          </div>
        ` : `
          <div class="saved-grid stagger-children">
            ${prompts.map(p => `
              <div class="saved-card" data-id="${p.id}">
                <div class="saved-card-header">
                  <span class="saved-card-module" style="background:${moduleColors[p.module] || 'var(--bg-tertiary)'}22;color:${moduleColors[p.module] || 'var(--text-secondary)'}">${p.module}</span>
                  <span style="font-size:var(--fs-xs);color:var(--text-tertiary)">${p.model || ''}</span>
                </div>
                <div class="saved-card-title">${Utils.escapeHTML(p.title)}</div>
                <div class="saved-card-preview">${Utils.escapeHTML(p.content.slice(0, 200))}</div>
                ${p.tags && p.tags.length > 0 ? `
                  <div class="tag-list" style="margin-bottom:var(--sp-3)">
                    ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                  </div>
                ` : ''}
                <div class="saved-card-footer">
                  <span class="saved-card-date">${Utils.formatDate(p.createdAt)}</span>
                  <div class="saved-card-actions">
                    <button class="btn btn-sm btn-ghost saved-copy-btn" data-id="${p.id}" title="Copy">📋</button>
                    <button class="btn btn-sm btn-ghost saved-export-btn" data-id="${p.id}" title="Export JSON">📄</button>
                    <button class="btn btn-sm btn-ghost saved-delete-btn" data-id="${p.id}" title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>`;

        setTimeout(() => this._bind(), 50);
        return html;
    },

    _getFilteredPrompts() {
        let prompts = Store.get('savedPrompts') || [];
        if (this._filterModule !== 'all') {
            prompts = prompts.filter(p => p.module === this._filterModule);
        }
        if (this._searchQuery) {
            const q = this._searchQuery.toLowerCase();
            prompts = prompts.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.content.toLowerCase().includes(q) ||
                (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
            );
        }
        return prompts;
    },

    _bind() {
        // Filter chips
        const filters = document.getElementById('saved-filters');
        if (filters) {
            filters.querySelectorAll('.chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    filters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    this._filterModule = chip.dataset.value;
                    this._rerender();
                });
            });
        }

        // Search
        const searchInput = document.getElementById('saved-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this._searchQuery = searchInput.value;
                this._rerender();
            }, 250));
        }

        // Card actions
        document.querySelectorAll('.saved-copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const prompt = Store.get('savedPrompts').find(p => p.id === btn.dataset.id);
                if (prompt) Utils.copyToClipboard(prompt.content);
            });
        });

        document.querySelectorAll('.saved-export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const prompt = Store.get('savedPrompts').find(p => p.id === btn.dataset.id);
                if (prompt) Utils.exportPrompt(prompt, 'json');
            });
        });

        document.querySelectorAll('.saved-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete this prompt?')) {
                    Store.deletePrompt(btn.dataset.id);
                    this._rerender();
                    Utils.toast('Prompt deleted', 'info');
                }
            });
        });
    },

    _rerender() {
        const container = document.getElementById('page-container');
        container.innerHTML = this.render();
    }
};
