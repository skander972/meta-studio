// Main application logic, state sync, preview renderers, and SEO auditor
import { CanvasDesigner } from './canvas-designer.js';
import { PRESETS } from './presets.js';
import { 
  generateHtmlHead, 
  generateNextJs, 
  generateAstro, 
  generateNuxt, 
  generateSvelteKit, 
  generateJsonLd 
} from './templates-code.js';

// Default state
const defaultState = {
  title: 'DevScale — The Zero-Config Cloud Platform for Teams',
  description: 'Deploy web applications, microservices, and static sites with instantaneous rollbacks, continuous previews, and zero devops overhead.',
  canonicalUrl: 'https://devscale.io',
  siteName: 'DevScale Cloud',
  author: 'Sarah Lin',
  twitterHandle: '@devscale',
  twitterCard: 'summary_large_image',
  ogType: 'website',
  imageUrl: '',
  themeColor: '#4f46e5',
  keywords: 'cloud hosting, continuous deployment, devops, edge computing',
  locale: 'en_US',
  cardBadge: 'NOW IN PUBLIC BETA',
  presetId: 'modern-saas',
  showWatermark: true,
  customBg: false,
  customColor1: '#0f172a',
  customColor2: '#312e81'
};

class MetaStudioApp {
  constructor() {
    this.state = { ...defaultState };
    this.designer = null;
    this.currentCodeTab = 'html';
    this.currentPreviewTab = 'twitter';

    this.init();
  }

  init() {
    // 1. Initialize Canvas Designer
    const canvasEl = document.getElementById('ogCanvas');
    if (canvasEl) {
      this.designer = new CanvasDesigner(canvasEl);
    }

    // 2. Load state from URL hash if present
    this.loadStateFromHash();

    // 3. Render Presets selector in DOM
    this.renderPresetSelector();

    // 4. Bind DOM inputs and events
    this.bindInputs();
    this.bindActionButtons();
    this.bindTabs();

    // 5. Initial sync & render
    this.syncDesignerWithState();
    this.updateAllPreviews();
    this.updateCodeExport();
    this.runAudit();
  }

  renderPresetSelector() {
    const container = document.getElementById('presetList');
    if (!container) return;

    container.innerHTML = PRESETS.map(preset => {
      const isSelected = preset.id === this.state.presetId;
      return `
        <button 
          type="button"
          data-preset-id="${preset.id}"
          class="preset-card text-left p-3 rounded-xl border transition-all text-xs font-medium flex items-center justify-between ${
            isSelected 
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-sm ring-1 ring-indigo-500' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
          }"
        >
          <div class="flex items-center gap-2.5">
            <span class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600" style="background: ${
              preset.bgType === 'solid' ? preset.bgColor : preset.bgGradient.stops[1].color
            }"></span>
            <span>${preset.name}</span>
          </div>
          ${isSelected ? '<span class="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>' : ''}
        </button>
      `;
    }).join('');

    // Attach click events
    container.querySelectorAll('[data-preset-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-preset-id');
        this.state.presetId = id;
        this.renderPresetSelector();
        this.syncDesignerWithState();
      });
    });
  }

  bindInputs() {
    const fieldIds = [
      'title', 'description', 'canonicalUrl', 'siteName', 
      'author', 'twitterHandle', 'twitterCard', 'ogType', 
      'imageUrl', 'themeColor', 'keywords', 'locale',
      'cardBadge', 'customColor1', 'customColor2'
    ];

    fieldIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      // Populate initial values
      if (this.state[id] !== undefined) {
        el.value = this.state[id];
      }

      el.addEventListener('input', () => {
        this.state[id] = el.value;
        this.onStateChange(id);
      });
    });

    // Watermark checkbox
    const watermarkEl = document.getElementById('showWatermark');
    if (watermarkEl) {
      watermarkEl.checked = this.state.showWatermark;
      watermarkEl.addEventListener('change', () => {
        this.state.showWatermark = watermarkEl.checked;
        this.syncDesignerWithState();
      });
    }

    // Logo image upload
    const logoInput = document.getElementById('logoUpload');
    if (logoInput) {
      logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            this.designer.setLogo(img);
            this.updateAllPreviews();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
  }

  bindActionButtons() {
    // Download Banner PNG
    const downloadBtn = document.getElementById('downloadBannerBtn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', async () => {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = 'Generating...';
        await this.designer.downloadImage('og-social-card.png');
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<span>⬇ Download 1200x630 PNG</span>';
        this.showToast('PNG image downloaded successfully!');
      });
    }

    // Copy Canvas Image to Clipboard
    const copyImgBtn = document.getElementById('copyImageBtn');
    if (copyImgBtn) {
      copyImgBtn.addEventListener('click', async () => {
        try {
          await this.designer.copyToClipboard();
          this.showToast('Card image copied to clipboard!');
        } catch (e) {
          this.showToast('Clipboard copy failed. Try downloading instead.');
        }
      });
    }

    // "Use as OG Image" button
    const useAsOgBtn = document.getElementById('useAsOgBtn');
    if (useAsOgBtn) {
      useAsOgBtn.addEventListener('click', () => {
        const dataUrl = this.designer.getDataUrl();
        this.state.imageUrl = dataUrl;
        const imgInput = document.getElementById('imageUrl');
        if (imgInput) imgInput.value = '(Generated Card Image)';
        this.updateAllPreviews();
        this.updateCodeExport();
        this.runAudit();
        this.showToast('Design linked as active social card!');
      });
    }

    // Copy Code button
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener('click', () => {
        const codeBlock = document.getElementById('codeOutput');
        if (!codeBlock) return;
        navigator.clipboard.writeText(codeBlock.textContent).then(() => {
          this.showToast(`Copied ${this.currentCodeTab.toUpperCase()} code to clipboard!`);
        });
      });
    }

    // Share link button
    const shareBtn = document.getElementById('shareLinkBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.saveStateToHash();
        navigator.clipboard.writeText(window.location.href).then(() => {
          this.showToast('Shareable project URL copied to clipboard!');
        });
      });
    }

    // Demo Preset Buttons
    const demoSaasBtn = document.getElementById('demoSaas');
    if (demoSaasBtn) {
      demoSaasBtn.addEventListener('click', () => this.loadDemoPreset('saas'));
    }
    const demoBlogBtn = document.getElementById('demoBlog');
    if (demoBlogBtn) {
      demoBlogBtn.addEventListener('click', () => this.loadDemoPreset('blog'));
    }
    const demoOpenSourceBtn = document.getElementById('demoOpenSource');
    if (demoOpenSourceBtn) {
      demoOpenSourceBtn.addEventListener('click', () => this.loadDemoPreset('opensource'));
    }
  }

  bindTabs() {
    // Code tabs (HTML, Next.js, Astro, Nuxt, SvelteKit, JSON-LD)
    const codeTabBtns = document.querySelectorAll('[data-code-tab]');
    codeTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-code-tab');
        this.currentCodeTab = tab;

        codeTabBtns.forEach(b => {
          b.classList.remove('bg-indigo-600', 'text-white', 'shadow');
          b.classList.add('text-slate-600', 'dark:text-slate-400', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');
        });
        btn.classList.add('bg-indigo-600', 'text-white', 'shadow');
        btn.classList.remove('text-slate-600', 'dark:text-slate-400', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');

        this.updateCodeExport();
      });
    });

    // Preview tabs (Twitter, Facebook, Discord, Google)
    const previewTabBtns = document.querySelectorAll('[data-preview-tab]');
    previewTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-preview-tab');
        this.currentPreviewTab = tab;

        previewTabBtns.forEach(b => {
          b.classList.remove('border-indigo-600', 'text-indigo-600', 'dark:text-indigo-400');
          b.classList.add('border-transparent', 'text-slate-500', 'hover:text-slate-700', 'dark:hover:text-slate-300');
        });
        btn.classList.add('border-indigo-600', 'text-indigo-600', 'dark:text-indigo-400');
        btn.classList.remove('border-transparent', 'text-slate-500');

        // Show/hide preview panels
        document.querySelectorAll('.preview-panel').forEach(p => p.classList.add('hidden'));
        const activePanel = document.getElementById(`preview-${tab}`);
        if (activePanel) activePanel.classList.remove('hidden');
      });
    });
  }

  onStateChange(field) {
    if (['title', 'description', 'cardBadge', 'canonicalUrl', 'author'].includes(field)) {
      this.syncDesignerWithState();
    }
    this.updateAllPreviews();
    this.updateCodeExport();
    this.runAudit();
  }

  syncDesignerWithState() {
    if (!this.designer) return;
    this.designer.setPreset(this.state.presetId);
    this.designer.updateData({
      title: this.state.title,
      subtitle: this.state.description,
      badge: this.state.cardBadge,
      domain: this.state.canonicalUrl ? this.extractHostname(this.state.canonicalUrl) : 'yourdomain.com',
      author: this.state.author,
      showWatermark: this.state.showWatermark
    });

    // If no manual image URL, use designed canvas as default preview
    if (!this.state.imageUrl || this.state.imageUrl.startsWith('data:image')) {
      const dataUrl = this.designer.getDataUrl();
      this.updatePreviewImages(dataUrl);
    }
  }

  updateAllPreviews() {
    const domain = this.state.canonicalUrl ? this.extractHostname(this.state.canonicalUrl) : 'example.com';
    const displayImage = this.state.imageUrl && !this.state.imageUrl.startsWith('data:image') 
      ? this.state.imageUrl 
      : (this.designer ? this.designer.getDataUrl() : '');

    // 1. Twitter Card
    const twTitle = document.getElementById('twPreviewTitle');
    const twDesc = document.getElementById('twPreviewDesc');
    const twDomain = document.getElementById('twPreviewDomain');
    const twImg = document.getElementById('twPreviewImage');
    const twHandle = document.getElementById('twPreviewHandle');

    if (twTitle) twTitle.textContent = this.state.title || 'Page Title';
    if (twDesc) twDesc.textContent = this.state.description || 'Description snippet...';
    if (twDomain) twDomain.textContent = domain;
    if (twHandle) twHandle.textContent = this.state.twitterHandle || '@username';
    if (twImg) twImg.src = displayImage;

    // 2. Facebook / OpenGraph Card
    const fbTitle = document.getElementById('fbPreviewTitle');
    const fbDesc = document.getElementById('fbPreviewDesc');
    const fbDomain = document.getElementById('fbPreviewDomain');
    const fbImg = document.getElementById('fbPreviewImage');

    if (fbTitle) fbTitle.textContent = this.state.title || 'Page Title';
    if (fbDesc) fbDesc.textContent = this.state.description || 'Description snippet...';
    if (fbDomain) fbDomain.textContent = domain.toUpperCase();
    if (fbImg) fbImg.src = displayImage;

    // 3. Discord Embed
    const dcTitle = document.getElementById('dcPreviewTitle');
    const dcDesc = document.getElementById('dcPreviewDesc');
    const dcSite = document.getElementById('dcPreviewSite');
    const dcImg = document.getElementById('dcPreviewImage');

    if (dcTitle) dcTitle.textContent = this.state.title || 'Page Title';
    if (dcDesc) dcDesc.textContent = this.state.description || 'Description snippet...';
    if (dcSite) dcSite.textContent = this.state.siteName || domain;
    if (dcImg) dcImg.src = displayImage;

    // 4. Google SERP Snippet
    const serpTitle = document.getElementById('serpPreviewTitle');
    const serpDesc = document.getElementById('serpPreviewDesc');
    const serpUrl = document.getElementById('serpPreviewUrl');
    const serpSite = document.getElementById('serpPreviewSite');

    if (serpTitle) serpTitle.textContent = this.state.title || 'Page Title';
    if (serpDesc) serpDesc.textContent = this.state.description || 'Description snippet...';
    if (serpUrl) serpUrl.textContent = this.state.canonicalUrl || 'https://example.com';
    if (serpSite) serpSite.textContent = this.state.siteName || domain;
  }

  updatePreviewImages(dataUrl) {
    ['twPreviewImage', 'fbPreviewImage', 'dcPreviewImage'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.src = dataUrl;
    });
  }

  updateCodeExport() {
    const codeBlock = document.getElementById('codeOutput');
    if (!codeBlock) return;

    let output = '';
    const exportData = {
      ...this.state,
      imageUrl: this.state.imageUrl.startsWith('data:image') ? 'https://yourdomain.com/og-image.png' : (this.state.imageUrl || 'https://yourdomain.com/og-image.png')
    };

    switch (this.currentCodeTab) {
      case 'html':
        output = generateHtmlHead(exportData);
        break;
      case 'nextjs':
        output = generateNextJs(exportData);
        break;
      case 'astro':
        output = generateAstro(exportData);
        break;
      case 'nuxt':
        output = generateNuxt(exportData);
        break;
      case 'sveltekit':
        output = generateSvelteKit(exportData);
        break;
      case 'jsonld':
        output = generateJsonLd(exportData);
        break;
      default:
        output = generateHtmlHead(exportData);
    }

    codeBlock.textContent = output;
  }

  runAudit() {
    const auditList = document.getElementById('auditList');
    const scoreBadge = document.getElementById('auditScore');
    if (!auditList) return;

    const checks = [];

    // Title length check (ideal 50 - 60 chars)
    const titleLen = (this.state.title || '').length;
    if (titleLen === 0) {
      checks.push({ status: 'error', label: 'Meta Title is missing', tip: 'Add a title (50-60 chars).' });
    } else if (titleLen < 30) {
      checks.push({ status: 'warning', label: `Title is short (${titleLen}/60 chars)`, tip: 'Expand to 50-60 characters for maximum search CTR.' });
    } else if (titleLen > 60) {
      checks.push({ status: 'warning', label: `Title exceeds 60 chars (${titleLen}/60)`, tip: 'Search engines will truncate this on SERP.' });
    } else {
      checks.push({ status: 'success', label: `Optimal Title length (${titleLen}/60 chars)`, tip: 'Perfect for Google and social previews.' });
    }

    // Description length check (ideal 120 - 160 chars)
    const descLen = (this.state.description || '').length;
    if (descLen === 0) {
      checks.push({ status: 'error', label: 'Meta Description is missing', tip: 'Add a compelling description (120-160 chars).' });
    } else if (descLen < 70) {
      checks.push({ status: 'warning', label: `Description is short (${descLen}/160 chars)`, tip: 'Include secondary keywords and a clear call to action.' });
    } else if (descLen > 160) {
      checks.push({ status: 'warning', label: `Description exceeds 160 chars (${descLen}/160)`, tip: 'May get cut off on mobile search engines.' });
    } else {
      checks.push({ status: 'success', label: `Optimal Description length (${descLen}/160 chars)`, tip: 'Crisp summary that fits all viewports.' });
    }

    // Canonical URL check
    if (!this.state.canonicalUrl) {
      checks.push({ status: 'error', label: 'Canonical URL is missing', tip: 'Avoid duplicate content penalties by specifying canonical.' });
    } else if (!this.state.canonicalUrl.startsWith('https://')) {
      checks.push({ status: 'warning', label: 'Canonical URL should use HTTPS', tip: 'Always point canonical tags to the secure protocol.' });
    } else {
      checks.push({ status: 'success', label: 'Valid HTTPS Canonical URL', tip: 'Search engines will index your preferred domain.' });
    }

    // Social Image check
    const hasImage = this.state.imageUrl || this.designer;
    if (!hasImage) {
      checks.push({ status: 'error', label: 'Open Graph Image is missing', tip: 'Social posts without images receive up to 70% fewer clicks.' });
    } else {
      checks.push({ status: 'success', label: '1200x630 Social Card Configured', tip: 'Ready for crisp display on X, LinkedIn, Facebook, and Discord.' });
    }

    // Twitter Handle check
    if (!this.state.twitterHandle) {
      checks.push({ status: 'warning', label: 'Twitter Handle missing', tip: 'Adding @username gives you author attribution when shared.' });
    } else {
      checks.push({ status: 'success', label: `Twitter creator attribution set (${this.state.twitterHandle})`, tip: 'Correct attribution setup.' });
    }

    // Calculate score
    const totalChecks = checks.length;
    const passed = checks.filter(c => c.status === 'success').length;
    const warnings = checks.filter(c => c.status === 'warning').length;
    const score = Math.round(((passed * 1) + (warnings * 0.5)) / totalChecks * 100);

    if (scoreBadge) {
      scoreBadge.textContent = `${score}%`;
      scoreBadge.className = `px-3 py-1 text-sm font-bold rounded-full ${
        score >= 80 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
        score >= 60 ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
        'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
      }`;
    }

    auditList.innerHTML = checks.map(c => `
      <div class="flex items-start gap-3 p-3 rounded-lg border ${
        c.status === 'success' ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50' :
        c.status === 'warning' ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50' :
        'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
      }">
        <span class="text-sm font-bold ${
          c.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
          c.status === 'warning' ? 'text-amber-600 dark:text-amber-400' :
          'text-rose-600 dark:text-rose-400'
        }">${c.status === 'success' ? '✓' : c.status === 'warning' ? '⚠' : '✕'}</span>
        <div>
          <div class="text-xs font-semibold text-slate-800 dark:text-slate-200">${c.label}</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400">${c.tip}</div>
        </div>
      </div>
    `).join('');
  }

  loadDemoPreset(type) {
    if (type === 'saas') {
      this.state = {
        ...this.state,
        title: 'HyperLog — Next-Gen High-Speed Log Analytics',
        description: 'Query billions of distributed event logs in milliseconds. Zero indexing cost, zero cluster configuration, and instant SQL support.',
        canonicalUrl: 'https://hyperlog.dev',
        siteName: 'HyperLog Analytics',
        author: 'Alex Vance',
        twitterHandle: '@hyperlog_dev',
        cardBadge: 'ENTERPRISE V2 RELEASE',
        presetId: 'modern-saas'
      };
    } else if (type === 'blog') {
      this.state = {
        ...this.state,
        title: '10 Architecture Patterns for Resilient Microservices in 2026',
        description: 'A deep dive into circuit breakers, idempotency keys, event sourcing, and zero-trust mesh networking with battle-tested benchmarks.',
        canonicalUrl: 'https://devdigest.com/posts/microservice-patterns-2026',
        siteName: 'DevDigest Engineering Blog',
        author: 'Marcus Rivera',
        twitterHandle: '@mrivera_dev',
        cardBadge: 'TECHNICAL GUIDE',
        presetId: 'dev-terminal',
        ogType: 'article'
      };
    } else if (type === 'opensource') {
      this.state = {
        ...this.state,
        title: 'FastCanvas — Tiny 3KB 2D Graphics Engine for Web',
        description: 'Blazing fast, GPU-accelerated drawing abstractions with zero dependencies. 100% test coverage and full TypeScript definitions.',
        canonicalUrl: 'https://github.com/oss/fastcanvas',
        siteName: 'FastCanvas OSS',
        author: 'Kira Tanaka',
        twitterHandle: '@fastcanvas_oss',
        cardBadge: 'MIT LICENSED',
        presetId: 'cyber-neon'
      };
    }

    // Refresh inputs
    Object.keys(this.state).forEach(key => {
      const el = document.getElementById(key);
      if (el) el.value = this.state[key];
    });

    this.renderPresetSelector();
    this.syncDesignerWithState();
    this.updateAllPreviews();
    this.updateCodeExport();
    this.runAudit();
    this.showToast(`Loaded ${type.toUpperCase()} template!`);
  }

  saveStateToHash() {
    try {
      const serialized = btoa(encodeURIComponent(JSON.stringify(this.state)));
      window.location.hash = serialized;
    } catch (e) {
      console.error('Failed to encode hash state', e);
    }
  }

  loadStateFromHash() {
    if (!window.location.hash || window.location.hash.length <= 1) return;
    try {
      const raw = window.location.hash.substring(1);
      const parsed = JSON.parse(decodeURIComponent(atob(raw)));
      this.state = { ...defaultState, ...parsed };
    } catch (e) {
      console.warn('Could not parse URL hash state', e);
    }
  }

  extractHostname(url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return url.replace(/^https?:\/\//, '').split('/')[0];
    }
  }

  showToast(message) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotification';
      toast.className = 'fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 transition-all transform duration-200 border border-slate-700 pointer-events-none opacity-0 translate-y-3';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>✓</span><span>${message}</span>`;
    toast.classList.remove('opacity-0', 'translate-y-3');
    toast.classList.add('opacity-100', 'translate-y-0');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'translate-y-3');
    }, 2800);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MetaStudioApp();
});
