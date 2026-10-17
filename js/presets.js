// Preset themes for the 1200x630 OpenGraph Banner Designer
export const PRESETS = [
  {
    id: 'modern-saas',
    name: 'Modern SaaS',
    bgType: 'gradient',
    bgGradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#0f172a', pos: 0 },
        { color: '#1e1b4b', pos: 0.6 },
        { color: '#312e81', pos: 1 }
      ]
    },
    textColor: '#f8fafc',
    descColor: '#94a3b8',
    accentColor: '#6366f1',
    badgeBg: 'rgba(99, 102, 241, 0.2)',
    badgeBorder: '#6366f1',
    badgeText: '#a5b4fc',
    titleFont: 'bold 64px "Plus Jakarta Sans", sans-serif',
    descFont: '32px "Plus Jakarta Sans", sans-serif',
    metaFont: 'bold 24px "Plus Jakarta Sans", sans-serif',
    layout: 'left',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    hasGlow: true,
    glowColor: '#4f46e5'
  },
  {
    id: 'clean-light',
    name: 'Clean Light',
    bgType: 'solid',
    bgColor: '#ffffff',
    textColor: '#0f172a',
    descColor: '#475569',
    accentColor: '#0284c7',
    badgeBg: '#f0f9ff',
    badgeBorder: '#bae6fd',
    badgeText: '#0369a1',
    titleFont: 'bold 64px "Plus Jakarta Sans", sans-serif',
    descFont: '32px "Plus Jakarta Sans", sans-serif',
    metaFont: 'bold 24px "Plus Jakarta Sans", sans-serif',
    layout: 'left',
    cardBorder: '#e2e8f0',
    hasGlow: false
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    bgType: 'gradient',
    bgGradient: {
      type: 'linear',
      angle: 120,
      stops: [
        { color: '#050505', pos: 0 },
        { color: '#110c26', pos: 0.5 },
        { color: '#1e082b', pos: 1 }
      ]
    },
    textColor: '#ffffff',
    descColor: '#a1a1aa',
    accentColor: '#06b6d4',
    badgeBg: 'rgba(6, 182, 212, 0.15)',
    badgeBorder: '#06b6d4',
    badgeText: '#67e8f9',
    titleFont: 'bold 64px "Space Grotesk", sans-serif',
    descFont: '30px "Space Grotesk", sans-serif',
    metaFont: 'bold 24px "JetBrains Mono", monospace',
    layout: 'left',
    cardBorder: 'rgba(6, 182, 212, 0.25)',
    hasGlow: true,
    glowColor: '#06b6d4'
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    bgType: 'gradient',
    bgGradient: {
      type: 'linear',
      angle: 145,
      stops: [
        { color: '#1c1917', pos: 0 },
        { color: '#431407', pos: 0.4 },
        { color: '#7c2d12', pos: 0.8 },
        { color: '#ea580c', pos: 1 }
      ]
    },
    textColor: '#ffffff',
    descColor: '#fed7aa',
    accentColor: '#f97316',
    badgeBg: 'rgba(249, 115, 22, 0.25)',
    badgeBorder: '#f97316',
    badgeText: '#ffedd5',
    titleFont: 'bold 64px "Plus Jakarta Sans", sans-serif',
    descFont: '32px "Plus Jakarta Sans", sans-serif',
    metaFont: 'bold 24px "Plus Jakarta Sans", sans-serif',
    layout: 'left',
    cardBorder: 'rgba(255, 255, 255, 0.15)',
    hasGlow: true,
    glowColor: '#ea580c'
  },
  {
    id: 'dev-terminal',
    name: 'Dev Terminal',
    bgType: 'solid',
    bgColor: '#090d16',
    textColor: '#10b981',
    descColor: '#94a3b8',
    accentColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeBorder: '#10b981',
    badgeText: '#34d399',
    titleFont: 'bold 60px "JetBrains Mono", monospace',
    descFont: '28px "JetBrains Mono", monospace',
    metaFont: '500 24px "JetBrains Mono", monospace',
    layout: 'terminal',
    cardBorder: '#1e293b',
    hasGlow: true,
    glowColor: '#10b981'
  },
  {
    id: 'editorial',
    name: 'Editorial Serif',
    bgType: 'solid',
    bgColor: '#fdfbf7',
    textColor: '#1c1917',
    descColor: '#57534e',
    accentColor: '#78350f',
    badgeBg: '#fef3c7',
    badgeBorder: '#fde68a',
    badgeText: '#92400e',
    titleFont: 'bold 66px "Playfair Display", serif',
    descFont: '32px "Plus Jakarta Sans", sans-serif',
    metaFont: 'bold 22px "Plus Jakarta Sans", sans-serif',
    layout: 'center',
    cardBorder: '#e7e5e4',
    hasGlow: false
  }
];
