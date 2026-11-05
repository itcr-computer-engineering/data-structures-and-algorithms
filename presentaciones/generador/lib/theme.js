// Temas de color. Todos los temas comparten las mismas claves semánticas.
// Uso: `meta.theme` en el spec ("dark" por defecto, o "light"); `theme` en el spec sobrescribe valores sueltos.
const palettes = {
  dark: {
    bg: '0D1117',
    panel: '161B22',
    rowA: '0D1117',
    rowB: '161B22',
    border: '30363D',
    ink: 'E6EDF3',
    slate: '9DA7B3',
    muted: '7D8590',
    heading: 'F0F6FC',
    navy: '1F3A5F',
    white: 'FFFFFF',
    onAccent: '0D1117',
    slateFill: '4B5563',
    teal: '2DD4BF',
    tealDark: '5EEAD4',
    tealLight: '0F2F33',
    amber: 'FBBF24',
    amberMid: 'F59E0B',
    amberLight: '2D2208',
    red: 'F87171',
    redText: 'FCA5A5',
    redLight: '3B1618',
    green: '4ADE80',
    greenText: '86EFAC',
    greenLight: '122B1B',
    titleBg: '0A0E14',
    titleSub: '9DA7B3',
    serverFill: '2D333B',
    serverSlit: '444C56',
    codeBg: '010409',
    codeBorder: '30363D',
    codeText: 'F8F8F2',
    codeKw: 'FF79C6',
    codeStr: 'F1FA8C',
    codeNum: 'BD93F9',
    codeType: '8BE9FD',
    codeComment: '6272A4',
  },
  light: {
    bg: 'FFFFFF',
    panel: 'F1F5F9',
    rowA: 'FFFFFF',
    rowB: 'F1F5F9',
    border: 'CBD5E1',
    ink: '1E293B',
    slate: '475569',
    muted: '94A3B8',
    heading: '0F2A47',
    navy: '0F2A47',
    white: 'FFFFFF',
    onAccent: 'FFFFFF',
    slateFill: '475569',
    teal: '0E9AA7',
    tealDark: '0A6E78',
    tealLight: 'DDF3F5',
    amber: 'B45309',
    amberMid: 'F59E0B',
    amberLight: 'FEF3C7',
    red: 'B91C1C',
    redText: 'B91C1C',
    redLight: 'FEE2E2',
    green: '15803D',
    greenText: '15803D',
    greenLight: 'DCFCE7',
    titleBg: '0F2A47',
    titleSub: 'CBD5E1',
    serverFill: 'E2E8F0',
    serverSlit: 'CBD5E1',
    codeBg: '0F172A',
    codeBorder: '0F172A',
    codeText: 'F8F8F2',
    codeKw: 'FF79C6',
    codeStr: 'F1FA8C',
    codeNum: 'BD93F9',
    codeType: '8BE9FD',
    codeComment: '6272A4',
  },
};

function getTheme(name = 'dark') {
  if (!palettes[name]) throw new Error(`Tema desconocido: ${name}`);
  return {
    name,
    fonts: { body: 'Calibri', heading: 'Calibri', code: 'Consolas' },
    colors: palettes[name],
    // Medidas en pulgadas (diapositiva 16:9 = 13.333 x 7.5)
    page: { w: 13.333, h: 7.5, mx: 0.7, contentTop: 1.8, contentBottom: 6.85 },
    // 'comment' -> "// sección" en monoespaciado; 'upper' -> SECCIÓN con espaciado
    sectionStyle: name === 'dark' ? 'comment' : 'upper',
  };
}

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

// Cada tono define: acento (relleno sólido), `on` (texto sobre el acento),
// `text` (texto sobre fondo suave) y `soft` (fondo suave).
function tones(c) {
  return {
    teal: { accent: c.teal, on: c.onAccent, text: c.tealDark, soft: c.tealLight },
    navy: { accent: c.navy, on: c.white, text: c.heading, soft: c.panel },
    slate: { accent: c.slateFill, on: c.white, text: c.slate, soft: c.panel },
    amber: { accent: c.amberMid, on: '1C1917', text: c.amber, soft: c.amberLight },
    red: { accent: c.red, on: c.onAccent, text: c.redText, soft: c.redLight },
    green: { accent: c.green, on: c.onAccent, text: c.greenText, soft: c.greenLight },
  };
}

module.exports = { palettes, getTheme, merge, tones };
