/**
 * AI Prompt Studio — Utility Functions
 * Refactored: Unified Prompt Generation Core, Auto default support
 */
const Utils = {
    // DOM helpers
    $(selector) {
        return document.querySelector(selector);
    },
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    createElement(tag, attrs = {}, children = '') {
        const el = document.createElement(tag);
        Object.entries(attrs).forEach(([key, val]) => {
            if (key === 'className') el.className = val;
            else if (key === 'innerHTML') el.innerHTML = val;
            else if (key === 'textContent') el.textContent = val;
            else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
            else if (key === 'dataset') Object.entries(val).forEach(([dk, dv]) => el.dataset[dk] = dv);
            else if (key === 'style' && typeof val === 'object') Object.assign(el.style, val);
            else el.setAttribute(key, val);
        });
        if (typeof children === 'string') el.innerHTML = children;
        else if (children instanceof Node) el.appendChild(children);
        else if (Array.isArray(children)) children.forEach(c => {
            if (c instanceof Node) el.appendChild(c);
            else if (typeof c === 'string') el.innerHTML += c;
        });
        return el;
    },

    // Toast notifications
    toast(message, type = 'info') {
        const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
        const container = document.getElementById('toast-container');
        const toast = this.createElement('div', { className: `toast ${type}` }, `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `);
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.toast('Copied to clipboard!', 'success');
        } catch {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            this.toast('Copied to clipboard!', 'success');
        }
    },

    // Export prompt
    exportPrompt(prompt, format) {
        if (!prompt) return;
        let content, filename, mime;
        if (format === 'json') {
            content = JSON.stringify(prompt, null, 2);
            filename = `prompt-${prompt.id || 'export'}.json`;
            mime = 'application/json';
        } else if (format === 'markdown') {
            content = `# ${prompt.title || 'Generated Prompt'}\n\n`;
            content += `**Module:** ${prompt.module}\n`;
            content += `**Model:** ${prompt.model || 'N/A'}\n`;
            content += `**Created:** ${new Date(prompt.createdAt || Date.now()).toLocaleDateString()}\n\n`;
            content += `---\n\n${prompt.content}`;
            filename = `prompt-${prompt.id || 'export'}.md`;
            mime = 'text/markdown';
        } else {
            content = prompt.content;
            filename = `prompt-${prompt.id || 'export'}.txt`;
            mime = 'text/plain';
        }
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.toast(`Exported as ${format.toUpperCase()}`, 'success');
    },

    // Typing animation for output
    async typeText(element, text, speed = 12) {
        element.textContent = '';
        element.classList.add('has-content');
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            if (i % 3 === 0) {
                await new Promise(r => setTimeout(r, speed));
                element.scrollTop = element.scrollHeight;
            }
        }
    },

    // Format date
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        return date.toLocaleDateString();
    },

    // Generate select options HTML
    optionsHTML(options, selected) {
        return options.map(opt => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            return `<option value="${val}" ${val === selected ? 'selected' : ''}>${label}</option>`;
        }).join('');
    },

    /**
     * Chip group HTML with Auto first option.
     * When defaultValue is null, Auto is selected.
     * "Auto" chip always has data-value="Auto".
     */
    chipGroupHTML(options, defaultValue, name) {
        const isAuto = !defaultValue || defaultValue === 'Auto';
        return `<div class="chip-group" data-name="${name}">
      <button class="chip chip-auto ${isAuto ? 'active' : ''}" data-value="Auto">Auto</button>
      ${options.map(opt => `
        <button class="chip ${opt === defaultValue ? 'active' : ''}" data-value="${opt}">${opt}</button>
      `).join('')}
    </div>`;
    },

    /** Multi-select chip group with optional Auto */
    chipMultiHTML(options, selectedValues = [], name) {
        return `<div class="chip-group chip-multi" data-name="${name}">
      ${options.map(opt => `
        <button class="chip ${selectedValues.includes(opt) ? 'active' : ''}" data-value="${opt}">${opt}</button>
      `).join('')}
    </div>`;
    },

    /**
     * Toggle switch HTML helper
     * @param {string} id - Element ID
     * @param {string} labelOff - Label for off state
     * @param {string} labelOn - Label for on state
     * @param {boolean} checked - Initial state
     */
    toggleSwitchHTML(id, labelOff, labelOn, checked = false) {
        return `<div class="toggle-switch-wrapper">
      <span class="toggle-label ${!checked ? 'active' : ''}">${labelOff}</span>
      <label class="toggle-switch" for="${id}">
        <input type="checkbox" id="${id}" ${checked ? 'checked' : ''} />
        <span class="toggle-slider"></span>
      </label>
      <span class="toggle-label ${checked ? 'active' : ''}">${labelOn}</span>
    </div>`;
    },

    /**
     * Init chip groups: clicking a non-Auto chip deselects Auto.
     * Clicking Auto deselects all others. Clicking active non-Auto chip
     * deselects it and re-activates Auto (no forced selection).
     */
    initChips(container) {
        container.querySelectorAll('.chip-group:not(.chip-multi)').forEach(group => {
            group.querySelectorAll('.chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    const autoChip = group.querySelector('.chip-auto');
                    if (chip.classList.contains('chip-auto')) {
                        // Click Auto → deselect everything, activate Auto
                        group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                        chip.classList.add('active');
                    } else if (chip.classList.contains('active')) {
                        // Click active chip → deselect, revert to Auto
                        chip.classList.remove('active');
                        if (autoChip) autoChip.classList.add('active');
                    } else {
                        // Click non-auto chip → select it, deselect others
                        group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                        chip.classList.add('active');
                    }
                });
            });
        });
        container.querySelectorAll('.chip-group.chip-multi').forEach(group => {
            group.querySelectorAll('.chip').forEach(chip => {
                chip.addEventListener('click', () => chip.classList.toggle('active'));
            });
        });
    },

    // Model selector (supports Auto = no model selected)
    initModelSelector(container) {
        container.querySelectorAll('.model-selector').forEach(group => {
            group.querySelectorAll('.model-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    group.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        });
    },

    /**
     * Get selected chip value. Returns null if Auto is selected.
     */
    getChipValue(container, name) {
        const chip = container.querySelector(`.chip-group[data-name="${name}"] .chip.active`);
        if (!chip) return null;
        return chip.dataset.value === 'Auto' ? null : chip.dataset.value;
    },

    getChipValues(container, name) {
        const chips = container.querySelectorAll(`.chip-group[data-name="${name}"] .chip.active`);
        return Array.from(chips).map(c => c.dataset.value).filter(v => v !== 'Auto');
    },

    getSelectedModel(container) {
        const btn = container.querySelector('.model-selector .model-btn.active');
        return btn ? btn.dataset.value : null;
    },

    // Debounce
    debounce(fn, ms = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), ms);
        };
    },

    // Escape HTML
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};


/* =====================================================================
   PROMPT CORE — Unified Prompt Generation Engine
   =====================================================================
   Architecture:
     1. Each module builds a structured JSON config
     2. Config is sent to PromptCore.generate(config)
     3. PromptCore normalizes settings (Auto → smart defaults)
     4. PromptCore routes to module-specific builder
     5. Builder returns model-formatted prompt string

   Config shape:
   {
     module: 'designers' | 'developers' | 'writers' | ...,
     model: 'GPT' | 'Claude' | ... | null (auto),
     settings: { ... module-specific key/values, null = auto },
     context: { text?, images?, file? }   // optional rich context
   }
   ===================================================================== */

const PromptCore = {
    /**
     * Main entry point — all modules call this.
     * @param {Object} config - Structured input from module
     * @returns {string} Formatted prompt
     */
    generate(config) {
        const { module, model, settings = {}, context = {} } = config;

        // Normalize: replace null/undefined with smart Auto defaults
        const normalized = this._normalize(module, settings);
        const resolvedModel = model || this._autoModel(module);

        // Route to module builder
        const builders = {
            optimizer: this._buildOptimizer,
            carousel: this._buildCarousel,
            designers: this._buildDesigner,
            developers: this._buildDeveloper,
            writers: this._buildWriter,
            writers_presentation: this._buildPresentation,
            video: this._buildVideo,
            analysts: this._buildAnalyst,
            marketers: this._buildMarketer,
            researchers: this._buildResearcher,
        };

        const builder = builders[module];
        if (!builder) return 'Unknown module. Please select a valid module.';

        return builder.call(this, resolvedModel, normalized, context);
    },

    /** Smart default model per module */
    _autoModel(module) {
        const defaults = {
            optimizer: 'GPT',
            carousel: 'GPT',
            designers: 'GPT',
            developers: 'GPT',
            writers: 'GPT',
            writers_presentation: 'GPT',
            video: 'GPT',
            analysts: 'GPT',
            marketers: 'GPT',
            researchers: 'GPT',
        };
        return defaults[module] || 'GPT';
    },

    /**
     * Normalize settings — fill nulls with sensible generalized defaults.
     * This is the "Auto" magic: if the user selects nothing, we provide
     * a balanced, generic value that produces a versatile prompt.
     */
    _normalize(module, raw) {
        const s = { ...raw };
        const defaults = {
            optimizer: {},
            carousel: {
                platform: 'Instagram',
                contentType: 'Educational',
                slideCount: 'Auto (5-8)',
            },
            designers: {
                imageType: 'versatile composition',
                mood: 'balanced and visually compelling',
                time: 'natural lighting',
                style: 'high-quality, adaptable',
                outputMode: 'prompt',
            },
            developers: {
                productType: 'web application',
                techStack: 'modern full-stack',
                codeLevel: 'production-ready',
                outputType: 'Code',
            },
            writers: {
                action: 'Improve and enhance',
                contentType: 'general content',
                tone: 'professional yet approachable',
                framework: null,
            },
            writers_presentation: {
                presentationType: 'versatile business presentation',
                slideCount: 'Auto (AI decides optimal count)',
                tone: 'professional',
            },
            video: {
                videoType: 'versatile video format',
                scriptStyle: 'engaging and clear',
                visualStyle: 'polished, modern',
                mood: 'dynamic',
            },
            analysts: {
                analysisType: 'Comprehensive Analysis',
            },
            marketers: {
                campaignType: 'multi-objective campaign',
                funnelStage: 'full-funnel',
                platform: 'cross-platform',
                outputType: 'Campaign',
            },
            researchers: {
                researchType: 'Research Outline',
                academicTone: 'formal',
                field: 'interdisciplinary',
            },
        };

        const moduleDefs = defaults[module] || {};
        Object.keys(moduleDefs).forEach(key => {
            if (s[key] === null || s[key] === undefined || s[key] === '') {
                s[key] = moduleDefs[key];
            }
        });
        return s;
    },

    /**
     * Helper: conditionally add a line if a value is non-null/non-auto
     */
    _line(label, value, fallback) {
        const v = value || fallback;
        return v ? `- ${label}: ${v}` : '';
    },

    /** Join non-empty lines */
    _join(...lines) {
        return lines.filter(Boolean).join('\n');
    },

    /* ================================================================
       MODULE BUILDERS — each returns a model-formatted prompt string
       ================================================================ */

    _buildOptimizer(model, s, ctx) {
        return this._join(
            `You are a Prompt Engineering Expert.`,
            `Your task is to take the following raw prompt, and enhance it using best practices.`,
            `Structure the final output with a clear Persona/Role, Objective, Context, Formatting constraints, and Tone.`,
            ``,
            `--- RAW PROMPT ---`,
            ctx.text || 'No raw prompt provided.',
            `--- END RAW PROMPT ---`,
            ``,
            `Provide only the optimized, ready-to-use prompt.`
        );
    },

    _buildCarousel(model, s, ctx) {
        return this._join(
            `You are an expert Social Media Strategist and Carousel Designer.`,
            ``,
            `Project Brief:`,
            this._line('Platform', s.platform),
            this._line('Content Type', s.contentType),
            this._line('Slide Count', s.slideCount),
            ctx.text ? this._line('Topic', ctx.text) : '',
            ``,
            `Generate the following assets:`,
            ``,
            `1. Cover Slide (Hook): Headline text and visual concept.`,
            `2. Content Slides: Concise, punchy text and visual layout idea per slide.`,
            `3. CTA Slide: Final call to action slide.`,
            `4. Caption & Hashtags: Optimized caption formatted for ${s.platform}.`,
            ``,
            `Ensure the copy is highly engaging, fits within the character limits of ${s.platform} image carousels, and drives retention/saves.`
        );
    },

    _buildDesigner(model, s, ctx) {
        const hasImages = ctx.images && ctx.images.length > 0;
        const hasText = ctx.text && ctx.text.trim().length > 0;
        const isImageGen = s.outputMode === 'image';

        // Build base description
        let desc = `Create a ${s.imageType} image with a ${s.mood} atmosphere during ${s.time}. Style: ${s.style}.`;
        if (hasText) desc += ` Creative direction: ${ctx.text.trim()}.`;
        if (hasImages) desc += ` Reference ${ctx.images.length} uploaded image(s) for composition, color, and mood guidance.`;
        desc += ' The result should be visually striking with professional-grade quality.';

        // GPT Image Generation mode
        if (isImageGen && (model === 'GPT' || model === 'DALL-E')) {
            return this._join(
                `[DALL-E / GPT Image Generation]`,
                ``,
                desc,
                ``,
                `Requirements:`,
                `- Generate a high-fidelity image matching the above description`,
                `- Aspect ratio: ${s.imageType === 'landscape' || s.imageType === 'Landscape' ? 'landscape (16:9)' : s.imageType === 'portrait' || s.imageType === 'Portrait' ? 'portrait (9:16)' : 'square (1:1)'}`,
                `- Quality: HD`,
                `- Style: ${s.style}`,
                hasText ? `\nAdditional creative notes:\n${ctx.text}` : '',
            );
        }

        if (model === 'Midjourney') {
            const ar = s.imageType.toLowerCase().includes('landscape') ? '16:9' : s.imageType.toLowerCase().includes('portrait') ? '9:16' : '1:1';
            return this._join(
                desc,
                ``,
                `--ar ${ar} --style raw --v 6.1 --q 2`,
                ``,
                `Additional details:`,
                this._line('Lighting', s.time),
                this._line('Mood', s.mood),
                `- Focus on composition, depth of field, and color harmony`,
                `- Ultra-high resolution, 8K quality`,
                hasText ? `\nCreative direction: ${ctx.text}` : '',
            );
        }

        if (model === 'Stable Diffusion') {
            return this._join(
                `Positive prompt:`,
                `${desc}, masterpiece, best quality, ultra-detailed, 8k resolution, professional photography, ${s.style} style`,
                ``,
                `Negative prompt:`,
                `lowres, bad anatomy, bad hands, text, error, missing fingers, cropped, worst quality, low quality, jpeg artifacts, blurry`,
                ``,
                `Recommended settings:`,
                `- Steps: 30-50`,
                `- CFG Scale: 7-9`,
                `- Sampler: DPM++ 2M Karras`,
                `- Size: 1024x1024`,
                hasText ? `\nCreative direction: ${ctx.text}` : '',
            );
        }

        if (model === 'Leonardo') {
            return this._join(
                `[Leonardo AI Prompt]`,
                ``,
                desc,
                ``,
                `Model: Leonardo Diffusion XL`,
                `Preset: ${s.style.toLowerCase().includes('cinematic') ? 'Cinematic' : 'Dynamic'}`,
                `Guidance Scale: 7`,
                `Dimensions: ${s.imageType.toLowerCase().includes('landscape') ? '1360x768' : '768x1360'}`,
                ``,
                `Style modifiers: ${s.mood}, ${s.style}, professional grade, trending on artstation`,
                hasText ? `\nCreative direction: ${ctx.text}` : '',
            );
        }

        if (model === 'Runway') {
            return this._join(
                `[Runway Gen-3 Alpha Prompt]`,
                ``,
                `Scene: ${s.imageType} shot`,
                this._line('Mood', s.mood),
                this._line('Time of Day', s.time),
                this._line('Visual Style', s.style),
                ``,
                `Description:`,
                desc,
                ``,
                `Camera movement: Slow dolly forward with subtle parallax`,
                `Duration: 4 seconds`,
                `Aspect Ratio: 16:9`,
                hasText ? `\nCreative direction: ${ctx.text}` : '',
            );
        }

        // GPT / Claude / Gemini — descriptive brief
        return this._join(
            `You are an expert visual designer and art director.${isImageGen ? ' Generate an image based on the following brief:' : ' Generate a detailed creative brief for the following:'}`,
            ``,
            this._line('Image Type', s.imageType),
            this._line('Mood', s.mood),
            this._line('Time of Day', s.time),
            this._line('Visual Style', s.style),
            hasText ? this._line('Creative Direction', ctx.text) : '',
            hasImages ? `- Reference Images: ${ctx.images.length} image(s) provided — incorporate their visual language` : '',
            ``,
            isImageGen ? `Generate a high-quality image that precisely matches this brief.` :
                `Please provide:
1. A detailed description of the scene composition
2. Color palette (hex codes) that matches the mood
3. Lighting setup and direction
4. Camera angle and lens recommendation
5. Post-processing suggestions
6. Reference art style keywords

Make the output production-ready for a professional photo/art project.`,
        );
    },

    _buildDeveloper(model, s, ctx) {
        let prompt = this._join(
            `You are a senior full-stack software engineer.`,
            `Build a ${s.productType} using ${s.techStack}.`,
            ``,
            `Requirements:`,
            this._line('Code Level', s.codeLevel),
            this._line('Product Type', s.productType),
            this._line('Tech Stack', s.techStack),
        );

        const outputBlocks = {
            'Architecture': `
Generate a complete system architecture including:
1. High-level architecture diagram (described textually)
2. Service breakdown and responsibilities
3. Communication patterns (REST/GraphQL/gRPC)
4. Scalability considerations
5. Security layers
6. Deployment strategy (Docker, K8s, CI/CD)`,
            'Database': `
Design the complete database schema:
1. Entity-Relationship diagram (described textually)
2. Table definitions with columns, types, and constraints
3. Indexes and optimization strategy
4. Migration strategy
5. Seed data examples`,
            'API': `
Design the complete API structure:
1. RESTful endpoint definitions (method, path, description)
2. Request/Response schemas (JSON)
3. Authentication & authorization flow
4. Rate limiting strategy
5. Error handling patterns
6. API versioning approach`,
            'Code': `
Generate production-ready code with:
1. Project structure and file organization
2. Core component/module implementations
3. State management setup
4. Routing configuration
5. Error handling and loading states
6. TypeScript types/interfaces
7. Unit test examples

Follow ${s.codeLevel} coding standards with proper error handling, documentation, and best practices.`,
        };

        prompt += outputBlocks[s.outputType] || outputBlocks['Code'];

        if (ctx.text) prompt += `\n\nAdditional Requirements:\n${ctx.text}`;
        return prompt;
    },

    _buildWriter(model, s, ctx) {
        const action = s.action;
        const contentType = s.contentType;
        const tone = s.tone;
        const framework = s.framework;

        let prompt = this._join(
            `You are an expert content strategist and copywriter.`,
            ``,
            `Task: ${action} the following ${contentType} content.`,
            `Tone: ${tone}`,
        );

        if (framework && framework !== 'None') {
            const frameworks = {
                "Hero's Journey": `
Use the Hero's Journey framework:
1. Ordinary World → Present the reader's current situation
2. Call to Adventure → Introduce the challenge/opportunity
3. Crossing the Threshold → Show commitment to change
4. Tests & Allies → Share experiences and social proof
5. The Ordeal → Address the biggest challenge
6. The Reward → Reveal the transformation
7. Return → Call to action with newfound wisdom`,
                'AIDA': `
Use the AIDA framework:
1. Attention → Hook with a compelling opener
2. Interest → Build curiosity with relevant details
3. Desire → Create emotional connection
4. Action → Clear, compelling call-to-action`,
                'PAS': `
Use the PAS framework:
1. Problem → Identify and agitate the pain point
2. Agitate → Amplify the emotional impact
3. Solution → Present the resolution with clear benefits`,
            };
            prompt += frameworks[framework] || '';
        }

        if (action === 'SEO Optimize' || (action && action.toLowerCase().includes('seo'))) {
            prompt += `

SEO Requirements:
- Include primary keyword naturally 3-5 times
- Add semantic keywords and LSI terms
- Optimize meta title (60 chars) and description (160 chars)
- Use header hierarchy (H1, H2, H3)
- Add internal/external link suggestions
- Recommend schema markup`;
        }

        if (ctx.text) {
            prompt += `\n\nContent to ${action.toLowerCase()}:\n"""${ctx.text}"""`;
        }

        prompt += `\n\nOutput both:\n1. The optimized prompt (for reuse)\n2. The final ${contentType} content`;
        return prompt;
    },

    _buildPresentation(model, s, ctx) {
        const type = s.presentationType;
        const slides = s.slideCount;
        const tone = s.tone;

        let prompt = this._join(
            `You are an expert presentation designer and business communication specialist.`,
            ``,
            `Create a complete presentation package:`,
            ``,
            this._line('Presentation Type', type),
            this._line('Number of Slides', slides),
            this._line('Tone', tone),
            ctx.text ? this._line('Topic / Brief', ctx.text) : '',
            ``,
            `Generate the following:`,
            ``,
            `## 1. Slide Outline`,
            `List every slide with its title and purpose (e.g., "Slide 1: Title Slide — Hook the audience").`,
            ``,
            `## 2. Slide Content`,
            `For each slide provide:`,
            `- Headline`,
            `- 3-5 bullet points of key content`,
            `- Suggested visual/graphic description`,
            `- Transition recommendation`,
            ``,
            `## 3. Speaker Notes`,
            `For each slide, write detailed speaker notes including:`,
            `- Talking points and timing (seconds)`,
            `- Audience engagement cues`,
            `- Potential Q&A prompts`,
            ``,
            `## 4. Full Presentation Script`,
            `Write a continuous, polished script that could be read as a speech, covering all slides in order.`,
            ``,
            `Formatting:`,
            `- Use clear section headers`,
            `- Keep bullets concise (under 10 words each)`,
            `- Speaker notes should feel conversational yet ${tone}`,
        );

        return prompt;
    },

    _buildVideo(model, s, ctx) {
        return this._join(
            `You are an expert video producer and scriptwriter.`,
            ``,
            `Project Brief:`,
            this._line('Video Type', s.videoType),
            this._line('Script Style', s.scriptStyle),
            this._line('Visual Style', s.visualStyle),
            this._line('Mood', s.mood),
            ctx.text ? this._line('Topic', ctx.text) : '',
            ``,
            `Generate the complete production package:`,
            ``,
            `## 1. Full Script`,
            `Write a complete script with dialogue/narration, timing markers, and emotional beats.`,
            ``,
            `## 2. Scene Breakdown`,
            `For each scene provide:`,
            `- Scene number and duration`,
            `- Setting/location description`,
            `- Characters/subjects on screen`,
            `- Key action/movement`,
            `- Transition type`,
            ``,
            `## 3. Shot List`,
            `For each shot specify:`,
            `- Shot type (wide, medium, close-up, etc.)`,
            `- Camera movement (static, pan, tilt, dolly, etc.)`,
            `- Duration`,
            `- Notes on framing and composition`,
            ``,
            `## 4. Voice-Over Script`,
            `- Clean narration text with timing cues`,
            `- Tone and pacing notes`,
            `- Emphasis markings on key phrases`,
            ``,
            `## 5. Music & Sound Design Notes`,
            `- Recommended music genre/mood per section`,
            `- Sound effect cues`,
            `- Silence/pause moments`,
            ``,
            `Format: ${s.videoType.toLowerCase().includes('reel') ? '9:16 / 15-60 seconds' : s.videoType.toLowerCase().includes('youtube') ? '16:9 / 8-15 minutes' : '16:9 / variable length'}`,
        );
    },

    _buildAnalyst(model, s, ctx) {
        const analysisType = s.analysisType;

        let prompt = this._join(
            `You are a senior data analyst and business intelligence expert.`,
            ``,
            this._line('Analysis Type', analysisType),
            ctx.text ? `\nData Description:\n${ctx.text}` : '',
        );

        const blocks = {
            'Data Summary': `
Provide a comprehensive data summary including:
1. Key statistics (mean, median, mode, std dev)
2. Data distribution overview
3. Missing value analysis
4. Outlier detection
5. Data quality assessment
6. Key observations and takeaways`,
            'Insight Extraction': `
Extract actionable insights:
1. Top 5 key findings from the data
2. Correlation analysis between variables
3. Anomaly identification
4. Segment analysis
5. Recommendations based on findings`,
            'Trend Detection': `
Perform trend analysis:
1. Time-series pattern identification
2. Seasonal/cyclical patterns
3. Growth rate calculations
4. Trend direction and strength
5. Inflection points
6. Forecast for next period`,
            'Predictive Analysis': `
Build a predictive analysis framework:
1. Variable selection and feature importance
2. Model recommendation (regression, classification, time-series)
3. Expected accuracy metrics
4. Key predictive factors
5. Risk assessment
6. Confidence intervals`,
            'Report': `
Generate a professional business report:
1. Executive Summary
2. Key Metrics Dashboard description
3. Detailed Analysis Sections
4. Visualizations recommendations (chart types)
5. Conclusions
6. Actionable Recommendations
7. Appendix with methodology`,
            'Comprehensive Analysis': `
Perform a comprehensive analysis covering:
1. Data summary with key statistics
2. Distribution and quality assessment
3. Pattern and trend identification
4. Actionable insights and recommendations
5. Suggested visualizations
6. Next steps for deeper analysis`,
        };

        prompt += blocks[analysisType] || blocks['Comprehensive Analysis'];
        return prompt;
    },

    _buildMarketer(model, s, ctx) {
        let prompt = this._join(
            `You are a senior digital marketing strategist.`,
            ``,
            `Campaign Brief:`,
            this._line('Campaign Type', s.campaignType),
            this._line('Funnel Stage', s.funnelStage),
            this._line('Platform', s.platform),
            this._line('Target Audience', s.persona || ctx.text),
            s.product ? this._line('Product/Service', s.product) : '',
        );

        const blocks = {
            'Ad Copy': `
Generate 5 high-converting ad copy variations:
- Each with a hook, body, and CTA
- A/B test variations for headlines
- Character limits optimized for ${s.platform}
- Include emoji usage recommendations
- Power words and urgency triggers`,
            'Hooks': `
Generate 10 scroll-stopping hooks:
- Pattern interrupt hooks
- Question hooks
- Story hooks
- Stat/data hooks
- Controversial hooks
Each should be under 10 words and optimized for ${s.platform}`,
            'Funnel': `
Design a complete marketing funnel:
1. Awareness Stage: Content and ad strategy
2. Interest Stage: Lead magnets and nurture sequence
3. Consideration Stage: Social proof and case studies
4. Decision Stage: Offer optimization and urgency
5. Retention Stage: Post-purchase engagement

Include specific content pieces, email sequences, and ad creatives for each stage.`,
            'Campaign': `
Generate a complete campaign strategy:
1. Campaign objective and KPIs
2. Audience targeting parameters
3. Creative direction and messaging
4. Content calendar (2 weeks)
5. Budget allocation recommendations
6. A/B testing plan`,
        };

        prompt += blocks[s.outputType] || blocks['Campaign'];
        if (ctx.text && !s.persona) prompt += `\n\nAdditional context: ${ctx.text}`;
        return prompt;
    },

    _buildResearcher(model, s, ctx) {
        let prompt = this._join(
            `You are an expert academic researcher and scholar.`,
            ``,
            this._line('Field', s.field),
            this._line('Tone', s.academicTone),
            ctx.text ? this._line('Topic', ctx.text) : '',
        );

        const blocks = {
            'Research Outline': `
Generate a comprehensive research outline:
1. Title and Abstract
2. Research Questions (3-5)
3. Literature Review Framework
   - Key theories and frameworks
   - Seminal works to reference
   - Research gaps identified
4. Methodology
   - Research design
   - Data collection methods
   - Analysis approach
5. Expected Contributions
6. Timeline and milestones
7. Potential limitations`,
            'Literature Review': `
Generate a structured literature review prompt:
1. Define the scope and boundaries
2. Identify key themes and categories
3. Chronological development of the field
4. Current state of knowledge
5. Methodological approaches used
6. Conflicting findings and debates
7. Research gaps and future directions
8. Synthesis and critical evaluation framework`,
            'Hypothesis': `
Develop research hypotheses:
1. Primary hypothesis (H1)
2. Alternative hypotheses (H2-H4)
3. Null hypothesis
4. Variables identification
   - Independent variables
   - Dependent variables
   - Control variables
5. Theoretical basis for each hypothesis
6. Testability assessment
7. Expected outcomes
8. Statistical tests recommended`,
            'Abstract': `
Generate a publication-ready abstract:
1. Background context (2-3 sentences)
2. Research gap/problem statement
3. Methodology summary
4. Key findings
5. Implications and significance
6. Keywords (5-8)

Follow APA/IEEE formatting guidelines.
Word limit: 250-300 words.`,
        };

        prompt += blocks[s.researchType] || blocks['Research Outline'];
        return prompt;
    },
};

// Backward compatibility — old PromptEngine calls still work
const PromptEngine = {
    generate(module, model, settings) {
        return PromptCore.generate({ module, model, settings, context: { text: settings.inputText || settings.requirements || settings.topic || settings.dataDescription || '' } });
    }
};
