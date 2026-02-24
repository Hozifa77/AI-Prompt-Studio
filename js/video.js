/**
 * AI Prompt Studio — Video Creators Module (Red/Orange Theme)
 * Refactored: Auto defaults, PromptCore integration
 */
const VideoPage = {
  render() {
    const html = `
    <div class="module-page" style="--module-accent: var(--clr-video); --module-glow: var(--clr-video-glow);">
      <div class="module-hero hero-video">
        <h1>🎬 Video Creators Studio</h1>
        <p>Generate complete scripts, scene breakdowns, shot lists, and voice-over scripts for any video format.</p>
      </div>

      <div class="module-content">
        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Configuration</h2>
          </div>

          <div class="control-group">
            <label class="control-label">Video Source Type</label>
            ${Utils.chipGroupHTML(['Script to Video', 'Prompt to Video'], 'Prompt to Video', 'videoSource')}
          </div>

          <div class="control-group">
            <label class="control-label">Video Format</label>
            ${Utils.chipGroupHTML(['Short Reel', 'YouTube Horizontal', 'Documentary', 'Ad'], null, 'videoType')}
          </div>

          <div class="control-group">
            <label class="control-label">Style & Mood</label>
            ${Utils.chipGroupHTML(['Realistic', '3D', 'Doodles', 'Anime', 'Cinematic'], null, 'visualStyle')}
          </div>

          <div class="control-group">
            <label class="control-label">Input Context (Topic / Script / Prompt)</label>
            <textarea class="control-textarea" id="video-topic" placeholder="e.g., The Future of AI in Education" style="min-height:90px"></textarea>
          </div>

          <div class="section-divider">Generate Features</div>
          <div class="control-group">
            ${Utils.chipMultiHTML(['Scene Breakdown', 'Voice-Over Generation', 'Subtitle Auto', 'Full Script'], ['Scene Breakdown', 'Voice-Over Generation'], 'outputs')}
          </div>

          <div class="section-divider">Target AI Model</div>
          <div class="control-group">
            <div class="model-selector">
              <button class="model-btn active" data-value="Runway">Runway Gen-3</button>
              <button class="model-btn" data-value="Sora">Sora</button>
            </div>
          </div>

          <button class="btn btn-generate video ripple" id="video-generate">
            🎬 Generate Video (-15 Credits)
          </button>
          <div id="video-credit-warning" style="color:var(--text-error); font-size:var(--fs-xs); margin-top:8px; display:none; text-align:center;">Insufficient credits! Upgrade to Premium.</div>
        </div>

        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Generated Prompt</h2>
            <button class="btn btn-sm btn-secondary" id="video-save">💾 Save</button>
          </div>
          <div class="output-area" id="video-output">
            <div class="output-placeholder">
              <div class="placeholder-icon">🎬</div>
              <div>Configure your video project and click<br/><strong>Generate Prompt</strong></div>
            </div>
          </div>
          <div class="output-actions" id="video-output-actions" style="display:none">
            <button class="btn btn-sm btn-secondary" id="video-copy">📋 Copy</button>
            <button class="btn btn-sm btn-secondary" id="video-export-json">📄 JSON</button>
            <button class="btn btn-sm btn-secondary" id="video-export-md">📝 Markdown</button>
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

    document.getElementById('video-generate')?.addEventListener('click', () => this._generate());
    document.getElementById('video-copy')?.addEventListener('click', () => { if (this._lastGenerated) Utils.copyToClipboard(this._lastGenerated.content); });
    document.getElementById('video-save')?.addEventListener('click', () => this._save());
    document.getElementById('video-export-json')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'json'));
    document.getElementById('video-export-md')?.addEventListener('click', () => Utils.exportPrompt(this._lastGenerated, 'markdown'));
  },

  _generate() {
    const page = document.querySelector('.module-page');
    const warn = document.getElementById('video-credit-warning');

    if (!Store.useCredits(15)) {
      if (warn) warn.style.display = 'block';
      Utils.toast('Insufficient credits! Please upgrade your plan.', 'error');
      return;
    }
    if (warn) warn.style.display = 'none';

    const settings = {
      videoSource: Utils.getChipValue(page, 'videoSource'),
      videoType: Utils.getChipValue(page, 'videoType'),
      visualStyle: Utils.getChipValue(page, 'visualStyle'),
      outputs: Utils.getChipValues(page, 'outputs'),
    };
    const model = Utils.getSelectedModel(page) || null;
    const topic = document.getElementById('video-topic')?.value || '';

    const prompt = PromptCore.generate({
      module: 'video',
      model,
      settings,
      context: { text: topic },
    });

    this._lastGenerated = {
      module: 'video',
      model: model || 'Auto',
      settings,
      content: prompt,
      title: `${settings.videoType || 'Auto'} — ${settings.scriptStyle || 'Auto'} — ${settings.mood || 'Auto'}`,
    };

    const output = document.getElementById('video-output');
    const actions = document.getElementById('video-output-actions');
    if (output) { Utils.typeText(output, prompt); if (actions) actions.style.display = 'flex'; }
  },

  _save() {
    if (!this._lastGenerated) { Utils.toast('Generate a prompt first', 'warning'); return; }
    Store.savePrompt({ ...this._lastGenerated });
    Utils.toast('Prompt saved! 🎬', 'success');
  }
};
