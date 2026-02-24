/**
 * AI Prompt Studio — Developers Module (Dark Blue Theme)
 * Refactored: Auto defaults, PromptCore integration
 */
const DevelopersPage = {
  render() {
    const html = `
    <div class="module-page" style="--module-accent: var(--clr-developers); --module-glow: var(--clr-developers-glow);">
      <div class="module-hero hero-developers">
        <h1>⌨️ Developers Hub</h1>
        <p>Build production-ready code prompts, architecture plans, database schemas, and API structures.</p>
      </div>

      <div class="module-content">
        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Configuration</h2>
          </div>

          <div class="control-group">
            <label class="control-label">Product Type</label>
            ${Utils.chipGroupHTML(['Landing Page', 'Portfolio', 'SaaS', 'E-commerce', 'Dashboard'], null, 'productType')}
          </div>

          <div class="control-group">
            <label class="control-label">Tech Stack</label>
            ${Utils.chipGroupHTML(['React', 'Next.js', 'Python', 'Node.js', 'Flutter'], null, 'techStack')}
          </div>

          <div class="control-group">
            <label class="control-label">Code Level</label>
            ${Utils.chipGroupHTML(['Beginner', 'Production-ready', 'Enterprise'], null, 'codeLevel')}
          </div>

          <div class="control-group">
            <label class="control-label">Output Type</label>
            <div class="module-tabs" id="dev-output-tabs">
              <button class="module-tab active" data-value="Code">Code Prompt</button>
              <button class="module-tab" data-value="Architecture">Architecture</button>
              <button class="module-tab" data-value="Database">DB Schema</button>
              <button class="module-tab" data-value="API">API Structure</button>
            </div>
          </div>

          <div class="control-group">
            <label class="control-label">Additional Requirements</label>
            <textarea class="control-textarea" id="dev-requirements" placeholder="Describe specific features, constraints, or requirements..."></textarea>
          </div>

          <div class="section-divider">Target AI Model</div>
          <div class="control-group">
            <div class="model-selector">
              <button class="model-btn active" data-value="GPT">GPT</button>
              <button class="model-btn" data-value="Claude">Claude</button>
              <button class="model-btn" data-value="Gemini">Gemini</button>
              <button class="model-btn" data-value="DeepSeek">DeepSeek</button>
            </div>
          </div>

          <button class="btn btn-generate developers ripple" id="dev-generate">
            ⚡ Generate Prompt
          </button>
        </div>

        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Generated Prompt</h2>
            <button class="btn btn-sm btn-secondary" id="dev-save">💾 Save</button>
          </div>
          <div class="output-area" id="dev-output">
            <div class="output-placeholder">
              <div class="placeholder-icon">⌨️</div>
              <div>Configure your project settings and click<br/><strong>Generate Prompt</strong></div>
            </div>
          </div>
          <div class="output-actions" id="dev-output-actions" style="display:none">
            <button class="btn btn-sm btn-secondary" id="dev-copy">📋 Copy</button>
            <button class="btn btn-sm btn-secondary" id="dev-export-json">📄 JSON</button>
            <button class="btn btn-sm btn-secondary" id="dev-export-md">📝 Markdown</button>
          </div>
        </div>
      </div>
    </div>`;

    setTimeout(() => this._bind(), 50);
    return html;
  },

  _lastGenerated: null,
  _selectedOutputType: 'Code',

  _bind() {
    const page = document.querySelector('.module-page');
    if (!page) return;

    Utils.initChips(page);
    Utils.initModelSelector(page);

    const tabs = document.querySelectorAll('#dev-output-tabs .module-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this._selectedOutputType = tab.dataset.value;
      });
    });

    document.getElementById('dev-generate')?.addEventListener('click', () => this._generate());
    document.getElementById('dev-copy')?.addEventListener('click', () => this._copy());
    document.getElementById('dev-save')?.addEventListener('click', () => this._save());
    document.getElementById('dev-export-json')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'json'));
    document.getElementById('dev-export-md')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'markdown'));
  },

  _generate() {
    const page = document.querySelector('.module-page');
    const settings = {
      productType: Utils.getChipValue(page, 'productType'),
      techStack: Utils.getChipValue(page, 'techStack'),
      codeLevel: Utils.getChipValue(page, 'codeLevel'),
      outputType: this._selectedOutputType,
    };
    const model = Utils.getSelectedModel(page) || null;
    const requirements = document.getElementById('dev-requirements')?.value || '';

    const prompt = PromptCore.generate({
      module: 'developers',
      model,
      settings,
      context: { text: requirements },
    });

    this._lastGenerated = {
      module: 'developers',
      model: model || 'Auto',
      settings,
      content: prompt,
      title: `${settings.productType || 'Auto'} — ${settings.techStack || 'Auto'} — ${this._selectedOutputType}`,
    };

    const output = document.getElementById('dev-output');
    const actions = document.getElementById('dev-output-actions');
    if (output) {
      Utils.typeText(output, prompt);
      if (actions) actions.style.display = 'flex';
    }
  },

  _copy() { if (this._lastGenerated) Utils.copyToClipboard(this._lastGenerated.content); },
  _save() {
    if (!this._lastGenerated) { Utils.toast('Generate a prompt first', 'warning'); return; }
    Store.savePrompt({ ...this._lastGenerated });
    Utils.toast('Prompt saved! ⚡', 'success');
  }
};
