/**
 * AI Prompt Studio — Image Prompts Module (Prompt Lab / Free)
 * Generates highly optimized prompts for Midjourney, Stable Diffusion, etc.
 */
const PromptImagePage = {
    render() {
        const html = `
    <div class="module-page" style="--module-accent: var(--clr-designers-light); --module-glow: var(--clr-designers-glow);">
      <div class="module-hero hero-designers">
        <h1>🎨 Image Prompts</h1>
        <p>100% Free. Generate expert-level prompts for Midjourney, Stable Diffusion, and DALL-E.</p>
      </div>

      <div class="module-content">
        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Configuration</h2>
          </div>

          <div class="control-group">
            <label class="control-label">Image Type</label>
            ${Utils.chipGroupHTML(['Photography', 'Digital Art', '3D Render', 'Illustration', 'Concept Art'], null, 'imageType')}
          </div>

          <div class="control-group">
            <label class="control-label">Mood & Atmosphere</label>
            ${Utils.chipGroupHTML(['Cinematic', 'Ethereal', 'Dark & Moody', 'Vibrant', 'Minimalist'], null, 'mood')}
          </div>

          <div class="control-group">
            <label class="control-label">Lighting & Time</label>
            ${Utils.chipGroupHTML(['Golden Hour', 'Neon / Cyberpunk', 'Studio Lighting', 'Volumetric Lighting'], null, 'time')}
          </div>

          <div class="control-group">
            <label class="control-label">Style / Lens</label>
            ${Utils.chipGroupHTML(['Macro lens', 'Wide angle (14mm)', 'Portrait (85mm)', 'Drone / Aerial'], null, 'style')}
          </div>

          <div class="control-group">
            <label class="control-label">Creative Direction (Optional)</label>
            <textarea class="control-textarea" id="pi-text-input" placeholder="e.g., A futuristic city overgrown with plants..."></textarea>
          </div>

          <div class="section-divider">Target AI Model</div>
          <div class="control-group">
            <div class="model-selector">
              <button class="model-btn active" data-value="Midjourney">Midjourney v6</button>
              <button class="model-btn" data-value="Stable Diffusion">Stable Diffusion XL</button>
              <button class="model-btn" data-value="Leonardo">Leonardo.ai</button>
            </div>
          </div>

          <button class="btn btn-generate designers ripple" id="pi-generate">
            ✨ Generate Prompt
          </button>
        </div>

        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Generated Prompt</h2>
            <button class="btn btn-sm btn-secondary" id="pi-save">💾 Save</button>
          </div>
          <div class="output-area" id="pi-output">
            <div class="output-placeholder">
              <div class="placeholder-icon">🎨</div>
              <div>Configure options and click<br/><strong>Generate Prompt</strong></div>
            </div>
          </div>
          <div class="output-actions" id="pi-output-actions" style="display:none">
            <button class="btn btn-sm btn-secondary" id="pi-copy">📋 Copy</button>
            <button class="btn btn-sm btn-secondary" id="pi-export-json">📥 JSON</button>
            <button class="btn btn-sm btn-secondary" id="pi-export-md">📥 Markdown</button>
          </div>
        </div>
      </div>
    </div>`;

        setTimeout(() => this._bind(), 50);
        return html;
    },

    _lastGenerated: null,

    _bind() {
        const page = document.querySelector('.module-page');
        if (!page) return;
        Utils.initChips(page);
        Utils.initModelSelector(page);

        document.getElementById('pi-generate')?.addEventListener('click', () => this._generate());
        document.getElementById('pi-copy')?.addEventListener('click', () => { if (this._lastGenerated) Utils.copyToClipboard(this._lastGenerated.content); });
        document.getElementById('pi-save')?.addEventListener('click', () => this._save());
        document.getElementById('pi-export-json')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'json'));
        document.getElementById('pi-export-md')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'markdown'));
    },

    _generate() {
        const page = document.querySelector('.module-page');

        const settings = {
            imageType: Utils.getChipValue(page, 'imageType'),
            mood: Utils.getChipValue(page, 'mood'),
            time: Utils.getChipValue(page, 'time'),
            style: Utils.getChipValue(page, 'style'),
            outputMode: 'prompt', // Forcing PromptCore to just output prompts
        };

        const model = Utils.getSelectedModel(page) || 'Midjourney';
        const textInput = document.getElementById('pi-text-input')?.value || '';

        // Reuse designer module from PromptCore since it formats it nicely
        const prompt = PromptCore.generate({
            module: 'designers',
            model,
            settings,
            context: { text: textInput },
        });

        this._lastGenerated = {
            module: 'designers',
            model,
            settings,
            content: prompt,
            title: `${settings.imageType || 'Auto'} — ${settings.mood || 'Auto'}`,
    };

    const output = document.getElementById('pi-output');
    const actions = document.getElementById('pi-output-actions');
    if (output) { Utils.typeText(output, prompt); if (actions) actions.style.display = 'flex'; }
  },

  _save() {
    if (!this._lastGenerated) { Utils.toast('Generate a prompt first', 'warning'); return; }
    Store.savePrompt({ ...this._lastGenerated });
    Utils.toast('Prompt saved! 🎨', 'success');
  },
};
