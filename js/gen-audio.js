/**
 * AI Prompt Studio — Audio Generator (Generator Studio / PRO)
 * Simulates audio generation (TTS / Music) and provides a mock audio download.
 */
const GenAudioPage = {
    render() {
        const html = `
        <div class="module-page" style="--module-accent: #10B981; --module-glow: rgba(16, 185, 129, 0.1);">
            <div class="module-hero" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), transparent); border-bottom: 1px solid rgba(16, 185, 129, 0.2);">
                <h1>🎧 Audio Generator</h1>
                <p>Generate high-quality Text-to-Speech (ElevenLabs) or AI Music. Consumes 10 Credits.</p>
            </div>

            <div class="module-content">
                <div class="module-panel">
                    <div class="module-panel-header">
                        <h2>Generation Settings</h2>
                    </div>

                    <div class="control-group">
                        <label class="control-label">Audio Type</label>
                        <div class="module-tabs" id="ga-type-tabs">
                            <button class="module-tab active" data-value="tts">Text to Speech</button>
                            <button class="module-tab" data-value="music">AI Music Generation</button>
                        </div>
                    </div>

                    <div class="control-group" id="ga-voice-group">
                        <label class="control-label">Voice Selection</label>
                        ${Utils.chipGroupHTML(['Rachel (American, Calm)', 'Drew (British, News)', 'Clyde (Deep, Cinematic)', 'Mimi (Childlike)'], 'Rachel (American, Calm)', 'ga-voice')}
                    </div>

                    <div class="control-group">
                        <label class="control-label" id="ga-text-label">Text Input / Music Prompt</label>
                        <textarea class="control-textarea" id="ga-prompt" placeholder="Hello world, welcome to AI Prompt Studio..." style="min-height:120px"></textarea>
                    </div>

                    <button class="btn btn-generate ripple" id="ga-generate" style="background: #10B981; color: white;">
                        🎧 Generate Audio File (-10 Credits)
                    </button>
                    <div id="ga-credit-warning" style="color:var(--text-error); font-size:var(--fs-xs); margin-top:8px; display:none; text-align:center;">Insufficient credits! Upgrade to Premium.</div>
                </div>

                <div class="module-panel">
                    <div class="module-panel-header">
                        <h2>Generated Audio Output</h2>
                    </div>
                    <div class="output-area" id="ga-output" style="min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.2);">
                        <div class="output-placeholder">
                            <div class="placeholder-icon">🎧</div>
                            <div>Enter text/prompt and click<br/><strong>Generate Audio File</strong></div>
                        </div>
                    </div>
                    <div class="output-actions" id="ga-output-actions" style="display:none; justify-content: center; margin-top: 16px;">
                        <button class="btn btn-primary" id="ga-download">📥 Download MP3/WAV</button>
                    </div>
                </div>
            </div>
        </div>`;

        setTimeout(() => this._bind(), 50);
        return html;
    },

    _currentUrl: null,
    _selectedType: 'tts',

    _bind() {
        const page = document.querySelector('.module-page');
        if (!page) return;

        Utils.initChips(page);

        // Mode Tabbing
        const tabs = page.querySelectorAll('#ga-type-tabs .module-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this._selectedType = tab.dataset.value;
                const vg = document.getElementById('ga-voice-group');
                const label = document.getElementById('ga-text-label');

                if (this._selectedType === 'music') {
                    vg.style.display = 'none';
                    label.innerText = 'Music Genre & Mood Prompt';
                } else {
                    vg.style.display = 'block';
                    label.innerText = 'Text Input for TTS';
                }
            });
        });

        document.getElementById('ga-generate')?.addEventListener('click', () => this._generate());
        document.getElementById('ga-download')?.addEventListener('click', () => this._download());
    },

    _generate() {
        const desc = document.getElementById('ga-prompt')?.value.trim();
        if (!desc) {
            Utils.toast('Please enter text or a music prompt.', 'warning');
            return;
        }

        const cost = 10;
        const warn = document.getElementById('ga-credit-warning');
        if (!Store.useCredits(cost)) {
            if (warn) warn.style.display = 'block';
            Utils.toast('Insufficient credits! Upgrade your plan.', 'error');
            return;
        }
        if (warn) warn.style.display = 'none';

        const output = document.getElementById('ga-output');
        const actions = document.getElementById('ga-output-actions');

        output.innerHTML = '<div style="text-align:center"><div class="spinner" style="border: 3px solid rgba(255,255,255,0.1); border-top-color: #10B981; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div><p id="ga-progress-text">Synthesizing audio...</p></div>';
        actions.style.display = 'none';

        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }

        setTimeout(() => {
            // Provide a free placeholder stock audio file to simulate a real download
            const placeholderAudioTTS = "https://actions.google.com/sounds/v1/water/rain_on_roof.ogg";
            this._currentUrl = placeholderAudioTTS;

            output.innerHTML = \`<audio src="\${placeholderAudioTTS}" controls autoplay style="width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); padding: 10px; background: rgba(255,255,255,0.05);"></audio>\`;
            actions.style.display = 'flex';
            Utils.toast('Audio generated successfully! 🎧', 'success');
        }, 3000);
    },

    _download() {
        if (!this._currentUrl) return;
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = this._currentUrl;
        a.download = \`generated-\${this._selectedType}-\${Date.now()}.mp3\`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        Utils.toast('Downloading audio file! 📥', 'success');
    }
};
