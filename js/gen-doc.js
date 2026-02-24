/**
 * AI Prompt Studio — Document Generator (Generator Studio / PRO)
 * Uses Free keyless AI APIs (text.pollinations.ai) to generate downloadable text files.
 */
const GenDocPage = {
    render() {
        const html = `
        <div class="module-page" style="--module-accent: #3B82F6; --module-glow: rgba(59, 130, 246, 0.1);">
            <div class="module-hero" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), transparent); border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                <h1>📄 Document Generator</h1>
                <p>Generate highly structured, long-form Markdown files or text documents dynamically. Consumes 2 Credits.</p>
            </div>

            <div class="module-content">
                <div class="module-panel">
                    <div class="module-panel-header">
                        <h2>Generation Settings</h2>
                    </div>

                    <div class="control-group">
                        <label class="control-label">Document Type</label>
                        <div class="module-tabs" id="gd-doc-tabs">
                            <button class="module-tab active" data-value="markdown">Markdown (.md)</button>
                            <button class="module-tab" data-value="text">Plain Text (.txt)</button>
                        </div>
                    </div>

                    <div class="control-group">
                        <label class="control-label" id="gd-text-label">Document Subject & Constraints</label>
                        <textarea class="control-textarea" id="gd-prompt" placeholder="E.g. A comprehensive 5-page guide on machine learning concepts... Provide a detailed outline, formatting requests, and tone requirements." style="min-height:220px"></textarea>
                    </div>

                    <button class="btn btn-generate ripple" id="gd-generate" style="background: #3B82F6; color: white;">
                        📄 Generate Document (-2 Credits)
                    </button>
                    <div id="gd-credit-warning" style="color:var(--text-error); font-size:var(--fs-xs); margin-top:8px; display:none; text-align:center;">Insufficient credits! Upgrade to Premium.</div>
                </div>

                <div class="module-panel">
                    <div class="module-panel-header">
                        <h2>Document Output</h2>
                    </div>
                    <div class="output-area" id="gd-output" style="min-height: 400px; display: flex; flex-direction: column; white-space: pre-wrap; word-break: break-word;">
                        <div class="output-placeholder">
                            <div class="placeholder-icon">📄</div>
                            <div>Enter detailed instructions and click<br/><strong>Generate Document</strong></div>
                        </div>
                    </div>
                    <div class="output-actions" id="gd-output-actions" style="display:none; justify-content: center; margin-top: 16px;">
                        <button class="btn btn-primary" id="gd-download">📥 Download Document</button>
                        <button class="btn btn-secondary" id="gd-copy">📋 Copy Text</button>
                    </div>
                </div>
            </div>
        </div>`;

        setTimeout(() => this._bind(), 50);
        return html;
    },

    _currentText: '',
    _selectedMode: 'markdown',

    _bind() {
        const page = document.querySelector('.module-page');
        if (!page) return;

        // Mode Tabbing
        const tabs = page.querySelectorAll('#gd-doc-tabs .module-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this._selectedMode = tab.dataset.value;
            });
        });

        document.getElementById('gd-generate')?.addEventListener('click', () => this._generate());
        document.getElementById('gd-download')?.addEventListener('click', () => this._download());
        document.getElementById('gd-copy')?.addEventListener('click', () => { if (this._currentText) Utils.copyToClipboard(this._currentText) });
    },

    async _generate() {
        const desc = document.getElementById('gd-prompt')?.value.trim();
        if (!desc) {
            Utils.toast('Please enter the document instructions', 'warning');
            return;
        }

        const cost = 2;
        const warn = document.getElementById('gd-credit-warning');
        if (!Store.useCredits(cost)) {
            if (warn) warn.style.display = 'block';
            Utils.toast('Insufficient credits! Upgrade your plan.', 'error');
            return;
        }
        if (warn) warn.style.display = 'none';

        const output = document.getElementById('gd-output');
        const actions = document.getElementById('gd-output-actions');

        output.innerHTML = '<div style="text-align:center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;"><div class="spinner" style="border: 3px solid rgba(255,255,255,0.1); border-top-color: #3B82F6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>Generating Document (AI)...</div>';
        actions.style.display = 'none';

        // Add keyframes for spinner if not exists
        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }

        // Generate Text Document via text.pollinations.ai
        // Use a generic prompt construction for better output
        const formattedPrompt = \`Generate a highly detailed \${this._selectedMode} document. Avoid intro/outro conversational filler, just produce the requested document body. INSTRUCTIONS: \${desc}\`;
        
        try {
            const response = await fetch(\`https://text.pollinations.ai/\${encodeURIComponent(formattedPrompt)}\`);
            const data = await response.text();
            
            if (response.ok && data) {
                this._currentText = data;
                
                // Display text cleanly in code block style
                // If it's empty though
                if (!data.trim()) {
                    throw new Error("Empty return");
                }
                
                output.innerHTML = '';
                Utils.typeText(output, data);
                
                actions.style.display = 'flex';
                Utils.toast('Document generated successfully! 📄', 'success');
            } else {
                throw new Error("API Error");
            }
        } catch (error) {
            output.innerHTML = '<div style="color:var(--text-error); text-align:center; margin-top:auto; margin-bottom:auto;">Failed to generate document. The API might be down.</div>';
            Utils.toast('Generation failed', 'error');
            // Refund credits
            Store.set('credits', Store.get('credits') + cost);
        }
    },

    _download() {
        if (!this._currentText) return;
        
        const blob = new Blob([this._currentText], { type: "text/plain;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = \`generated-document-\${Date.now()}.\${this._selectedMode === 'markdown' ? 'md' : 'txt'}\`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        Utils.toast('Download started! 📥', 'success');
    }
};
