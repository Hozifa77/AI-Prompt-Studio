/**
 * AI Prompt Studio — Carousel Generator (Generator Studio / Paid)
 * Generates slide content and conceptual visual layouts, consuming credits.
 */
const CarouselPage = {
    render() {
        const html = `
        <div class="module-page" style="--module-accent: #EC4899; --module-glow: rgba(236, 72, 153, 0.1);">
            <div class="module-hero" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), transparent); border-bottom: 1px solid rgba(236, 72, 153, 0.2);">
                <h1>🎠 Carousel Generator</h1>
                <p>Generate high-converting carousels with slide text, visual layouts, and cover ideas. Consumes 5 Credits.</p>
            </div>

            <div class="module-content">
                <div class="module-panel">
                    <div class="module-panel-header">
                        <h2>Configuration</h2>
                    </div>

                    <div class="control-group">
                        <label class="control-label">Platform</label>
                        ${Utils.chipGroupHTML(['Instagram', 'LinkedIn', 'Facebook'], null, 'platform')}
                    </div>

                    <div class="control-group">
                        <label class="control-label">Content Type</label>
                        ${Utils.chipGroupHTML(['Educational', 'Story', 'Listicles', 'Product Showcase', 'Data Insights'], null, 'contentType')}
                    </div>

                    <div class="control-group">
                        <label class="control-label">Slide Count</label>
                        ${Utils.chipGroupHTML(['Auto', '5', '7', '10'], null, 'slideCount')}
                    </div>

                    <div class="control-group">
                        <label class="control-label">Topic / Content Brief</label>
                        <textarea class="control-textarea" id="car-topic" placeholder="e.g. '5 AI Tools to 10x your productivity'" style="min-height:90px"></textarea>
                    </div>

                    <div class="section-divider">Output Requirements</div>
                    <div class="control-group">
                        ${Utils.chipMultiHTML(['Slide Text', 'Visual Layout', 'Cover Slide', 'Caption & Hashtags'], ['Slide Text', 'Visual Layout', 'Cover Slide', 'Caption & Hashtags'], 'outputs')}
                    </div>

                    <button class="btn btn-generate ripple" id="car-generate" style="background: #EC4899; color: white;">
                        🎠 Generate Carousel (-5 Credits)
                    </button>
                    <div id="car-credit-warning" style="color:var(--text-error); font-size:var(--fs-xs); margin-top:8px; display:none; text-align:center;">Insufficient credits! Upgrade to Premium.</div>
                </div>

                <div class="module-panel">
                    <div class="module-panel-header">
                        <h2>Generated Carousel Plan</h2>
                        <button class="btn btn-sm btn-secondary" id="car-save">💾 Save</button>
                    </div>
                    <div class="output-area" id="car-output">
                        <div class="output-placeholder">
                            <div class="placeholder-icon">🎠</div>
                            <div>Configure your carousel and click<br/><strong>Generate Carousel</strong></div>
                        </div>
                    </div>
                    <div class="output-actions" id="car-output-actions" style="display:none">
                        <button class="btn btn-sm btn-secondary" id="car-copy">📋 Copy</button>
                        <button class="btn btn-sm btn-secondary" id="car-export-zip">📥 Export PNG Zip</button>
                        <button class="btn btn-sm btn-secondary" id="car-export-pdf">📥 Export PDF</button>
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

        document.getElementById('car-generate')?.addEventListener('click', () => this._generate());
        document.getElementById('car-copy')?.addEventListener('click', () => { if (this._lastGenerated) Utils.copyToClipboard(this._lastGenerated.content); });
        document.getElementById('car-save')?.addEventListener('click', () => this._save());

        // Mocking exports
        document.getElementById('car-export-zip')?.addEventListener('click', () => {
            Utils.toast('📥 Downloading mock.zip...', 'info');
            setTimeout(() => Utils.toast('carousel-assets.zip downloaded successfully', 'success'), 1500);
        });
        document.getElementById('car-export-pdf')?.addEventListener('click', () => {
            Utils.toast('📄 Generating PDF...', 'info');
            setTimeout(() => Utils.toast('carousel-presentation.pdf downloaded successfully', 'success'), 1500);
        });
    },

    _generate() {
        const creditCost = 5;
        const page = document.querySelector('.module-page');
        const warn = document.getElementById('car-credit-warning');

        if (!Store.useCredits(creditCost)) {
            if (warn) warn.style.display = 'block';
            Utils.toast('Insufficient credits! Please upgrade your plan.', 'error');
            return;
        }
        if (warn) warn.style.display = 'none';

        const settings = {
            platform: Utils.getChipValue(page, 'platform'),
            contentType: Utils.getChipValue(page, 'contentType'),
            slideCount: Utils.getChipValue(page, 'slideCount'),
            outputs: Utils.getChipValues(page, 'outputs')
        };
        const topic = document.getElementById('car-topic')?.value || '';

        const promptText = PromptCore.generate({
            module: 'carousel',
            model: 'GPT',
            settings,
            context: { text: topic }
        });

        this._lastGenerated = {
            module: 'carousel',
            model: 'GPT',
            settings,
            content: promptText,
            title: `Carousel — ${settings.platform || 'Auto'} — ${settings.contentType || 'Auto'}`
        };

        const output = document.getElementById('car-output');
        const actions = document.getElementById('car-output-actions');
        if (output) {
            Utils.typeText(output, promptText);
            if (actions) actions.style.display = 'flex';
        }
    },

    _save() {
        if (!this._lastGenerated) { Utils.toast('Generate a carousel first', 'warning'); return; }
        Store.savePrompt({ ...this._lastGenerated });
        Utils.toast('Carousel saved! 🎠', 'success');
    }
};
