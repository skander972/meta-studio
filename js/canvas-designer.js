// Canvas Social Card Designer Engine (1200 x 630 px)
import { PRESETS } from './presets.js';

export class CanvasDesigner {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    
    // Virtual resolution (standard OG image dimensions)
    this.width = 1200;
    this.height = 630;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.logoImage = null;
    this.currentPreset = PRESETS[0];

    this.options = {
      title: 'Supercharge Your Web Presence with MetaStudio',
      subtitle: 'The privacy-first, zero-cost social card creator & meta tag auditor.',
      badge: 'OPEN SOURCE UTILITY',
      domain: 'metastudio.dev',
      author: 'Jane Doe',
      presetId: 'modern-saas',
      showWatermark: true,
      customBgType: null, // 'solid', 'gradient'
      customColor1: '#0f172a',
      customColor2: '#312e81'
    };
  }

  setPreset(presetId) {
    const found = PRESETS.find(p => p.id === presetId);
    if (found) {
      this.currentPreset = found;
      this.options.presetId = presetId;
      this.render();
    }
  }

  updateData(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.render();
  }

  setLogo(image) {
    this.logoImage = image;
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const preset = this.currentPreset;
    const opts = this.options;

    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Background
    this.drawBackground(ctx, preset, opts);

    // 2. Draw Subtle Border / Terminal Chrome
    if (preset.layout === 'terminal') {
      this.drawTerminalChrome(ctx, preset);
    } else {
      ctx.strokeStyle = preset.cardBorder || 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(1, 1, this.width - 2, this.height - 2);
    }

    // 3. Layout Dimensions & Padding
    const paddingX = 80;
    let currentY = preset.layout === 'terminal' ? 120 : 90;

    // 4. Draw Badge
    if (opts.badge && opts.badge.trim() !== '') {
      currentY = this.drawBadge(ctx, opts.badge.toUpperCase(), paddingX, currentY, preset);
    }

    // 5. Draw Title
    currentY = this.drawTitle(ctx, opts.title || 'Untitled Page', paddingX, currentY, preset);

    // 6. Draw Subtitle / Description
    if (opts.subtitle && opts.subtitle.trim() !== '') {
      currentY = this.drawSubtitle(ctx, opts.subtitle, paddingX, currentY + 16, preset);
    }

    // 7. Draw Footer (Domain, Author, Logo, Watermark)
    this.drawFooter(ctx, paddingX, preset, opts);

    ctx.restore();
  }

  drawBackground(ctx, preset, opts) {
    if (opts.customBgType === 'solid') {
      ctx.fillStyle = opts.customColor1;
      ctx.fillRect(0, 0, this.width, this.height);
      return;
    }

    if (opts.customBgType === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
      grad.addColorStop(0, opts.customColor1);
      grad.addColorStop(1, opts.customColor2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);
      return;
    }

    if (preset.bgType === 'solid') {
      ctx.fillStyle = preset.bgColor;
      ctx.fillRect(0, 0, this.width, this.height);
    } else if (preset.bgType === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
      preset.bgGradient.stops.forEach(stop => {
        grad.addColorStop(stop.pos, stop.color);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // Optional decorative ambient glow in upper-right or lower-left
    if (preset.hasGlow) {
      const radialGlow = ctx.createRadialGradient(1000, 120, 20, 1000, 120, 480);
      radialGlow.addColorStop(0, hexToRgba(preset.glowColor, 0.35));
      radialGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // Decorative geometric grid lines
    ctx.save();
    ctx.strokeStyle = preset.textColor === '#ffffff' || preset.textColor === '#f8fafc' 
      ? 'rgba(255, 255, 255, 0.03)' 
      : 'rgba(0, 0, 0, 0.03)';
    ctx.lineWidth = 1;
    const step = 60;
    for (let x = 0; x < this.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawTerminalChrome(ctx, preset) {
    // Top terminal bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.width, 54);

    // Terminal buttons
    const colors = ['#ef4444', '#eab308', '#22c55e'];
    colors.forEach((col, idx) => {
      ctx.beginPath();
      ctx.arc(36 + (idx * 24), 27, 7, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    });

    // Window title
    ctx.font = '500 16px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('bash - 1200x630', this.width / 2, 33);
    ctx.textAlign = 'left';

    // Terminal border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, this.width - 2, this.height - 2);
  }

  drawBadge(ctx, text, x, y, preset) {
    ctx.save();
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    const metrics = ctx.measureText(text);
    const badgeW = metrics.width + 28;
    const badgeH = 34;
    const radius = 17;

    // Draw pill background
    ctx.fillStyle = preset.badgeBg || 'rgba(99, 102, 241, 0.2)';
    ctx.strokeStyle = preset.badgeBorder || '#6366f1';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(x, y, badgeW, badgeH, radius);
    ctx.fill();
    ctx.stroke();

    // Draw badge text
    ctx.fillStyle = preset.badgeText || '#818cf8';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 14, y + (badgeH / 2));
    ctx.restore();

    return y + badgeH + 28;
  }

  drawTitle(ctx, title, x, y, preset) {
    ctx.save();
    ctx.font = preset.titleFont;
    ctx.fillStyle = preset.textColor;
    ctx.textBaseline = 'top';

    const maxW = this.width - (x * 2);
    const lineHeight = 76;
    const maxLines = 3;

    const lines = this.wrapText(ctx, title, maxW);
    const renderLines = lines.slice(0, maxLines);
    if (lines.length > maxLines) {
      renderLines[maxLines - 1] += '...';
    }

    renderLines.forEach((line, index) => {
      ctx.fillText(line, x, y + (index * lineHeight));
    });

    ctx.restore();
    return y + (renderLines.length * lineHeight);
  }

  drawSubtitle(ctx, text, x, y, preset) {
    ctx.save();
    ctx.font = preset.descFont;
    ctx.fillStyle = preset.descColor;
    ctx.textBaseline = 'top';

    const maxW = this.width - (x * 2);
    const lineHeight = 44;
    const maxLines = 2;

    const lines = this.wrapText(ctx, text, maxW);
    const renderLines = lines.slice(0, maxLines);
    if (lines.length > maxLines) {
      renderLines[maxLines - 1] += '...';
    }

    renderLines.forEach((line, index) => {
      ctx.fillText(line, x, y + (index * lineHeight));
    });

    ctx.restore();
    return y + (renderLines.length * lineHeight);
  }

  drawFooter(ctx, x, preset, opts) {
    const bottomY = this.height - 70;

    ctx.save();
    // 1. Author and Domain info
    ctx.font = preset.metaFont;
    ctx.fillStyle = preset.accentColor;
    ctx.textBaseline = 'middle';

    let footerText = '';
    if (opts.domain) footerText += opts.domain.replace(/^https?:\/\//, '');
    if (opts.author) {
      footerText = footerText ? `${footerText} • by ${opts.author}` : `by ${opts.author}`;
    }

    ctx.fillText(footerText, x, bottomY);

    // 2. Custom Uploaded Logo or Avatar
    if (this.logoImage) {
      const logoSize = 64;
      const logoX = this.width - x - logoSize;
      const logoY = bottomY - (logoSize / 2);

      ctx.save();
      ctx.beginPath();
      ctx.arc(logoX + (logoSize / 2), logoY + (logoSize / 2), logoSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(this.logoImage, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    }

    // 3. Subtle Watermark (Growth Hook)
    if (opts.showWatermark) {
      ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = preset.textColor === '#ffffff' || preset.textColor === '#f8fafc' 
        ? 'rgba(255, 255, 255, 0.4)' 
        : 'rgba(0, 0, 0, 0.4)';
      ctx.textAlign = 'right';
      const wmX = this.logoImage ? this.width - x - 80 : this.width - x;
      ctx.fillText('⚡ Created with MetaStudio', wmX, bottomY);
    }

    ctx.restore();
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  getDataUrl(format = 'image/png', quality = 0.95) {
    return this.canvas.toDataURL(format, quality);
  }

  async downloadImage(filename = 'social-card.png') {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve(true);
      }, 'image/png');
    });
  }

  async copyToClipboard() {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Canvas blob failed'));
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } catch (err) {
          reject(err);
        }
      }, 'image/png');
    });
  }
}
function hexToRgba(hex, alpha = 1) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}
