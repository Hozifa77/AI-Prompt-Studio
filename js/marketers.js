/**
 * AI Prompt Studio — Marketers Module (Green Theme)
 * Refactored: Auto defaults, PromptCore integration
 */
const MarketersPage = {
  render() {
    const html = `
    <div class="module-page" style="--module-accent: var(--clr-marketers); --module-glow: var(--clr-marketers-glow);">
      <div class="module-hero hero-marketers">
        <h1>📈 Marketers Lab</h1>
        <p>Create high-converting ad copy, scroll-stopping hooks, and complete funnel strategies.</p>
      </div>

      <div class="module-content">
        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Configuration</h2>
          </div>

          <div class="control-group">
            <label class="control-label">Campaign Type</label>
            ${Utils.chipGroupHTML(['Brand Awareness', 'Lead Generation', 'Conversion', 'Retargeting', 'Product Launch'], null, 'campaignType')}
          </div>

          <div class="control-group">
            <label class="control-label">Funnel Stage</label>
            ${Utils.chipGroupHTML(['TOFU', 'MOFU', 'BOFU'], null, 'funnelStage')}
          </div>

          <div class="control-group">
            <label class="control-label">Target Platform</label>
            ${Utils.chipGroupHTML(['Meta', 'Google', 'TikTok', 'LinkedIn', 'Twitter/X'], null, 'platform')}
          </div>

          <div class="control-group">
            <label class="control-label">Audience Persona</label>
            <input class="control-input" id="mkt-persona" placeholder="e.g., SaaS founders aged 25-40, tech-savvy..." />
          </div>

          <div class="control-group">
            <label class="control-label">Product / Service</label>
            <input class="control-input" id="mkt-product" placeholder="e.g., AI-powered project management tool..." />
          </div>

          <div class="control-group">
            <label class="control-label">Output Type</label>
            <div class="module-tabs" id="mkt-output-tabs">
              <button class="module-tab active" data-value="Campaign">Full Campaign</button>
              <button class="module-tab" data-value="Ad Copy">Ad Copy</button>
              <button class="module-tab" data-value="Hooks">Hooks</button>
              <button class="module-tab" data-value="Funnel">Funnel</button>
            </div>
          </div>

          <div class="section-divider">Target AI Model</div>
          <div class="control-group">
            <div class="model-selector">
              <button class="model-btn active" data-value="GPT">GPT</button>
              <button class="model-btn" data-value="Claude">Claude</button>
              <button class="model-btn" data-value="Gemini">Gemini</button>
            </div>
          </div>

          <button class="btn btn-generate marketers ripple" id="mkt-generate">
            🚀 Generate Prompt
          </button>
        </div>

        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Generated Prompt</h2>
            <button class="btn btn-sm btn-secondary" id="mkt-save">💾 Save</button>
          </div>
          <div class="output-area" id="mkt-output">
            <div class="output-placeholder">
              <div class="placeholder-icon">📈</div>
              <div>Configure your campaign and click<br/><strong>Generate Prompt</strong></div>
            </div>
          </div>
          <div class="output-actions" id="mkt-output-actions" style="display:none">
            <button class="btn btn-sm btn-secondary" id="mkt-copy">📋 Copy</button>
            <button class="btn btn-sm btn-secondary" id="mkt-export-json">📄 JSON</button>
            <button class="btn btn-sm btn-secondary" id="mkt-export-md">📝 Markdown</button>
          </div>
        </div>
      </div>
    </div>`;

    setTimeout(() => this._bind(), 50);
    return html;
  },

  _lastGenerated: null,
  _selectedOutput: 'Campaign',

  _bind() {
    const page = document.querySelector('.module-page');
    if (!page) return;
    Utils.initChips(page);
    Utils.initModelSelector(page);

    const tabs = document.querySelectorAll('#mkt-output-tabs .module-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this._selectedOutput = tab.dataset.value;
      });
    });

    document.getElementById('mkt-generate')?.addEventListener('click', () => this._generate());
    document.getElementById('mkt-copy')?.addEventListener('click', () => { if (this._lastGenerated) Utils.copyToClipboard(this._lastGenerated.content); });
    document.getElementById('mkt-save')?.addEventListener('click', () => this._save());
    document.getElementById('mkt-export-json')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'json'));
    document.getElementById('mkt-export-md')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'markdown'));
  },

  _generate() {
    const page = document.querySelector('.module-page');
    const settings = {
      campaignType: Utils.getChipValue(page, 'campaignType'),
      funnelStage: Utils.getChipValue(page, 'funnelStage'),
      platform: Utils.getChipValue(page, 'platform'),
      persona: document.getElementById('mkt-persona')?.value || '',
      product: document.getElementById('mkt-product')?.value || '',
      outputType: this._selectedOutput,
    };
    const model = Utils.getSelectedModel(page) || null;

    const prompt = PromptCore.generate({
      module: 'marketers',
      model,
      settings,
      context: { text: settings.persona },
    });

    this._lastGenerated = {
      module: 'marketers',
      model: model || 'Auto',
      settings,
      content: prompt,
      title: `${settings.campaignType || 'Auto'} — ${settings.platform || 'Auto'} — ${this._selectedOutput}`,
    };

    const output = document.getElementById('mkt-output');
    const actions = document.getElementById('mkt-output-actions');
    if (output) { Utils.typeText(output, prompt); if (actions) actions.style.display = 'flex'; }
  },

  _save() {
    if (!this._lastGenerated) { Utils.toast('Generate a prompt first', 'warning'); return; }
    Store.savePrompt({ ...this._lastGenerated });
    Utils.toast('Prompt saved! 🚀', 'success');
  }
};
