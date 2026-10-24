import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const navigation = readFileSync(new URL('../src/navigation.css', import.meta.url), 'utf8');
const css = style + navigation;
const root = style.match(/:root\s*\{([^}]+)\}/)?.[1] || '';
const tokens = Object.fromEntries([...root.matchAll(/--([\w-]+)\s*:\s*(#[\da-f]{6})\s*;/gi)].map((m) => [m[1], m[2]]));
const names = ['surface-page','surface-rail','surface-panel','surface-raised','surface-muted','text-primary','text-secondary','text-muted','accent','accent-soft','border','focus'];
function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map((part) => parseInt(part, 16) / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
test('warm semantic tokens exist and provide readable text contrast', () => {
  for (const name of names) assert.ok(tokens[name], `missing --${name}`);
  for (const text of ['text-primary','text-secondary','text-muted']) for (const surface of ['surface-page','surface-rail','surface-panel','surface-raised','surface-muted','accent-soft']) {
    const ratio = contrast(tokens[text], tokens[surface]);
    assert.ok(ratio >= 4.5, `${text} over ${surface}: ${ratio}`);
  }
  assert.ok(contrast('#ffffff', tokens.accent) >= 4.5);
  assert.ok(contrast(tokens.accent, tokens['accent-soft']) >= 4.5);
});
test('main surfaces consume semantic tokens and focus remains visible', () => {
  for (const [selector, token] of [['.topbar','surface-page'],['.left-rail','surface-rail'],['.detail-panel','surface-panel'],['.map-stage','surface-raised']]) {
    const rule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find((m) => m[1].trim().split(',').map((s) => s.trim()).includes(selector) && m[2].includes(`var(--${token})`));
    assert.ok(rule, `${selector} must use --${token}`);
  }
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--focus\)/);
});
test('search placeholder explicitly uses opaque accessible muted text', () => {
  const rule = css.match(/\.search-wrap input::placeholder\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(rule, /color:\s*var\(--text-muted\)/);
  assert.match(rule, /opacity:\s*1(?:;|$)/);
});
test('reading body rules remain at least 15px and offline CSS retains navigation safeguards', () => {
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (/\.(?:study-guide-card p|study-guide-lead p|study-guide-summary p|study-guide-recall p|round-content|micro-trap p|micro-example p|micro-quizzes details p|source-case-study p|source-case-study li|detail-section p|deep-list li|focus-detail p)/.test(match[1])) {
      const size = match[2].match(/font-size:\s*([\d.]+)px/);
      if (size) assert.ok(+size[1] >= 15, `${match[1]} is ${size[1]}px`);
    }
  }
  assert.match(css, /\.study-guide-card p[^{}]*\{[^}]*font-size:\s*15px/);
  assert.doesNotMatch(css, /@import|url\(\s*['"]?https?:/i);
  assert.match(css, /position:sticky/);
  assert.match(css, /\.detail-panel\.mobile-open/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /\.mobile-panel-bar button/);
  assert.match(css, /overflow-x:auto/);
  assert.match(css, /overflow-wrap:anywhere/);
});
