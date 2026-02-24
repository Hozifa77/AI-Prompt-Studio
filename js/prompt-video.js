/**
 * AI Prompt Studio — Video Prompts Module (Prompt Lab / Free)
 * Generates script outlines and prompts for generating videos.
 */
const PromptVideoPage = {
    render() {
        const html = `
    <div class="module-page" style="--module-accent: var(--clr-video); --module-glow: var(--clr-video-glow);">
      <div class="module-hero hero-video">
        <h1>🎬 Video Prompts</h1>
        <p>100% Free. Generate complete scripts, scene breakdowns, shot lists, and voice-over scripts for any format.</p>
      </div>

      <div class="module-content">
        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Configuration</h2>
          </div>

          <div class="control-group">
            <label class="control-label">Video Type</label>
            ${Utils.chipGroupHTML(['Short Reel', 'YouTube Horizontal', 'Documentary', 'Ad'], null, 'videoType')}
          </div>

          <div class="control-group">
            <label class="control-label">Script Style</label>
            ${Utils.chipGroupHTML(['Educational', 'Emotional', 'Motivational', 'Explainer'], null, 'scriptStyle')}
          </div>

          <div class="control-group">
            <label class="control-label">Visual Style</label>
            ${Utils.chipGroupHTML(['Realistic', '3D', 'Doodles', 'Anime', 'Cinematic'], null, 'visualStyle')}
          </div>

          <div class="control-group">
            <label class="control-label">Mood</label>
            ${Utils.chipGroupHTML(['Energetic', 'Calm', 'Dramatic', 'Playful', 'Inspirational'], null, 'mood')}
          </div>

          <div class="control-group">
            <label class="control-label">Topic / Subject</label>
            <textarea class="control-textarea" id="pv-topic" placeholder="e.g., The Future of AI in Education" style="min-height:90px"></textarea>
          </div>

          <div class="section-divider">Output Sections</div>
          <div class="control-group">
            ${Utils.chipMultiHTML(['Full Script', 'Scene Breakdown', 'Shot List', 'Voice-Over'], ['Full Script', 'Scene Breakdown', 'Shot List', 'Voice-Over'], 'outputs')}
          </div>

          <div class="section-divider">Target AI Model</div>
          <div class="control-group">
            <div class="model-selector">
              <button class="model-btn active" data-value="GPT">GPT</button>
              <button class="model-btn" data-value="Claude">Claude</button>
              <button class="model-btn" data-value="Gemini">Gemini</button>
            </div>
          </div>

          <button class="btn btn-generate video ripple" id="pv-generate">
            🎬 Generate Prompt
          </button>
        </div>

        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Generated Output</h2>
            <button class="btn btn-sm btn-secondary" id="pv-save">💾 Save</button>
          </div>
          <div class="output-area" id="pv-output">
            <div class="output-placeholder">
              <div class="placeholder-icon">🎬</div>
              <div>Configure options and click<br/><strong>Generate Prompt</strong></div>
            </div>
          </div>
          <div class="output-actions" id="pv-output-actions" style="display:none">
            <button class="btn btn-sm btn-secondary" id="pv-copy">📋 Copy</button>
            <button class="btn btn-sm btn-secondary" id="pv-export-json">📥 JSON</button>
            <button class="btn btn-sm btn-secondary" id="pv-export-md">📥 Markdown</button>
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

        document.getElementById('pv-generate')?.addEventListener('click', () => this._generate());
        document.getElementById('pv-copy')?.addEventListener('click', () => { if (this._lastGenerated) Utils.copyToClipboard(this._lastGenerated.content); });
        document.getElementById('pv-save')?.addEventListener('click', () => this._save());
        document.getElementById('pv-export-json')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'json'));
        document.getElementById('pv-export-md')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'markdown'));
    },

    _generate() {
        const page = document.querySelector('.module-page');

        const settings = {
            videoType: Utils.getChipValue(page, 'videoType'),
            scriptStyle: Utils.getChipValue(page, 'scriptStyle'),
            visualStyle: Utils.getChipValue(page, 'visualStyle'),
            mood: Utils.getChipValue(page, 'mood'),
            outputs: Utils.getChipValues(page, 'outputs'),
        };

        const model = Utils.getSelectedModel(page) || 'GPT';
        const topic = document.getElementById('pv-topic')?.value || '';

        // Route back to the unified video generator algorithm
        const prompt = PromptCore.generate({
            module: 'video', // reuse existing video prompt engine method
            model,
            settings,
            context: { text: topic },
        });

        this._lastGenerated = {
            module: 'video',
            model,
            settings,
            content: prompt,
            title: \`\${settings.videoType || 'Auto'} — \${settings.scriptStyle || 'Auto'}\`,
    };

    const output = document.getElementById('pv-output');
    const actions = document.getElementById('pv-output-actions');
    if (output) { Utils.typeText(output, prompt); if (actions) actions.style.display = 'flex'; }
  },

  _save() {
    if (!this._lastGenerated) { Utils.toast('Generate a prompt first', 'warning'); return; }
    Store.savePrompt({ ...this._lastGenerated });
    Utils.toast('Prompt saved! 🎬', 'success');
  },
};
