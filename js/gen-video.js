/**
 * AI Prompt Studio — Video Generator (Generator Studio / PRO)
 * Simulates high-cost video generation and provides a free mock video file download.
 */
const GenVideoPage = {
    render() {
        const html = `
        <div class="module-page" style="--module-accent: #F43F5E; --module-glow: rgba(244, 63, 94, 0.1);">
            <div class="module-hero" style="background: linear-gradient(135deg, rgba(244, 63, 94, 0.15), transparent); border-bottom: 1px solid rgba(244, 63, 94, 0.2);">
                <h1>🎞️ Video Generator</h1>
                <p>Generate high-quality 4-second to 10-second video clips via AI (Sora / Gen-3). Consumes 20 Credits.</p>
            </div>

            <div class="module-content">
                <div class="module-panel">
                    <div class="module-panel-header">
                        <h2>Generation Settings</h2>
                    </div>

                    <div class="control-group">
                        <label class="control-label">Video Engine</label>
                        <div class="module-tabs" id="gv-engine-tabs">
                            <button class="module-tab active" data-value="runway">Runway Gen-3</button>
                            <button class="module-tab" data-value="sora">OpenAI Sora</button>
                            <button class="module-tab" data-value="luma">Luma Dream Machine</button>
                        </div>
                    </div>

                    <div class="control-group">
                        <label class="control-label" id="gv-text-label">Video Scene Description (Input Prompt)</label>
                        <textarea class="control-textarea" id="gv-prompt" placeholder="A futuristic cyberpunk city seen from a flying car racing through neon-lit skyscrapers at night, hyper-realistic, 8k resolution..." style="min-height:120px"></textarea>
                    </div>

                    <div class="control-group">
                        <label class="control-label">Video Length</label>
                        ${Utils.chipGroupHTML(['4 Seconds', '5 Seconds', '10 Seconds (-40 Credits)'], '5 Seconds', 'gv-length')}
                    </div>

                    <button class="btn btn-generate ripple" id="gv-generate" style="background: #F43F5E; color: white;">
                        🎞️ Generate Video File (-20 Credits)
                    </button>
                    <div id="gv-credit-warning" style="color:var(--text-error); font-size:var(--fs-xs); margin-top:8px; display:none; text-align:center;">Insufficient credits! Upgrade to Premium.</div>
                </div>

                <div class="module-panel">
                    <div class="module-panel-header">
                        <h2>Generated Video Output</h2>
                    </div>
                    <div class="output-area" id="gv-output" style="min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.2);">
                        <div class="output-placeholder">
                            <div class="placeholder-icon">🎞️</div>
                            <div>Enter a scene prompt and click<br/><strong>Generate Video File</strong></div>
                        </div>
                    </div>
                    <div class="output-actions" id="gv-output-actions" style="display:none; justify-content: center; margin-top: 16px;">
                        <button class="btn btn-primary" id="gv-download">📥 Download MP4 Video</button>
                    </div>
                </div>
            </div>
        </div>`;

        setTimeout(() => this._bind(), 50);
        return html;
    },

    _currentUrl: null,
    _selectedMode: 'runway',

    _bind() {
        const page = document.querySelector('.module-page');
        if (!page) return;

        Utils.initChips(page);

        // Mode Tabbing
        const tabs = page.querySelectorAll('#gv-engine-tabs .module-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this._selectedMode = tab.dataset.value;
            });
        });

        document.getElementById('gv-generate')?.addEventListener('click', () => this._generate());
        document.getElementById('gv-download')?.addEventListener('click', () => this._download());
    },

    _generate() {
        const desc = document.getElementById('gv-prompt')?.value.trim();
        if (!desc) {
            Utils.toast('Please enter a video prompt description.', 'warning');
            return;
        }

        const page = document.querySelector('.module-page');
        const lengthSetting = Utils.getChipValue(page, 'gv-length');
        const cost = lengthSetting.includes('10 Seconds') ? 40 : 20;

        const warn = document.getElementById('gv-credit-warning');
        if (!Store.useCredits(cost)) {
            if (warn) warn.style.display = 'block';
            Utils.toast('Insufficient credits! Upgrade your plan.', 'error');
            return;
        }
        if (warn) warn.style.display = 'none';

        const output = document.getElementById('gv-output');
        const actions = document.getElementById('gv-output-actions');

        output.innerHTML = '<div style="text-align:center"><div class="spinner" style="border: 3px solid rgba(255,255,255,0.1); border-top-color: #F43F5E; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div><p id="gv-progress-text">Initializing Generation Pipeline...</p></div>';
        actions.style.display = 'none';

        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }

        const progressText = document.getElementById('gv-progress-text');

        // Simulating the realistic long wait time for video generation APIs
        let progressSteps = [
            "Sending request to video clusters...",
            "Analyzing prompt logic...",
            "Rendering initial frames...",
            "Upscaling and smoothing video...",
            "Finalizing MP4 file..."
        ];

        let step = 0;
        const interval = setInterval(() => {
            if (step < progressSteps.length) {
                progressText.innerText = progressSteps[step];
                step++;
            }
        }, 1500);

        setTimeout(() => {
            clearInterval(interval);

            // Provide a free placeholder stock video since we don't really have Sora access
            const placeholderVideoURL = "https://videos.pexels.com/video-files/3163534/3163534-uhd_2560_1440_24fps.mp4";
            this._currentUrl = placeholderVideoURL;

            output.innerHTML = `<video src="${placeholderVideoURL}" controls autoplay loop muted style="max-width: 100%; max-height: 500px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);"></video>`;
            actions.style.display = 'flex';
            Utils.toast('Video generated successfully! 🎬', 'success');
        }, progressSteps.length * 1500 + 1000);
    },

    _download() {
        if (!this._currentUrl) return;
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = this._currentUrl;
        a.download = `generated-video-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        Utils.toast('Downloading video file! 📥', 'success');
    }
};
