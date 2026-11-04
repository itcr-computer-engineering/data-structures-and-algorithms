// Postproceso de cada diapositiva antes de escribir el .pptx.
//
// Problema: en algunas instalaciones de PowerPoint, `Slide.Export` (y SaveAs a PDF) falla con
// "An error occurred while PowerPoint was saving the file" cuando una corrida de texto con una
// fuente normal (Calibri, Arial, Times New Roman…) contiene letras griegas (Θ, Ω, ε, Φ, Σ, α…).
// Las fuentes Consolas, Lucida Console y Segoe UI Symbol sí funcionan. Para no depender del equipo,
// las letras griegas se separan en su propia corrida con la fuente `Segoe UI Symbol`.

const GREEK = /([\u0370-\u03FF\u1F00-\u1FFF]+)/;
const SAFE_FONTS = new Set(['Consolas', 'Lucida Console', 'Segoe UI Symbol']);
const GREEK_FONT = 'Segoe UI Symbol';
const PARAGRAPH_KEYS = ['bullet', 'paraSpaceAfter', 'paraSpaceBefore', 'indentLevel'];

function splitRun(run, fallbackFont) {
  const text = run.text;
  if (typeof text !== 'string' || !GREEK.test(text)) return [run];
  const font = (run.options && run.options.fontFace) || fallbackFont;
  if (SAFE_FONTS.has(font)) return [run];
  const pieces = text.split(GREEK).filter((p) => p !== '');
  return pieces.map((piece, k) => {
    const options = { ...(run.options || {}) };
    if (k > 0) PARAGRAPH_KEYS.forEach((key) => delete options[key]);
    if (k < pieces.length - 1) delete options.breakLine;
    if (GREEK.test(piece)) options.fontFace = GREEK_FONT;
    return { text: piece, options };
  });
}

function splitRuns(runs, fallbackFont) {
  return runs.flatMap((r) => splitRun(r, fallbackFont));
}

function fixGreek(slide) {
  for (const obj of slide._slideObjects || []) {
    if (obj._type === 'text' && Array.isArray(obj.text)) {
      obj.text = splitRuns(obj.text, obj.options && obj.options.fontFace);
    } else if (obj._type === 'table' && Array.isArray(obj.arrTabRows)) {
      for (const row of obj.arrTabRows) {
        for (const cell of row) {
          const base = cell.options || {};
          if (typeof cell.text === 'string') {
            if (GREEK.test(cell.text) && !SAFE_FONTS.has(base.fontFace)) {
              cell.text = splitRun({ text: cell.text, options: { ...base } }, base.fontFace);
            }
          } else if (Array.isArray(cell.text)) {
            cell.text = splitRuns(cell.text, base.fontFace);
          }
        }
      }
    }
  }
}

module.exports = { fixGreek };
