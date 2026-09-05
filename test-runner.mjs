/**
 * Phonological Rule Editor - Test Runner
 * Runs node-based automated verification for Parser, KaTeX Generator, Svg Renderer, and Presets.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Setup global mock for window
globalThis.window = globalThis;

// Load modules
const parserCode = fs.readFileSync(path.join(__dirname, 'js/parser.js'), 'utf-8');
const katexGenCode = fs.readFileSync(path.join(__dirname, 'js/katex-generator.js'), 'utf-8');
const svgGenCode = fs.readFileSync(path.join(__dirname, 'js/svg-rule-renderer.js'), 'utf-8');
const presetsCode = fs.readFileSync(path.join(__dirname, 'js/presets.js'), 'utf-8');

new Function(parserCode)();
new Function(katexGenCode)();
new Function(svgGenCode)();
new Function(presetsCode)();

const { PhonologyParser, PhonologyKatex, SvgRuleRenderer, PhonologyPresets } = globalThis;

console.log('=== Phonological Rule Editor Automated Tests ===\n');

// Test 1: Verify Presets (including *p > f)
console.log(`[Test 1] Testing all ${PhonologyPresets.length} presets...`);
PhonologyPresets.forEach((preset, i) => {
  const ast = PhonologyParser.parseRule(preset.text);
  if (!ast || (!ast.target.length && !ast.change.length)) {
    console.error(`FAIL: Preset ${preset.id} failed to parse properly`);
    process.exit(1);
  }

  const katex = PhonologyKatex.generateKatex(ast, preset.operator);
  if (!katex || katex.length < 5) {
    console.error(`FAIL: Preset ${preset.id} generated invalid KaTeX`);
    process.exit(1);
  }

  console.log(`  ✓ Preset ${i + 1} (${preset.id}): parsed ok [${ast.operator}]. KaTeX length: ${katex.length}`);
});

// Test 2: Verify Operator Switch (→ vs >) with Asterisk Reconstruction (*p > b)
console.log('\n[Test 2] Testing Operator Switch & Reconstructed Asterisk (*p > b)...');
const testRule = '*p > b / V _ V';
const astGreater = PhonologyParser.parseRule(testRule);

if (astGreater.operator !== 'greater') {
  console.error('FAIL: Expected operator to be "greater", got:', astGreater.operator);
  process.exit(1);
}

if (!astGreater.target[0] || astGreater.target[0].value !== '*p') {
  console.error('FAIL: Target should preserve *p, got:', astGreater.target);
  process.exit(1);
}

const katexGreater = PhonologyKatex.generateKatex(astGreater, 'greater');
if (!katexGreater.includes('\\mathrel{>}') || !katexGreater.includes('\\ast\\text{p}')) {
  console.error('FAIL: KaTeX for *p > b should include \\mathrel{>} and \\ast\\text{p}, got:', katexGreater);
  process.exit(1);
}
console.log('  ✓ Reconstructed *p and > correctly formatted in KaTeX');

// Test 3: Feature Matrix Parsing & Formatting (with custom features)
console.log('\n[Test 3] Testing Feature Matrix & Custom Features (e.g. +fortis, -slack vc)...');
const matrixRule = '[+fortis, -slack vc] -> [-voice] / _ #';
const astMatrix = PhonologyParser.parseRule(matrixRule);

if (astMatrix.target.length !== 1 || astMatrix.target[0].type !== 'matrix') {
  console.error('FAIL: Target should be a single matrix element');
  process.exit(1);
}

if (astMatrix.target[0].features.length !== 2) {
  console.error('FAIL: Target matrix should have 2 features, got:', astMatrix.target[0].features.length);
  process.exit(1);
}

const katexMatrix = PhonologyKatex.generateKatex(astMatrix);
if (!katexMatrix.includes('\\text{fortis}') || !katexMatrix.includes('\\text{slack vc}')) {
  console.error('FAIL: Custom features not rendered into KaTeX:', katexMatrix);
  process.exit(1);
}
console.log('  ✓ Custom user features (+fortis, -slack vc) properly parsed and formatted into KaTeX');

// Test 4: Japanese Zenkaku (Full-width IME) Normalization
console.log('\n[Test 4] Testing Japanese Zenkaku / Full-width Normalization...');
const zenkakuRule = '［＋ｓｙｌ］　ー＞　［＋ｎａｓ］　／　＿　［＋ｎａｓ］';
const astZenkaku = PhonologyParser.parseRule(zenkakuRule);
if (astZenkaku.target[0].features[0] !== '+syl') {
  console.error('FAIL: Zenkaku feature not normalized to +syl, got:', astZenkaku.target[0].features[0]);
  process.exit(1);
}
console.log('  ✓ Zenkaku characters and brackets automatically normalized for flawless IME typing');

// Test 5: Pure SvgRuleRenderer with Serif (明朝) and Sans (ゴシック)
console.log('\n[Test 5] Testing Pure SvgRuleRenderer with Serif vs Sans Font Styles...');
const svgSerif = SvgRuleRenderer.render(astMatrix, 'arrow', { fontStyle: 'serif' });
const svgSans = SvgRuleRenderer.render(astMatrix, 'arrow', { fontStyle: 'sans' });

if (!svgSerif.svg.includes('Times New Roman') && !svgSerif.svg.includes('KaTeX_Main')) {
  console.error('FAIL: SvgRuleRenderer serif should include serif font family');
  process.exit(1);
}

if (!svgSans.svg.includes('Inter') && !svgSans.svg.includes('Helvetica')) {
  console.error('FAIL: SvgRuleRenderer sans should include sans font family');
  process.exit(1);
}

if (svgSerif.svg.includes('<foreignObject>') || svgSans.svg.includes('<foreignObject>')) {
  console.error('FAIL: SvgRuleRenderer must NOT contain <foreignObject>');
  process.exit(1);
}
console.log(`  ✓ Serif SVG (${svgSerif.width}x${svgSerif.height}px) and Sans SVG (${svgSans.width}x${svgSans.height}px) rendered cleanly`);

// Test 6: Multilingual localization (i18n) verification
console.log('\n[Test 6] Testing i18n Localization (JA & EN) & Zero Japanese in English...');
const i18nCode = fs.readFileSync(path.join(__dirname, 'js/i18n.js'), 'utf-8');
new Function(i18nCode)();
const { PhonologyI18n, getLocalizedPresets } = globalThis;

if (!PhonologyI18n || !PhonologyI18n.ja || !PhonologyI18n.en) {
  console.error('FAIL: PhonologyI18n must have ja and en dictionaries');
  process.exit(1);
}

// Check key symmetry
const jaKeys = Object.keys(PhonologyI18n.ja);
const enKeys = Object.keys(PhonologyI18n.en);
const missingInEn = jaKeys.filter(k => !(k in PhonologyI18n.en));
const missingInJa = enKeys.filter(k => !(k in PhonologyI18n.ja));

if (missingInEn.length > 0) {
  console.error('FAIL: Missing i18n keys in en:', missingInEn);
  process.exit(1);
}
if (missingInJa.length > 0) {
  console.error('FAIL: Missing i18n keys in ja:', missingInJa);
  process.exit(1);
}

// Ensure NO Japanese characters (Hiragana, Katakana, Kanji) exist in English dictionary values
const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;
for (const [key, val] of Object.entries(PhonologyI18n.en)) {
  if (typeof val === 'string' && japaneseRegex.test(val)) {
    console.error(`FAIL: English dictionary key "${key}" contains Japanese text: "${val}"`);
    process.exit(1);
  }
}

// Verify getLocalizedPresets
const enPresets = getLocalizedPresets('en');
enPresets.forEach(p => {
  if (japaneseRegex.test(p.category) || japaneseRegex.test(p.name)) {
    console.error(`FAIL: English preset ${p.id} contains Japanese text: ${p.category} / ${p.name}`);
    process.exit(1);
  }
});
console.log('  ✓ All i18n keys match between JA and EN');
console.log('  ✓ Verified ZERO Japanese characters exist in English dictionary and presets');

console.log('\n=============================================');
console.log('All Phonological Rule Editor tests passed! ✓');
console.log('=============================================');

