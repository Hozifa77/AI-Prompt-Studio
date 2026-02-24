/**
 * AI Prompt Studio — Analysts Module (Teal Theme) — PRO
 * Refactored: Auto defaults, PromptCore integration
 */
const AnalystsPage = {
  render() {
    const html = `
    <div class="module-page" style="--module-accent: var(--clr-analysts); --module-glow: var(--clr-analysts-glow);">
      <div class="module-hero hero-analysts">
        <h1>📊 Analysts Dashboard</h1>
        <p>Summarize data, extract insights, detect trends, build predictive models, and generate reports.</p>
      </div>

      <div class="module-content">
        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Configuration</h2>
          </div>

          <div class="control-group">
            <label class="control-label">Upload Data File</label>
            <div class="file-upload-area" id="analysts-upload">
              <div class="upload-icon">📂</div>
              <div class="upload-text">Drag & drop Excel/CSV or click to browse</div>
              <div class="upload-hint">.xlsx, .csv, .json files supported</div>
              <input type="file" id="analysts-file-input" accept=".xlsx,.csv,.json" style="display:none" />
            </div>
            <div id="analysts-file-name" style="margin-top:8px;font-size:13px;color:var(--text-secondary)"></div>
          </div>

          <div class="control-group">
            <label class="control-label">Analysis Type</label>
            <div class="module-tabs" id="analysts-type-tabs">
              <button class="module-tab active" data-value="Auto">Auto</button>
              <button class="module-tab" data-value="Data Summary">Summary</button>
              <button class="module-tab" data-value="Insight Extraction">Insights</button>
              <button class="module-tab" data-value="Trend Detection">Trends</button>
              <button class="module-tab" data-value="Predictive Analysis">Predictive</button>
              <button class="module-tab" data-value="Report">Report</button>
            </div>
          </div>

          <div class="control-group">
            <label class="control-label">Data Description</label>
            <textarea class="control-textarea" id="analysts-data-desc" placeholder="Describe your dataset: columns, data types, time range, source..."></textarea>
          </div>

          <div class="section-divider">Target AI Model</div>
          <div class="control-group">
            <div class="model-selector">
              <button class="model-btn active" data-value="GPT">GPT</button>
              <button class="model-btn" data-value="Claude">Claude</button>
              <button class="model-btn" data-value="Gemini">Gemini</button>
            </div>
          </div>

          <button class="btn btn-generate analysts ripple" id="analysts-generate">
            📊 Generate Prompt
          </button>
        </div>

        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Generated Prompt</h2>
            <button class="btn btn-sm btn-secondary" id="analysts-save">💾 Save</button>
          </div>
          <div class="output-area" id="analysts-output">
            <div class="output-placeholder">
              <div class="placeholder-icon">📊</div>
              <div>Configure your analysis and click<br/><strong>Generate Prompt</strong></div>
            </div>
          </div>
          <div class="output-actions" id="analysts-output-actions" style="display:none">
            <button class="btn btn-sm btn-secondary" id="analysts-copy">📋 Copy</button>
            <button class="btn btn-sm btn-secondary" id="analysts-export-json">📄 JSON</button>
            <button class="btn btn-sm btn-secondary" id="analysts-export-md">📝 Markdown</button>
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

    // File upload
    const uploadArea = document.getElementById('analysts-upload');
    const fileInput = document.getElementById('analysts-file-input');
    if (uploadArea) {
      uploadArea.addEventListener('click', () => fileInput.click());
      uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
      uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files[0]) {
          document.getElementById('analysts-file-name').textContent = '📎 ' + e.dataTransfer.files[0].name;
        }
      });
    }
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) {
          document.getElementById('analysts-file-name').textContent = '📎 ' + fileInput.files[0].name;
        }
      });
    }

    // Tabs
    const tabs = document.querySelectorAll('#analysts-type-tabs .module-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this._selectedType = tab.dataset.value;
      });
    });

    document.getElementById('analysts-generate')?.addEventListener('click', () => this._generate());
    document.getElementById('analysts-copy')?.addEventListener('click', () => { if (this._lastGenerated) Utils.copyToClipboard(this._lastGenerated.content); });
    document.getElementById('analysts-save')?.addEventListener('click', () => this._save());
    document.getElementById('analysts-export-json')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'json'));
    document.getElementById('analysts-export-md')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'markdown'));
  },

  _generate() {
    const page = document.querySelector('.module-page');
    const analysisType = this._selectedType === 'Auto' ? null : this._selectedType;

    if (analysisType === 'Report') {
      if (!Store.useCredits(20)) {
        Utils.toast('Insufficient credits to generate a full report!', 'error');
        return;
      }
    }

    const settings = {
      analysisType: analysisType,
    };
    const model = Utils.getSelectedModel(page) || null;
    const dataDesc = document.getElementById('analysts-data-desc')?.value || '';

    const prompt = PromptCore.generate({
      module: 'analysts',
      model,
      settings,
      context: { text: dataDesc },
    });

    this._lastGenerated = {
      module: 'analysts',
      model: model || 'Auto',
      settings,
      content: prompt,
      title: `${analysisType || 'Comprehensive'} — Data Analysis`,
    };

    const output = document.getElementById('analysts-output');
    const actions = document.getElementById('analysts-output-actions');
    if (output) { Utils.typeText(output, prompt); if (actions) actions.style.display = 'flex'; }
  },

  _save() {
    if (!this._lastGenerated) { Utils.toast('Generate a prompt first', 'warning'); return; }
    Store.savePrompt({ ...this._lastGenerated });
    Utils.toast('Prompt saved! 📊', 'success');
  }
};
