/**
 * AI Prompt Studio — Writers Module (Warm Beige Theme)
 * Refactored: Auto defaults, Presentation Builder sub-tool
 */
const WritersPage = {
  _activeTab: 'writer',  // 'writer' | 'presentation'

  render() {
    const html = `
    <div class="module-page" style="--module-accent: var(--clr-writers); --module-glow: var(--clr-writers-glow);">
      <div class="module-hero hero-writers">
        <h1>✍️ Writers Workshop</h1>
        <p>Improve, expand, simplify, or SEO optimize any content — plus build complete presentations.</p>
      </div>

      <!-- Tool switcher -->
      <div class="module-tool-switcher" id="writers-tool-switcher">
        <button class="tool-tab ${this._activeTab === 'writer' ? 'active' : ''}" data-tool="writer">
          <span class="tool-tab-icon">✍️</span> Content Writer
        </button>
        <button class="tool-tab ${this._activeTab === 'presentation' ? 'active' : ''}" data-tool="presentation">
          <span class="tool-tab-icon">📊</span> Presentation Builder
        </button>
      </div>

      ${this._activeTab === 'writer' ? this._writerPanel() : this._presentationPanel()}
    </div>`;

    setTimeout(() => this._bind(), 50);
    return html;
  },

  /* ── Content Writer Panel ────────────────────────────────── */
  _writerPanel() {
    return `
      <div class="module-content" id="writers-content">
        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Configuration</h2>
          </div>

          <div class="control-group">
            <label class="control-label">Action Type</label>
            ${Utils.chipGroupHTML(['Improve', 'Expand', 'Simplify', 'Summarize', 'Humanize', 'SEO Optimize'], null, 'action')}
          </div>

          <div class="control-group">
            <label class="control-label">Content Type</label>
            ${Utils.chipGroupHTML(['Blog', 'LinkedIn', 'Email', 'Script', 'Sales Copy', 'Story'], null, 'contentType')}
          </div>

          <div class="control-group">
            <label class="control-label">Tone</label>
            ${Utils.chipGroupHTML(['Professional', 'Casual', 'Persuasive', 'Emotional'], null, 'tone')}
          </div>

          <div class="control-group">
            <label class="control-label">Story Framework</label>
            ${Utils.chipGroupHTML(["Hero's Journey", "AIDA", "PAS"], null, 'framework')}
          </div>

          <div class="control-group">
            <label class="control-label">Your Content</label>
            <textarea class="control-textarea" id="writers-input" placeholder="Paste or write the content you want to improve..." style="min-height:140px"></textarea>
          </div>

          <div class="section-divider">Target AI Model</div>
          <div class="control-group">
            <div class="model-selector">
              <button class="model-btn active" data-value="GPT">GPT</button>
              <button class="model-btn" data-value="Claude">Claude</button>
              <button class="model-btn" data-value="Gemini">Gemini</button>
            </div>
          </div>

          <button class="btn btn-generate writers ripple" id="writers-generate">
            ✨ Generate Prompt
          </button>
        </div>

        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Generated Prompt</h2>
            <button class="btn btn-sm btn-secondary" id="writers-save">💾 Save</button>
          </div>
          <div class="output-area" id="writers-output">
            <div class="output-placeholder">
              <div class="placeholder-icon">✍️</div>
              <div>Set your preferences and click<br/><strong>Generate Prompt</strong></div>
            </div>
          </div>
          <div class="output-actions" id="writers-output-actions" style="display:none">
            <button class="btn btn-sm btn-secondary" id="writers-copy">📋 Copy</button>
            <button class="btn btn-sm btn-secondary" id="writers-export-json">📄 JSON</button>
            <button class="btn btn-sm btn-secondary" id="writers-export-md">📝 Markdown</button>
          </div>
        </div>
      </div>`;
  },

  /* ── Presentation Builder Panel ──────────────────────────── */
  _presentationPanel() {
    return `
      <div class="module-content" id="writers-content">
        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Presentation Settings</h2>
          </div>

          <div class="control-group">
            <label class="control-label">Presentation Type</label>
            ${Utils.chipGroupHTML(['Business', 'Pitch Deck', 'Academic', 'Training', 'Workshop', 'Keynote'], null, 'presentationType')}
          </div>

          <div class="control-group">
            <label class="control-label">Number of Slides</label>
            <div class="slide-count-row">
              ${Utils.chipGroupHTML(['Auto', '5', '10', '15', '20'], 'Auto', 'slideCount')}
              <div class="slide-count-custom" style="margin-top:var(--sp-2);display:flex;align-items:center;gap:var(--sp-2);">
                <span style="font-size:var(--fs-sm);color:var(--text-tertiary)">or custom:</span>
                <input class="control-input" id="pres-custom-slides" type="number" min="1" max="100" placeholder="12" style="width:70px;text-align:center" />
              </div>
            </div>
          </div>

          <div class="control-group">
            <label class="control-label">Tone</label>
            ${Utils.chipGroupHTML(['Professional', 'Inspirational', 'Educational', 'Conversational'], null, 'presTone')}
          </div>

          <div class="control-group">
            <label class="control-label">Topic / Brief</label>
            <textarea class="control-textarea" id="pres-topic" placeholder="Describe your presentation topic, audience, key message..." style="min-height:120px"></textarea>
          </div>

          <div class="section-divider">Output Sections</div>
          <div class="control-group">
            ${Utils.chipMultiHTML(
      ['Slide Outline', 'Bullet Content', 'Speaker Notes', 'Full Script'],
      ['Slide Outline', 'Bullet Content', 'Speaker Notes', 'Full Script'],
      'presOutputs'
    )}
          </div>

          <div class="section-divider">Target AI Model</div>
          <div class="control-group">
            <div class="model-selector">
              <button class="model-btn active" data-value="GPT">GPT</button>
              <button class="model-btn" data-value="Claude">Claude</button>
              <button class="model-btn" data-value="Gemini">Gemini</button>
            </div>
          </div>

          <button class="btn btn-generate writers ripple" id="pres-generate">
            📊 Generate Presentation
          </button>
        </div>

        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Generated Presentation</h2>
            <button class="btn btn-sm btn-secondary" id="pres-save">💾 Save</button>
          </div>
          <div class="output-area" id="pres-output">
            <div class="output-placeholder">
              <div class="placeholder-icon">📊</div>
              <div>Configure your presentation and click<br/><strong>Generate Presentation</strong></div>
            </div>
          </div>
          <div class="output-actions" id="pres-output-actions" style="display:none">
            <button class="btn btn-sm btn-secondary" id="pres-copy">📋 Copy</button>
            <button class="btn btn-sm btn-secondary" id="pres-export-json">📄 JSON</button>
            <button class="btn btn-sm btn-secondary" id="pres-export-md">📝 Markdown</button>
          </div>
        </div>
      </div>`;
  },

  _lastGenerated: null,

  /* ── Bind Handlers ───────────────────────────────────────── */
  _bind() {
    const page = document.querySelector('.module-page');
    if (!page) return;
    Utils.initChips(page);
    Utils.initModelSelector(page);

    // Tool switcher tabs
    page.querySelectorAll('#writers-tool-switcher .tool-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this._activeTab = tab.dataset.tool;
        this._rerender();
      });
    });

    // Writer handlers
    if (this._activeTab === 'writer') {
      document.getElementById('writers-generate')?.addEventListener('click', () => this._generateWriter());
      document.getElementById('writers-copy')?.addEventListener('click', () => { if (this._lastGenerated) Utils.copyToClipboard(this._lastGenerated.content); });
      document.getElementById('writers-save')?.addEventListener('click', () => this._save());
      document.getElementById('writers-export-json')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'json'));
      document.getElementById('writers-export-md')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'markdown'));
    }

    // Presentation handlers
    if (this._activeTab === 'presentation') {
      document.getElementById('pres-generate')?.addEventListener('click', () => this._generatePresentation());
      document.getElementById('pres-copy')?.addEventListener('click', () => { if (this._lastGenerated) Utils.copyToClipboard(this._lastGenerated.content); });
      document.getElementById('pres-save')?.addEventListener('click', () => this._save());
      document.getElementById('pres-export-json')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'json'));
      document.getElementById('pres-export-md')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'markdown'));
    }
  },

  /* ── Generate: Writer ────────────────────────────────────── */
  _generateWriter() {
    const page = document.querySelector('.module-page');
    const settings = {
      action: Utils.getChipValue(page, 'action'),
      contentType: Utils.getChipValue(page, 'contentType'),
      tone: Utils.getChipValue(page, 'tone'),
      framework: Utils.getChipValue(page, 'framework'),
    };
    const model = Utils.getSelectedModel(page) || null;
    const inputText = document.getElementById('writers-input')?.value || '';

    const prompt = PromptCore.generate({
      module: 'writers',
      model,
      settings,
      context: { text: inputText },
    });

    const titleParts = [settings.action || 'Auto', settings.contentType || 'Auto', settings.tone || 'Auto'];
    this._lastGenerated = {
      module: 'writers',
      model: model || 'Auto',
      settings,
      content: prompt,
      title: titleParts.join(' — '),
    };

    const output = document.getElementById('writers-output');
    const actions = document.getElementById('writers-output-actions');
    if (output) { Utils.typeText(output, prompt); if (actions) actions.style.display = 'flex'; }
  },

  /* ── Generate: Presentation ──────────────────────────────── */
  _generatePresentation() {
    const page = document.querySelector('.module-page');

    // Get slide count — custom input overrides chip
    let slideCount = Utils.getChipValue(page, 'slideCount');
    const customSlides = document.getElementById('pres-custom-slides')?.value;
    if (customSlides && parseInt(customSlides) > 0) {
      slideCount = customSlides + ' slides';
    }

    const settings = {
      presentationType: Utils.getChipValue(page, 'presentationType'),
      slideCount: slideCount,
      tone: Utils.getChipValue(page, 'presTone'),
    };
    const model = Utils.getSelectedModel(page) || null;
    const topic = document.getElementById('pres-topic')?.value || '';

    const prompt = PromptCore.generate({
      module: 'writers_presentation',
      model,
      settings,
      context: { text: topic },
    });

    this._lastGenerated = {
      module: 'writers',
      model: model || 'Auto',
      settings: { ...settings, tool: 'presentation' },
      content: prompt,
      title: `Presentation — ${settings.presentationType || 'Auto'} — ${settings.slideCount || 'Auto slides'}`,
    };

    const output = document.getElementById('pres-output');
    const actions = document.getElementById('pres-output-actions');
    if (output) { Utils.typeText(output, prompt); if (actions) actions.style.display = 'flex'; }
  },

  _save() {
    if (!this._lastGenerated) { Utils.toast('Generate a prompt first', 'warning'); return; }
    Store.savePrompt({ ...this._lastGenerated });
    Utils.toast('Prompt saved! ✍️', 'success');
  },

  _rerender() {
    const container = document.getElementById('page-container');
    if (container) container.innerHTML = this.render();
  },
};
