// Tema por defecto. Cualquier valor puede sobrescribirse desde `theme` en el spec.
const defaultTheme = {
  fonts: { body: 'Calibri', heading: 'Calibri', code: 'Consolas' },
  colors: {
    navy: '0F2A47',
    ink: '1E293B',
    slate: '475569',
    muted: '94A3B8',
    border: 'CBD5E1',
    panel: 'F1F5F9',
    white: 'FFFFFF',
    teal: '0E9AA7',
    tealDark: '0A6E78',
    tealLight: 'DDF3F5',
    amber: 'B45309',
    amberMid: 'F59E0B',
    amberLight: 'FEF3C7',
    red: 'B91C1C',
    redLight: 'FEE2E2',
    green: '15803D',
    greenLight: 'DCFCE7',
    codeBg: '0F172A',
    codeText: 'E2E8F0',
    codeKw: '7DD3FC',
    codeStr: 'FCD34D',
    codeNum: '86EFAC',
    codeDim: '94A3B8',
  },
  // Medidas en pulgadas (diapositiva 16:9 = 13.333 x 7.5)
  page: { w: 13.333, h: 7.5, mx: 0.7, contentTop: 1.8, contentBottom: 6.85 },
};

function merge(base, extra) {
  const out = { ...base };
  for (const k of Object.keys(extra || {})) {
    out[k] =
      base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])
        ? merge(base[k], extra[k])
        : extra[k];
  }
  return out;
}

// Cada tono define: color de acento, texto sobre fondo claro y fondo suave.
function tones(c) {
  return {
    teal: { accent: c.teal, text: c.tealDark, soft: c.tealLight },
    navy: { accent: c.navy, text: c.navy, soft: c.panel },
    slate: { accent: c.slate, text: c.slate, soft: c.panel },
    amber: { accent: c.amberMid, text: c.amber, soft: c.amberLight },
    red: { accent: c.red, text: c.red, soft: c.redLight },
    green: { accent: c.green, text: c.green, soft: c.greenLight },
  };
}

module.exports = { defaultTheme, merge, tones };
