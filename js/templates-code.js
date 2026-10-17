// Code generator templates for various modern web frameworks and standard HTML

export function generateHtmlHead(data) {
  const lines = [
    `<!-- Primary Meta Tags -->`,
    `<title>${escapeHtml(data.title)}</title>`,
    `<meta name="title" content="${escapeHtml(data.title)}" />`,
    `<meta name="description" content="${escapeHtml(data.description)}" />`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
    data.themeColor ? `<meta name="theme-color" content="${escapeHtml(data.themeColor)}" />` : '',
    data.canonicalUrl ? `<link rel="canonical" href="${escapeHtml(data.canonicalUrl)}" />` : '',
    data.keywords ? `<meta name="keywords" content="${escapeHtml(data.keywords)}" />` : '',
    data.author ? `<meta name="author" content="${escapeHtml(data.author)}" />` : '',
    `<meta name="robots" content="index, follow" />`,
    '',
    `<!-- Open Graph / Facebook -->`,
    `<meta property="og:type" content="${escapeHtml(data.ogType || 'website')}" />`,
    data.canonicalUrl ? `<meta property="og:url" content="${escapeHtml(data.canonicalUrl)}" />` : '',
    `<meta property="og:title" content="${escapeHtml(data.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(data.description)}" />`,
    data.siteName ? `<meta property="og:site_name" content="${escapeHtml(data.siteName)}" />` : '',
    data.imageUrl ? `<meta property="og:image" content="${escapeHtml(data.imageUrl)}" />` : '',
    data.imageUrl ? `<meta property="og:image:width" content="1200" />` : '',
    data.imageUrl ? `<meta property="og:image:height" content="630" />` : '',
    data.imageUrl ? `<meta property="og:image:alt" content="${escapeHtml(data.title)}" />` : '',
    data.locale ? `<meta property="og:locale" content="${escapeHtml(data.locale)}" />` : '',
    '',
    `<!-- Twitter / X -->`,
    `<meta name="twitter:card" content="${data.twitterCard || 'summary_large_image'}" />`,
    data.canonicalUrl ? `<meta name="twitter:url" content="${escapeHtml(data.canonicalUrl)}" />` : '',
    data.twitterHandle ? `<meta name="twitter:site" content="${escapeHtml(data.twitterHandle)}" />` : '',
    data.twitterHandle ? `<meta name="twitter:creator" content="${escapeHtml(data.twitterHandle)}" />` : '',
    `<meta name="twitter:title" content="${escapeHtml(data.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(data.description)}" />`,
    data.imageUrl ? `<meta name="twitter:image" content="${escapeHtml(data.imageUrl)}" />` : ''
  ];

  return lines.filter(line => line !== '').join('\n');
}

export function generateNextJs(data) {
  return `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(data.title)},
  description: ${JSON.stringify(data.description)},
${data.canonicalUrl ? `  metadataBase: new URL(${JSON.stringify(data.canonicalUrl)}),\n  alternates: {\n    canonical: '/',\n  },` : ''}
${data.keywords ? `  keywords: ${JSON.stringify(data.keywords.split(',').map(s => s.trim()))},` : ''}
${data.author ? `  authors: [{ name: ${JSON.stringify(data.author)} }],` : ''}
  openGraph: {
    title: ${JSON.stringify(data.title)},
    description: ${JSON.stringify(data.description)},
${data.canonicalUrl ? `    url: ${JSON.stringify(data.canonicalUrl)},` : ''}
${data.siteName ? `    siteName: ${JSON.stringify(data.siteName)},` : ''}
${data.imageUrl ? `    images: [
      {
        url: ${JSON.stringify(data.imageUrl)},
        width: 1200,
        height: 630,
        alt: ${JSON.stringify(data.title)},
      },
    ],` : ''}
    locale: ${JSON.stringify(data.locale || 'en_US')},
    type: ${JSON.stringify(data.ogType || 'website')},
  },
  twitter: {
    card: ${JSON.stringify(data.twitterCard || 'summary_large_image')},
    title: ${JSON.stringify(data.title)},
    description: ${JSON.stringify(data.description)},
${data.twitterHandle ? `    creator: ${JSON.stringify(data.twitterHandle)},` : ''}
${data.imageUrl ? `    images: [${JSON.stringify(data.imageUrl)}],` : ''}
  },
  robots: {
    index: true,
    follow: true,
  },
};`;
}

export function generateAstro(data) {
  return `---
// Astro Component Head
const title = ${JSON.stringify(data.title)};
const description = ${JSON.stringify(data.description)};
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const socialImageURL = new URL(${JSON.stringify(data.imageUrl || '/og-image.png')}, Astro.url);
---

<title>{title}</title>
<meta name="title" content={title} />
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="${escapeHtml(data.ogType || 'website')}" />
<meta property="og:url" content={Astro.url} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={socialImageURL} />

<!-- Twitter / X -->
<meta property="twitter:card" content="${data.twitterCard || 'summary_large_image'}" />
<meta property="twitter:url" content={Astro.url} />
<meta property="twitter:title" content={title} />
<meta property="twitter:description" content={description} />
<meta property="twitter:image" content={socialImageURL} />
${data.twitterHandle ? `<meta property="twitter:site" content="${escapeHtml(data.twitterHandle)}" />` : ''}`;
}

export function generateNuxt(data) {
  return `<script setup lang="ts">
useSeoMeta({
  title: ${JSON.stringify(data.title)},
  ogTitle: ${JSON.stringify(data.title)},
  description: ${JSON.stringify(data.description)},
  ogDescription: ${JSON.stringify(data.description)},
${data.imageUrl ? `  ogImage: ${JSON.stringify(data.imageUrl)},\n  twitterImage: ${JSON.stringify(data.imageUrl)},` : ''}
  twitterCard: ${JSON.stringify(data.twitterCard || 'summary_large_image')},
${data.twitterHandle ? `  twitterSite: ${JSON.stringify(data.twitterHandle)},` : ''}
${data.canonicalUrl ? `  ogUrl: ${JSON.stringify(data.canonicalUrl)},` : ''}
${data.siteName ? `  ogSiteName: ${JSON.stringify(data.siteName)},` : ''}
})
</script>`;
}

export function generateSvelteKit(data) {
  return `<svelte:head>
  <title>${escapeHtml(data.title)}</title>
  <meta name="description" content="${escapeHtml(data.description)}" />
  ${data.canonicalUrl ? `<link rel="canonical" href="${escapeHtml(data.canonicalUrl)}" />` : ''}

  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(data.title)}" />
  <meta property="og:description" content="${escapeHtml(data.description)}" />
  <meta property="og:type" content="${escapeHtml(data.ogType || 'website')}" />
  ${data.imageUrl ? `<meta property="og:image" content="${escapeHtml(data.imageUrl)}" />` : ''}

  <!-- Twitter -->
  <meta name="twitter:card" content="${data.twitterCard || 'summary_large_image'}" />
  <meta name="twitter:title" content="${escapeHtml(data.title)}" />
  <meta name="twitter:description" content="${escapeHtml(data.description)}" />
  ${data.imageUrl ? `<meta name="twitter:image" content="${escapeHtml(data.imageUrl)}" />` : ''}
</svelte:head>`;
}

export function generateJsonLd(data) {
  const schema = {
    "@context": "https://schema.org",
    "@type": data.ogType === 'article' ? "Article" : "WebSite",
    "name": data.title,
    "description": data.description,
    "url": data.canonicalUrl || "https://example.com"
  };

  if (data.author) {
    schema["author"] = {
      "@type": "Person",
      "name": data.author
    };
  }

  if (data.imageUrl) {
    schema["image"] = data.imageUrl;
  }

  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
