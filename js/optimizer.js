/**
 * AI Prompt Studio — Prompt Optimizer Module (Prompt Lab / Free)
 * Enhances user prompts using intelligent strategies. No credits required.
 */
const OptimizerPage = {
    render() {
        const html = `
        <div class="module-page" style="--module-accent: #10B981; --module-glow: rgba(16, 185, 129, 0.1);">
            <div class="module-hero" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), transparent); border-bottom: 1px solid rgba(16, 185, 129, 0.2);">
                <h1>✨ Prompt Optimizer</h1>
                <p>Enhance your basic prompts into highly effective, structured instructions. 100% Free.</p>
            </div>

            <div class="module-content">
                <div class="module-panel">
                    <div class="module-panel-header">
                        <h2>Input Prompt</h2>
                    </div>

                    <div class="control-group">
                        <textarea class="control-textarea" id="opt-input" placeholder="Enter your raw prompt here... e.g. 'Write a blog post about AI'" style="min-height:180px"></textarea>
                    </div>

                    <div class="control-group" style="margin-top: var(--sp-4);">
                        ${Utils.toggleSwitchHTML('opt-toggle', 'Raw Prompt', '✨ Improve My Prompt', true)}
                        <div class="toggle-hint" id="opt-hint">Optimize the prompt using best practices (context, role, format constraints).</div>
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

                    <button class="btn btn-generate ripple" id="opt-generate" style="background: #10B981; color: white;">
                        ✨ Optimize Prompt
                    </button>
                </div>

                <div class="module-panel">
                    <div class="module-panel-header">
                        <h2>Optimized Output</h2>
                        <button class="btn btn-sm btn-secondary" id="opt-save">💾 Save</button>
                    </div>
                    <div class="output-area" id="opt-output">
                        <div class="output-placeholder">
                            <div class="placeholder-icon">✨</div>
                            <div>Enter your prompt and click<br/><strong>Optimize Prompt</strong></div>
                        </div>
                    </div>
                    <div class="output-actions" id="opt-output-actions" style="display:none">
                        <button class="btn btn-sm btn-secondary" id="opt-copy">📋 Copy</button>
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

        Utils.initModelSelector(page);

        const toggle = document.getElementById('opt-toggle');
        const hint = document.getElementById('opt-hint');
        toggle?.addEventListener('change', () => {
            const isOpt = toggle.checked;
            if (hint) {
                hint.textContent = isOpt ? 'Optimize the prompt using best practices (context, role, format constraints).' : 'Keep the prompt exactly as written (passes through).';
            }
        });

        document.getElementById('opt-generate')?.addEventListener('click', () => this._generate());
        document.getElementById('opt-copy')?.addEventListener('click', () => { if (this._lastGenerated) Utils.copyToClipboard(this._lastGenerated.content); });
        document.getElementById('opt-save')?.addEventListener('click', () => this._save());
    },

    _generate() {
        const input = document.getElementById('opt-input')?.value || '';
        if (!input.trim()) {
            Utils.toast('Please enter a prompt to optimize', 'warning');
            return;
        }

        const isOpt = document.getElementById('opt-toggle')?.checked;
        const page = document.querySelector('.module-page');
        const model = Utils.getSelectedModel(page) || 'GPT';

        // This is a free prompt generation tool (no credits consumed)

        let promptText = '';
        if (!isOpt) {
            promptText = input;
        } else {
            promptText = PromptCore.generate({
                module: 'optimizer',
                model,
                context: { text: input }
            });
        }

        this._lastGenerated = {
            module: 'optimizer',
            model: model,
            settings: { optimized: isOpt },
            content: promptText,
            title: \`Optimized — \${input.slice(0, 30)}...\`
        };

        const output = document.getElementById('opt-output');
        const actions = document.getElementById('opt-output-actions');
        if (output) { 
            Utils.typeText(output, promptText); 
            if (actions) actions.style.display = 'flex'; 
        }
    },

    _save() {
        if (!this._lastGenerated) { Utils.toast('Generate a prompt first', 'warning'); return; }
        Store.savePrompt({ ...this._lastGenerated });
        Utils.toast('Prompt saved! ✨', 'success');
    }
};
