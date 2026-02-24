/**
 * AI Prompt Studio — Designers Module (Purple Gradient Theme)
 * Refactored: Auto defaults, text input, prompt/image toggle, GPT image gen
 */
const DesignersPage = {
  _uploadedImages: [],

  render() {
    const html = `
    <div class="module-page" style="--module-accent: var(--clr-designers); --module-glow: var(--clr-designers-glow);">
      <div class="module-hero hero-designers">
        <h1>🎨 Designers Studio</h1>
        <p>Generate optimized visual prompts for Midjourney, Stable Diffusion, Leonardo, Runway, and GPT/DALL-E image generation.</p>
      </div>

      <div class="module-content">
        <!-- Left: Controls -->
        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Configuration</h2>
          </div>

          <div class="control-group">
            <label class="control-label">Upload Reference Images</label>
            <div class="upload-area" id="designers-upload">
              <div class="upload-icon">📸</div>
              <div class="upload-text">Drag & drop images or click to browse</div>
              <div class="upload-hint">PNG, JPG, WebP — up to 5 images</div>
              <input type="file" id="designers-file-input" multiple accept="image/*" style="display:none" />
            </div>
            <div class="upload-preview" id="designers-preview"></div>
          </div>

          <div class="control-group">
            <label class="control-label">Creative Direction</label>
            <textarea class="control-textarea" id="designers-text-input" placeholder="Describe your vision: subject, atmosphere, specific elements, color palette ideas..." style="min-height:90px"></textarea>
          </div>

          <div class="control-group">
            <label class="control-label">Image Type</label>
            ${Utils.chipGroupHTML(['Portrait', 'Landscape', 'Cinematic', 'Product', 'Editorial'], null, 'imageType')}
          </div>

          <div class="control-group">
            <label class="control-label">Mood</label>
            ${Utils.chipGroupHTML(['Dark', 'Bright', 'Moody', 'Futuristic', 'Minimal'], null, 'mood')}
          </div>

          <div class="control-group">
            <label class="control-label">Time of Day</label>
            ${Utils.chipGroupHTML(['Golden Hour', 'Sunset', 'Night', 'Noon', 'Dawn'], null, 'time')}
          </div>

          <div class="control-group">
            <label class="control-label">Visual Style</label>
            ${Utils.chipGroupHTML(['Realistic', '3D', 'Anime', 'Doodles', 'Hyper-Detailed', 'Cinematic'], null, 'style')}
          </div>

          <div class="section-divider">Output Mode</div>
          <div class="control-group">
            ${Utils.toggleSwitchHTML('designers-mode-toggle', '📝 Generate Prompt', '🖼️ Generate AI Image', false)}
            <div class="toggle-hint" id="designers-mode-hint">Produces a text prompt to paste into any AI model</div>
          </div>

          <div class="section-divider">Target AI Model</div>
          <div class="control-group">
            <div class="model-selector">
              <button class="model-btn active" data-value="GPT">GPT</button>
              <button class="model-btn" data-value="Midjourney">Midjourney</button>
              <button class="model-btn" data-value="Stable Diffusion">Stable Diff</button>
              <button class="model-btn" data-value="Leonardo">Leonardo</button>
              <button class="model-btn" data-value="Runway">Runway</button>
              <button class="model-btn" data-value="DALL-E">DALL-E</button>
            </div>
          </div>

          <button class="btn btn-generate designers ripple" id="designers-generate">
            ✨ Generate Prompt
          </button>
        </div>

        <!-- Right: Output -->
        <div class="module-panel">
          <div class="module-panel-header">
            <h2>Generated Prompt</h2>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-sm btn-secondary" id="designers-save" title="Save">💾 Save</button>
            </div>
          </div>
          <div class="output-area" id="designers-output">
            <div class="output-placeholder">
              <div class="placeholder-icon">🎨</div>
              <div>Configure your settings and click<br/><strong>Generate Prompt</strong> to see results</div>
            </div>
          </div>
          <div class="output-actions" id="designers-output-actions" style="display:none">
            <button class="btn btn-sm btn-secondary" id="designers-copy">📋 Copy</button>
            <button class="btn btn-sm btn-secondary" id="designers-export-json">📄 JSON</button>
            <button class="btn btn-sm btn-secondary" id="designers-export-md">📝 Markdown</button>
          </div>
        </div>
      </div>
    </div>`;

    setTimeout(() => this._bind(), 50);
    return html;
  },

  _bind() {
    const page = document.querySelector('.module-page');
    if (!page) return;

    Utils.initChips(page);
    Utils.initModelSelector(page);

    // Upload handlers
    const uploadArea = document.getElementById('designers-upload');
    const fileInput = document.getElementById('designers-file-input');
    if (uploadArea) {
      uploadArea.addEventListener('click', () => fileInput.click());
      uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
      uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        this._handleFiles(e.dataTransfer.files);
      });
    }
    if (fileInput) {
      fileInput.addEventListener('change', () => this._handleFiles(fileInput.files));
    }

    // Toggle switch — prompt vs image mode
    const modeToggle = document.getElementById('designers-mode-toggle');
    const modeHint = document.getElementById('designers-mode-hint');
    const genBtn = document.getElementById('designers-generate');
    if (modeToggle) {
      modeToggle.addEventListener('change', () => {
        const isImage = modeToggle.checked;
        if (modeHint) modeHint.textContent = isImage
          ? 'Generates an image directly (GPT/DALL-E) or an image-optimized prompt'
          : 'Produces a text prompt to paste into any AI model';
        if (genBtn) genBtn.innerHTML = isImage ? '🖼️ Generate Image Prompt' : '✨ Generate Prompt';
        // Update toggle label active states
        const labels = modeToggle.closest('.toggle-switch-wrapper')?.querySelectorAll('.toggle-label');
        if (labels) {
          labels[0].classList.toggle('active', !isImage);
          labels[1].classList.toggle('active', isImage);
        }
      });
    }

    // Action buttons
    document.getElementById('designers-generate')?.addEventListener('click', () => this._generate());
    document.getElementById('designers-copy')?.addEventListener('click', () => this._copy());
    document.getElementById('designers-save')?.addEventListener('click', () => this._save());
    document.getElementById('designers-export-json')?.addEventListener('click', () => this._export('json'));
    document.getElementById('designers-export-md')?.addEventListener('click', () => this._export('markdown'));
  },

  _handleFiles(files) {
    Array.from(files).forEach(file => {
      if (this._uploadedImages.length >= 5) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this._uploadedImages.push({ name: file.name, src: e.target.result });
        this._renderPreviews();
      };
      reader.readAsDataURL(file);
    });
  },

  _renderPreviews() {
    const preview = document.getElementById('designers-preview');
    if (!preview) return;
    preview.innerHTML = this._uploadedImages.map((img, i) => `
      <div class="upload-thumb">
        <img src="${img.src}" alt="${img.name}" />
        <div class="upload-thumb-remove" data-idx="${i}">×</div>
      </div>
    `).join('');
    preview.querySelectorAll('.upload-thumb-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        this._uploadedImages.splice(parseInt(btn.dataset.idx), 1);
        this._renderPreviews();
      });
    });
  },

  _lastGenerated: null,

  _generate() {
    const page = document.querySelector('.module-page');
    const isImageMode = document.getElementById('designers-mode-toggle')?.checked || false;

    if (isImageMode && !Store.useCredits(10)) {
      Utils.toast('Insufficient credits! Upgrade to generate images.', 'error');
      return;
    }

    const settings = {
      imageType: Utils.getChipValue(page, 'imageType'),
      mood: Utils.getChipValue(page, 'mood'),
      time: Utils.getChipValue(page, 'time'),
      style: Utils.getChipValue(page, 'style'),
      outputMode: isImageMode ? 'image' : 'prompt',
    };

    const model = Utils.getSelectedModel(page) || 'GPT';
    const textInput = document.getElementById('designers-text-input')?.value || '';

    const prompt = PromptCore.generate({
      module: 'designers',
      model,
      settings,
      context: {
        text: textInput,
        images: this._uploadedImages,
      },
    });

    const titleParts = [settings.imageType || 'Auto', settings.mood || 'Auto', model].filter(Boolean);
    this._lastGenerated = {
      module: 'designers',
      model,
      settings,
      content: prompt,
      title: titleParts.join(' — '),
    };

    const output = document.getElementById('designers-output');
    const actions = document.getElementById('designers-output-actions');
    if (output) {
      Utils.typeText(output, prompt);
      if (actions) actions.style.display = 'flex';
    }
  },

  _copy() {
    if (this._lastGenerated) Utils.copyToClipboard(this._lastGenerated.content);
  },

  _save() {
    if (!this._lastGenerated) { Utils.toast('Generate a prompt first', 'warning'); return; }
    Store.savePrompt({ ...this._lastGenerated });
    Utils.toast('Prompt saved! ✨', 'success');
  },

  _export(format) {
    if (!this._lastGenerated) return;
    Utils.exportPrompt(this._lastGenerated, format);
  }
};
