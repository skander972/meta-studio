import assert from 'node:assert/strict';
import { PRESETS } from '../js/presets.js';
import {
  generateHtmlHead,
  generateNextJs,
  generateAstro,
  generateNuxt,
  generateSvelteKit,
  generateJsonLd
} from '../js/templates-code.js';

console.log('🧪 Starting Unit Tests for MetaStudio Modules...\n');

// Test 1: Presets validation
console.log('Test 1: Validating Presets Configuration...');
assert.ok(Array.isArray(PRESETS), 'PRESETS should be an array');
assert.ok(PRESETS.length >= 5, 'Should have at least 5 presets defined');

PRESETS.forEach((preset, index) => {
  assert.ok(preset.id, `Preset at index ${index} must have an id`);
  assert.ok(preset.name, `Preset ${preset.id} must have a name`);
  assert.ok(['solid', 'gradient'].includes(preset.bgType), `Preset ${preset.id} has invalid bgType: ${preset.bgType}`);
  assert.ok(preset.textColor, `Preset ${preset.id} missing textColor`);
  assert.ok(preset.titleFont, `Preset ${preset.id} missing titleFont`);
  assert.ok(preset.descFont, `Preset ${preset.id} missing descFont`);
  assert.ok(preset.metaFont, `Preset ${preset.id} missing metaFont`);
});
console.log(`✅ Test 1 Passed: All ${PRESETS.length} presets valid.\n`);

// Sample data for code generation
const testData = {
  title: 'Test App & <Studio> "2026"',
  description: 'A great utility for testing OpenGraph and social banners & cards.',
  canonicalUrl: 'https://test-studio.com',
  siteName: 'Test Studio Inc.',
  author: 'Jane Developer',
  twitterHandle: '@janedev',
  twitterCard: 'summary_large_image',
  ogType: 'website',
  imageUrl: 'https://test-studio.com/og-image.png',
  themeColor: '#4f46e5',
  keywords: 'test, open graph, dev tools',
  locale: 'en_US'
};

// Test 2: HTML Head generator
console.log('Test 2: Validating generateHtmlHead...');
const htmlOutput = generateHtmlHead(testData);
assert.ok(htmlOutput.includes('<title>Test App &amp; &lt;Studio&gt; &quot;2026&quot;</title>'), 'HTML output must escape special characters');
assert.ok(htmlOutput.includes('<meta property="og:title" content="Test App &amp; &lt;Studio&gt; &quot;2026&quot;" />'), 'OG Title escaped');
assert.ok(htmlOutput.includes('<meta name="twitter:card" content="summary_large_image" />'), 'Twitter card tag present');
assert.ok(htmlOutput.includes('<meta property="og:image:width" content="1200" />'), 'OG Image width 1200 present');
assert.ok(htmlOutput.includes('<meta property="og:image:height" content="630" />'), 'OG Image height 630 present');
console.log('✅ Test 2 Passed: HTML Head tags generated and sanitized.\n');

// Test 3: Next.js Metadata generator
console.log('Test 3: Validating generateNextJs...');
const nextOutput = generateNextJs(testData);
assert.ok(nextOutput.includes('import type { Metadata } from \'next\';'), 'Next.js Metadata import present');
assert.ok(nextOutput.includes('title: "Test App & <Studio> \\"2026\\""'), 'Next.js Title JSON escaped');
assert.ok(nextOutput.includes('card: "summary_large_image"'), 'Twitter card set in Next.js metadata');
console.log('✅ Test 3 Passed: Next.js metadata export structure valid.\n');

// Test 4: Astro SEO generator
console.log('Test 4: Validating generateAstro...');
const astroOutput = generateAstro(testData);
assert.ok(astroOutput.includes('// Astro Component Head'), 'Astro frontmatter comment present');
assert.ok(astroOutput.includes('canonicalURL = new URL(Astro.url.pathname, Astro.site)'), 'Astro canonical URL present');
console.log('✅ Test 4 Passed: Astro SEO structure valid.\n');

// Test 5: Nuxt 3 composable
console.log('Test 5: Validating generateNuxt...');
const nuxtOutput = generateNuxt(testData);
assert.ok(nuxtOutput.includes('useSeoMeta({'), 'Nuxt useSeoMeta composable present');
assert.ok(nuxtOutput.includes('ogImage: "https://test-studio.com/og-image.png"'), 'Nuxt ogImage present');
console.log('✅ Test 5 Passed: Nuxt 3 SEO composable valid.\n');

// Test 6: SvelteKit
console.log('Test 6: Validating generateSvelteKit...');
const svelteOutput = generateSvelteKit(testData);
assert.ok(svelteOutput.includes('<svelte:head>'), '<svelte:head> wrapper present');
assert.ok(svelteOutput.includes('</svelte:head>'), '</svelte:head> closing tag present');
console.log('✅ Test 6 Passed: SvelteKit head valid.\n');

// Test 7: JSON-LD Schema generator
console.log('Test 7: Validating generateJsonLd...');
const jsonLdOutput = generateJsonLd(testData);
assert.ok(jsonLdOutput.includes('<script type="application/ld+json">'), 'JSON-LD script wrapper present');
const jsonMatch = jsonLdOutput.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
assert.ok(jsonMatch, 'JSON-LD content extractable');
const parsed = JSON.parse(jsonMatch[1]);
assert.equal(parsed['@context'], 'https://schema.org');
assert.equal(parsed['@type'], 'WebSite');
assert.equal(parsed['name'], testData.title);
assert.equal(parsed['author']['name'], testData.author);
console.log('✅ Test 7 Passed: JSON-LD schema parsing and structure valid.\n');

console.log('🎉 ALL UNIT TESTS COMPLETED SUCCESSFULLY!');
