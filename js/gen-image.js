/**
 * AI Prompt Studio — Image Generator (Generator Studio)
 * Uses Free keyless AI APIs (Pollinations.ai) to generate downloadable images.
 * Includes Premium Carousel logic
 */
const GenImagePage = {
    render() {
        const isFree = Store.get('plan') === 'free';
        const html = `
        <div class="module-page" style="--module-accent: #8B5CF6; --module-glow: rgba(139, 92, 246, 0.1);">
            <div class="module-hero" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), transparent); border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                <h1>🖼️ Image Generator</h1>
                <p>Generate and download high-quality images dynamically. Consumes 5 Credits per image.</p>
            </div>

            <div class="module-content">
                <div class="module-panel">
                    <div class="module-panel-header">
                        <h2>Generation Settings</h2>
                    </div>

                    <div class="control-group">
                        <label class="control-label">Tool Mode</label>
                        <div class="module-tabs" id="gi-mode-tabs">
                            <button class="module-tab active" data-value="single">Single Image</button>
                            <button class="module-tab" data-value="carousel" ${isFree ? 'onclick="document.getElementById(\'premium-modal\').classList.remove(\'hidden\')"' : ''
    }> Carousel Generator ${ isFree ?'🔒': ''}</button>
                        </div >
                    </div >

                    <div class="control-group">
                        <label class="control-label" id="gi-text-label">Image Description</label>
                        <textarea class="control-textarea" id="gi-prompt" placeholder="Describe the image you want to generate in detail..." style="min-height:120px"></textarea>
                    </div>

                    <button class="btn btn-generate ripple" id="gi-generate" style="background: #8B5CF6; color: white;">
                        🖼️ Generate File (-5 Credits)
                    </button>
                    <div id="gi-credit-warning" style="color:var(--text-error); font-size:var(--fs-xs); margin-top:8px; display:none; text-align:center;">Insufficient credits! Upgrade to Premium.</div>
                </div >

    <div class="module-panel">
        <div class="module-panel-header">
            <h2>Generated Files</h2>
        </div>
        <div class="output-area" id="gi-output" style="min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.2);">
            <div class="output-placeholder">
                <div class="placeholder-icon">🖼️</div>
                <div>Enter a description and click<br /><strong>Generate File</strong></div>
            </div>
        </div>
        <div class="output-actions" id="gi-output-actions" style="display:none; justify-content: center; margin-top: 16px;">
            <button class="btn btn-primary" id="gi-download">📥 Download Image</button>
        </div>
    </div>
            </div >
        </div > `;

        setTimeout(() => this._bind(), 50);
        return html;
    },

    _currentUrl: null,
    _selectedMode: 'single',

    _bind() {
        const page = document.querySelector('.module-page');
        if (!page) return;

        // Mode Tabbing
        const tabs = page.querySelectorAll('#gi-mode-tabs .module-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                if (tab.innerText.includes('🔒')) return; // Premium locked
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this._selectedMode = tab.dataset.value;
                document.getElementById('gi-text-label').innerText = this._selectedMode === 'carousel' ? 'Carousel Topic & Prompt' : 'Image Description';
                document.getElementById('gi-generate').innerText = this._selectedMode === 'carousel' ? '🎠 Generate Carousel (-10 Credits)' : '🖼️ Generate File (-5 Credits)';
            });
        });

        document.getElementById('gi-generate')?.addEventListener('click', () => this._generate());
        document.getElementById('gi-download')?.addEventListener('click', () => this._download());
    },

    _generate() {
        const desc = document.getElementById('gi-prompt')?.value.trim();
        if (!desc) {
            Utils.toast('Please enter a description first', 'warning');
            return;
        }

        const cost = this._selectedMode === 'carousel' ? 10 : 5;
        const warn = document.getElementById('gi-credit-warning');
        if (!Store.useCredits(cost)) {
            if (warn) warn.style.display = 'block';
            Utils.toast('Insufficient credits! Upgrade your plan.', 'error');
            return;
        }
        if (warn) warn.style.display = 'none';

        const output = document.getElementById('gi-output');
        const actions = document.getElementById('gi-output-actions');
        
        output.innerHTML = '<div style="text-align:center"><div class="spinner" style="border: 3px solid rgba(255,255,255,0.1); border-top-color: #8B5CF6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>Generating file...</div>';
        actions.style.display = 'none';

        // Add keyframes for spinner if not exists
        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }

        // Generate via Pollinations.ai (Free no-key image gen)
        const seed = Math.floor(Math.random() * 100000); // Randomize
        const width = this._selectedMode === 'carousel' ? 1080 : 1024;
        const height = this._selectedMode === 'carousel' ? 1350 : 1024;
        
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(desc)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
        
        // Load image unseen to check when it finishes
        const img = new Image();
        img.onload = () => {
            this._currentUrl = imageUrl;
            output.innerHTML = `<img src="${imageUrl}" style="max-width: 100%; max-height: 500px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);" />`;
            actions.style.display = 'flex';
            Utils.toast('Image generated successfully! ✨', 'success');
        };
        img.onerror = () => {
            output.innerHTML = '<div style="color:var(--text-error)">Failed to generate image. Please try again.</div>';
            Utils.toast('Generation failed', 'error');
            // Refund credits
            Store.set('credits', Store.get('credits') + cost);
        };
        img.src = imageUrl;
    },

    _download() {
        if (!this._currentUrl) return;
        
        // Fetch to trigger browser download
        fetch(this._currentUrl)
          .then(response => response.blob())
          .then(blob => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = `generated-${this._selectedMode}-${Date.now()}.jpg`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              Utils.toast('Download started! 📥', 'success');
          })
          .catch(() => Utils.toast('Failed to download image', 'error'));
    }
};
