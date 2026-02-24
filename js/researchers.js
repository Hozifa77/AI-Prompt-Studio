/**
 * AI Prompt Studio — Researchers Module (Navy Theme) — PRO
 * Refactored: Auto defaults, PromptCore integration
 */
const ResearchersPage = {
  render() {
    const html = `
    <div class="module-page" style="--module-accent: var(--clr-researchers-light); --module-glow: var(--clr-researchers-glow);">
      <div class="module-hero hero-researchers">
        <h1>🔬 Researchers Lab</h1>
        <p>Build research outlines, literature reviews, hypotheses, and publication-ready abstracts.</p>
      </div>

      <div class="module-content">
        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Configuration</h2>
          </div>

          <div class="control-group">
            <label class="control-label">Research Type</label>
            <div class="module-tabs" id="res-type-tabs">
              <button class="module-tab active" data-value="Auto">Auto</button>
              <button class="module-tab" data-value="Research Outline">Outline</button>
              <button class="module-tab" data-value="Literature Review">Literature</button>
              <button class="module-tab" data-value="Hypothesis">Hypothesis</button>
              <button class="module-tab" data-value="Abstract">Abstract</button>
            </div>
          </div>

          <div class="control-group">
            <label class="control-label">Academic Tone</label>
            ${Utils.chipGroupHTML(['Formal', 'Semi-Formal', 'Technical', 'Accessible'], null, 'academicTone')}
          </div>

          <div class="control-group">
            <label class="control-label">Field / Discipline</label>
            ${Utils.chipGroupHTML(['Computer Science', 'Psychology', 'Biology', 'Economics', 'Engineering', 'Social Sciences'], null, 'field')}
          </div>

          <div class="control-group">
            <label class="control-label">Research Topic</label>
            <textarea class="control-textarea" id="res-topic" placeholder="Describe your research topic, question, or area of investigation..."></textarea>
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

          <button class="btn btn-generate researchers ripple" id="res-generate">
            🔬 Generate Prompt
          </button>
        </div>

        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Generated Prompt</h2>
            <button class="btn btn-sm btn-secondary" id="res-save">💾 Save</button>
          </div>
          <div class="output-area" id="res-output">
            <div class="output-placeholder">
              <div class="placeholder-icon">🔬</div>
              <div>Configure your research parameters and click<br/><strong>Generate Prompt</strong></div>
            </div>
          </div>
          <div class="output-actions" id="res-output-actions" style="display:none">
            <button class="btn btn-sm btn-secondary" id="res-copy">📋 Copy</button>
            <button class="btn btn-sm btn-secondary" id="res-export-json">📄 JSON</button>
            <button class="btn btn-sm btn-secondary" id="res-export-md">📝 Markdown</button>
          </div>
        </div>
      </div>
    </div>`;

    setTimeout(() => this._bind(), 50);
    return html;
  },

  _lastGenerated: null,
  _selectedType: 'Auto',

  _bind() {
    const page = document.querySelector('.module-page');
    if (!page) return;
    Utils.initChips(page);
    Utils.initModelSelector(page);

    const tabs = document.querySelectorAll('#res-type-tabs .module-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this._selectedType = tab.dataset.value;
      });
    });

    document.getElementById('res-generate')?.addEventListener('click', () => this._generate());
    document.getElementById('res-copy')?.addEventListener('click', () => { if (this._lastGenerated) Utils.copyToClipboard(this._lastGenerated.content); });
    document.getElementById('res-save')?.addEventListener('click', () => this._save());
    const handleExport = (format) => {
      if (!Store.useCredits(5)) {
        Utils.toast('Insufficient credits to export data!', 'error');
        return;
      }
      Utils.exportPrompt(this._lastGenerated, format);
      Utils.toast('Exported successfully! (-5 credits)', 'success');
    };

    document.getElementById('res-export-json')?.addEventListener('click', () => handleExport('json'));
    document.getElementById('res-export-md')?.addEventListener('click', () => handleExport('markdown'));
  },

  _generate() {
    const page = document.querySelector('.module-page');
    const researchType = this._selectedType === 'Auto' ? null : this._selectedType;
    const settings = {
      researchType: researchType,
      academicTone: Utils.getChipValue(page, 'academicTone'),
      field: Utils.getChipValue(page, 'field'),
    };
    const model = Utils.getSelectedModel(page) || null;
    const topic = document.getElementById('res-topic')?.value || '';

    const prompt = PromptCore.generate({
      module: 'researchers',
      model,
      settings,
      context: { text: topic },
    });

    this._lastGenerated = {
      module: 'researchers',
      model: model || 'Auto',
      settings,
      content: prompt,
      title: `${researchType || 'Auto'} — ${settings.field || 'Auto'}`,
    };

    const output = document.getElementById('res-output');
    const actions = document.getElementById('res-output-actions');
    if (output) { Utils.typeText(output, prompt); if (actions) actions.style.display = 'flex'; }
  },

  _save() {
    if (!this._lastGenerated) { Utils.toast('Generate a prompt first', 'warning'); return; }
    Store.savePrompt({ ...this._lastGenerated });
    Utils.toast('Prompt saved! 🔬', 'success');
  }
};
