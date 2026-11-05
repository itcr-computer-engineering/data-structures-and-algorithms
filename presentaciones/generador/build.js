#!/usr/bin/env node
// Genera una presentación .pptx a partir de un spec JSON.
// Uso: node build.js specs/ce-2103/08-bases-de-datos.json [salida.pptx]
const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');
const { getTheme, merge, tones } = require('./lib/theme');
const { layouts } = require('./lib/layouts');
const { footer } = require('./lib/components');
const { fixGreek } = require('./lib/postprocess');

async function main() {
  const specPath = process.argv[2];
  if (!specPath) {
    console.error('Uso: node build.js <spec.json> [salida.pptx]');
    process.exit(1);
  }
  const specFile = path.resolve(specPath);
  const specDir = path.dirname(specFile);
  const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
  const meta = spec.meta || {};
  const theme = merge(getTheme(meta.theme || 'dark'), spec.theme);
  const T = tones(theme.colors);

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = meta.title || 'Presentación';
  pptx.author = meta.author || '';
  pptx.company = meta.company || '';
  pptx.subject = meta.subject || '';
  pptx.theme = { headFontFace: theme.fonts.heading, bodyFontFace: theme.fonts.body };

  const assetsDir = path.resolve(specDir, meta.assetsDir || '.');
  spec.slides.forEach((s, i) => {
    const layout = layouts[s.type];
    if (!layout) throw new Error(`Diapositiva ${i + 1}: tipo desconocido "${s.type}"`);
    const slide = pptx.addSlide();
    slide.background = { color: theme.colors.bg };
    const ctx = { pptx, slide, theme, T, meta, assetsDir };
    try {
      layout(ctx, s);
    } catch (e) {
      throw new Error(`Diapositiva ${i + 1} (${s.title || s.type}): ${e.message}`);
    }
    if (s.type !== 'title') footer(ctx);
    fixGreek(slide);
    if (s.notes) slide.addNotes(s.notes);
  });

  const out = path.resolve(process.argv[3] || path.join(specDir, meta.output || 'salida.pptx'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await pptx.writeFile({ fileName: out });
  console.log(`OK ${spec.slides.length} diapositivas -> ${out}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
