// Diagramas del tema «Grafos» (CE-1103): grafos con estados de algoritmo y paneles con estructuras auxiliares.
// kinds: grafos-graph (grafo a la izquierda + bloques a la derecha), grafos-panels (2-3 grafos en paneles)
// y grafos-matrices (grafo opcional + matrices n × n con celdas resaltadas + bloques a la derecha + avisos abajo).
const C = require('./components');

const { text, chip, callout, codeBlock, table, paragraphs, surface } = C;

const chipW = (label, size = 14) => String(label).length * (size * 0.0072) + 0.45;
const estLines = (str, fs, w) => {
  const plain = String(str).replace(/\*\*|`/g, '');
  const cpl = Math.max(1, Math.floor((w / (fs * 0.0063)) * 0.95));
  return Math.max(1, Math.ceil(plain.length / cpl));
};
const lineH = (fs) => (fs * 1.25) / 72;

// ------------------------------------------------------------------ grafos predefinidos (coordenadas 0-1 dentro del panel)
// nodos: [id, x, y, etiqueta?]; aristas: [a, b, peso?, { t, off, bi }?]
const PRESETS = {
  // Grafo no dirigido básico del capítulo: V = {1, 4, 5, 7, 9}
  basico: {
    directed: false,
    nodes: [['1', 0.03, 0.08], ['4', 0.97, 0.08], ['5', 0.5, 0.5], ['7', 0.03, 0.92], ['9', 0.97, 0.92]],
    edges: [['1', '4'], ['1', '5'], ['5', '7'], ['7', '9'], ['4', '9']],
  },
  // Grafo dirigido pequeño (C, D, E, F, H)
  dirigido: {
    directed: true,
    nodes: [['C', 0.0, 0.05], ['E', 1.0, 0.05], ['H', 0.5, 0.52], ['D', 0.0, 0.95], ['F', 1.0, 0.95]],
    edges: [['E', 'C'], ['C', 'D'], ['D', 'F'], ['E', 'H', undefined, { bi: true }]],
  },
  // Grafo dirigido con un ciclo A → E → B → F → A (grado, ciclo, DAG)
  ciclo6: {
    directed: true,
    nodes: [['A', 0.04, 0.04], ['B', 0.52, 0.04], ['C', 0.98, 0.04], ['D', 0.04, 0.96], ['E', 0.52, 0.96], ['F', 0.98, 0.64]],
    edges: [['A', 'E'], ['E', 'B'], ['B', 'F'], ['F', 'A'], ['C', 'F'], ['E', 'D']],
  },
  // Conexo (no dirigido) y fuertemente conexo (dirigido, aristas en ambos sentidos)
  conexo: {
    directed: false,
    nodes: [['3', 0.0, 0.02], ['5', 0.95, 0.02], ['9', 0.5, 0.42], ['2', 0.0, 0.98], ['7', 1.0, 0.82]],
    edges: [['3', '9'], ['9', '5'], ['5', '7'], ['3', '2'], ['2', '9'], ['2', '7']],
  },
  anillo: {
    directed: true,
    nodes: [['4', 0.33, 0.02], ['8', 1.0, 0.28], ['6', 0.67, 0.98], ['5', 0.0, 0.74]],
    edges: [['4', '8', undefined, { bi: true }], ['8', '6', undefined, { bi: true }], ['6', '5', undefined, { bi: true }], ['5', '4', undefined, { bi: true }]],
  },
  // Matriz de adyacencia: nodos D, F, K, L, R
  matriz5: {
    directed: true,
    nodes: [['D', 0.04, 0.08], ['F', 0.96, 0.08], ['R', 0.5, 0.35], ['K', 0.2, 0.95], ['L', 0.96, 0.95]],
    edges: [['D', 'F', undefined, { bi: true }], ['D', 'K'], ['F', 'K'], ['L', 'F'], ['L', 'K'], ['R', 'D']],
  },
  // Grafo de los recorridos BFS/DFS (D, B, C, H, R, A, T)
  recorrido: {
    directed: true,
    nodes: [['A', 0.04, 0.04], ['B', 0.5, 0.04], ['D', 0.96, 0.04], ['H', 0.27, 0.5], ['C', 0.73, 0.5], ['T', 0.04, 0.96], ['R', 0.73, 0.96]],
    edges: [['D', 'B'], ['B', 'H'], ['H', 'D'], ['D', 'C'], ['C', 'R'], ['R', 'H'], ['H', 'A'], ['H', 'T']],
  },
  // Grafo ponderado dirigido de Dijkstra (A-E)
  dijkstra: {
    directed: true,
    nodes: [['A', 0.02, 0.5], ['B', 0.38, 0.06], ['C', 0.98, 0.06], ['D', 0.38, 0.94], ['E', 0.98, 0.94]],
    edges: [
      ['A', 'B', 50], ['A', 'D', 80], ['B', 'C', 60], ['B', 'D', 90],
      ['D', 'C', 20, { t: 0.27 }], ['C', 'E', 40], ['D', 'E', 70], ['E', 'B', 50, { t: 0.27 }],
    ],
  },
  // Grafo ponderado no dirigido de Prim y Kruskal (v1-v7)
  mst7: {
    directed: false,
    nodes: [['v1', 0.25, 0.04], ['v2', 0.75, 0.04], ['v3', 0.0, 0.5], ['v4', 0.5, 0.5], ['v5', 1.0, 0.5], ['v6', 0.25, 0.96], ['v7', 0.75, 0.96]],
    edges: [
      ['v1', 'v2', 2], ['v1', 'v3', 4], ['v1', 'v4', 1], ['v2', 'v4', 3], ['v2', 'v5', 10], ['v3', 'v4', 2],
      ['v3', 'v6', 5], ['v4', 'v5', 7], ['v4', 'v6', 8], ['v4', 'v7', 4], ['v5', 'v7', 6], ['v6', 'v7', 1],
    ],
  },
  // Floyd y Warshall: grafo dirigido y ponderado de cinco vértices (matriz D0 del capítulo). Entre v4 y v5 hay dos arcos opuestos
  // con pesos distintos (v4→v5 = 2, v5→v4 = 3): se dibujan paralelos con `shift`.
  floyd5: {
    directed: true,
    nodes: [['v1', 0.0, 0.47], ['v2', 0.37, 1.0], ['v3', 0.37, 0.0], ['v4', 0.93, 1.0], ['v5', 0.93, 0.0]],
    edges: [
      ['v1', 'v2', 1], ['v2', 'v4', 4], ['v2', 'v5', 7], ['v3', 'v1', 3], ['v3', 'v2', 2, { t: 0.4 }], ['v3', 'v5', 4],
      ['v4', 'v1', 6, { t: 0.3 }], ['v4', 'v5', 2, { shift: 0.1, off: 0.3 }], ['v5', 'v4', 3, { shift: 0.1, off: 0.3 }],
    ],
  },
  // Dijkstra (ejercicio): grafo no dirigido y ponderado de siete vértices a-g
  dijkstra7: {
    directed: false,
    nodes: [['a', 0.0, 0.4], ['b', 0.0, 1.0], ['c', 0.5, 0.5], ['d', 0.3, 1.0], ['e', 1.0, 0.0], ['f', 1.0, 1.0], ['g', 0.82, 0.5]],
    edges: [
      ['a', 'b', 3], ['a', 'c', 5], ['a', 'd', 6], ['b', 'd', 2], ['c', 'd', 2], ['c', 'e', 6],
      ['c', 'f', 3], ['c', 'g', 7], ['d', 'f', 9], ['e', 'f', 5], ['e', 'g', 2], ['f', 'g', 1],
    ],
  },
  // Siete vértices a-g: varios árboles de expansión del mismo grafo
  mstabc: {
    directed: false,
    nodes: [['a', 0.0, 0.5], ['b', 0.25, 0.0], ['c', 0.25, 1.0], ['d', 0.5, 0.5], ['e', 0.75, 0.0], ['f', 0.75, 1.0], ['g', 1.0, 0.5]],
    edges: [
      ['a', 'b', 4], ['a', 'c', 8], ['b', 'c', 9], ['b', 'd', 8], ['b', 'e', 10], ['c', 'd', 2],
      ['c', 'f', 1], ['d', 'e', 7], ['d', 'f', 9], ['e', 'f', 5], ['e', 'g', 6], ['f', 'g', 2],
    ],
  },
};

function resolveGraph(spec) {
  const base = spec.preset ? PRESETS[spec.preset] : null;
  if (spec.preset && !base) throw new Error('Grafo predefinido desconocido: ' + spec.preset);
  const directed = spec.directed !== undefined ? spec.directed : base ? base.directed : false;
  const key = (e) => `${e.a}${directed ? '>' : '-'}${e.b}`;
  const rkey = (e) => `${e.b}${directed ? '>' : '-'}${e.a}`;
  const nodes = (spec.nodes || (base && base.nodes) || []).map((n) => (Array.isArray(n) ? { id: n[0], x: n[1], y: n[2], label: n[3] } : { ...n }));
  let edges = (spec.edges || (base && base.edges) || []).map((e) => (Array.isArray(e) ? { a: e[0], b: e[1], w: e[2], ...(e[3] || {}) } : { ...e }));
  const hide = spec.hide || [];
  edges = edges.filter((e) => !hide.includes(key(e)) && !(!directed && hide.includes(rkey(e))));
  const pick = (map, e) => {
    if (!map) return undefined;
    if (key(e) in map) return map[key(e)];
    if ((!directed || e.bi) && rkey(e) in map) return map[rkey(e)];
    return undefined;
  };
  edges.forEach((e) => {
    const st = pick(spec.edgeStates, e);
    if (st) e.state = st;
    else if (spec.defaultEdgeState && !e.state) e.state = spec.defaultEdgeState;
  });
  nodes.forEach((n) => {
    if (spec.states && spec.states[n.id]) n.state = spec.states[n.id];
    const tg = spec.tags && spec.tags[n.id];
    if (tg !== undefined) n.tag = typeof tg === 'string' || typeof tg === 'number' ? { text: String(tg) } : tg;
  });
  return { directed, nodes, edges, nodeSize: spec.nodeSize, weightSize: spec.weightSize };
}

// ------------------------------------------------------------------ estilos
function edgeStyle(ctx, state, directed) {
  const { colors } = ctx.theme;
  const T = ctx.T;
  const heavy = directed ? 3.5 : 4.5;
  switch (state) {
    case 'tree': return { color: T.teal.accent, width: heavy, text: T.teal.text };
    case 'path': return { color: T.green.accent, width: heavy, text: T.green.text };
    case 'active': return { color: T.amber.accent, width: heavy, text: T.amber.text };
    case 'cand': return { color: T.amber.accent, width: 3, dash: 'dash', text: T.amber.text };
    case 'rejected': return { color: T.red.accent, width: 3, dash: 'dash', text: T.red.text };
    case 'dim': return { color: colors.muted, width: 1.25, text: colors.muted };
    default: return { color: colors.slate, width: 2.25, text: colors.ink };
  }
}

function nodeStyle(ctx, state) {
  const { colors } = ctx.theme;
  const T = ctx.T;
  switch (state) {
    case 'done': return { fill: T.teal.accent, line: null, color: T.teal.on };
    case 'current': return { fill: T.amber.accent, line: null, color: T.amber.on };
    case 'frontier': return { fill: T.amber.soft, line: T.amber.accent, color: T.amber.text };
    case 'dim': return { fill: colors.bg, line: colors.border, color: colors.muted };
    default: return { fill: colors.bg, line: colors.slate, color: colors.heading };
  }
}

// Etiqueta de nodo: «v1» se dibuja con subíndice.
function nodeRuns(label, size) {
  const m = /^([A-Za-z])(\d+)$/.exec(label);
  if (m) {
    return [
      { text: m[1], options: { fontSize: size, bold: true } },
      { text: m[2], options: { fontSize: size, bold: true, subscript: true } },
    ];
  }
  return [{ text: String(label), options: { fontSize: size, bold: true } }];
}

// ------------------------------------------------------------------ dibujo de un grafo
function drawGraph(ctx, g, rect, { panel = true } = {}) {
  const { colors, fonts } = ctx.theme;
  const T = ctx.T;
  const d = g.nodeSize || 0.64;
  const r = d / 2;
  if (panel) surface(ctx, null, rect);
  const padX = r + 0.28;
  const padY = r + (g.nodes.some((n) => n.tag) ? 0.4 : 0.2);
  const pos = {};
  g.nodes.forEach((n) => {
    pos[n.id] = { x: rect.x + padX + n.x * (rect.w - 2 * padX), y: rect.y + padY + n.y * (rect.h - 2 * padY) };
  });
  const wSize = g.weightSize || 15;
  const labels = [];
  g.edges.forEach((e) => {
    const A = pos[e.a];
    const B = pos[e.b];
    if (!A || !B) throw new Error(`Arista con nodo desconocido: ${e.a} - ${e.b}`);
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const st = edgeStyle(ctx, e.state, g.directed);
    // `shift`: desplazamiento perpendicular (pulgadas) para dibujar dos arcos opuestos en paralelo
    const sh = e.shift || 0;
    const nx = -uy;
    const ny = ux;
    const inset = Math.sqrt(Math.max(0.01, r * r - sh * sh)) + 0.03;
    let x1 = A.x + nx * sh, y1 = A.y + ny * sh, x2 = B.x + nx * sh, y2 = B.y + ny * sh;
    const line = { color: st.color, width: st.width };
    if (st.dash) line.dashType = st.dash;
    if (g.directed) {
      x2 -= ux * inset;
      y2 -= uy * inset;
      line.endArrowType = 'triangle';
      if (e.bi) {
        x1 += ux * inset;
        y1 += uy * inset;
        line.beginArrowType = 'triangle';
      }
    }
    ctx.slide.addShape(ctx.pptx.ShapeType.line, {
      x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipH: x2 < x1, flipV: y2 < y1, line,
    });
    if (e.w !== undefined && e.w !== null) {
      const t = e.t !== undefined ? e.t : 0.5;
      const off = (e.off || 0) + sh;
      const s = String(e.w);
      labels.push({
        cx: A.x + dx * t + nx * off, cy: A.y + dy * t + ny * off, w: Math.max(0.42, s.length * wSize * 0.0072 + 0.22), s, color: st.text,
      });
    }
  });
  labels.forEach((l) => {
    ctx.slide.addText(l.s, {
      shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.1, x: l.cx - l.w / 2, y: l.cy - 0.16, w: l.w, h: 0.32,
      fill: { color: colors.panel }, line: { type: 'none' }, color: l.color, bold: true, fontSize: wSize, fontFace: fonts.body,
      align: 'center', valign: 'middle', margin: 0,
    });
  });
  const fsz = d >= 0.6 ? 20 : 16;
  g.nodes.forEach((n) => {
    const p = pos[n.id];
    const st = nodeStyle(ctx, n.state);
    ctx.slide.addText(nodeRuns(n.label || n.id, fsz), {
      shape: ctx.pptx.ShapeType.ellipse, x: p.x - r, y: p.y - r, w: d, h: d, fill: { color: st.fill },
      line: st.line ? { color: st.line, width: 2 } : { type: 'none' }, color: st.color, fontFace: fonts.heading,
      align: 'center', valign: 'middle', margin: 0,
    });
  });
  g.nodes.forEach((n) => {
    if (!n.tag) return;
    const p = pos[n.id];
    const tone = ctx.T[n.tag.tone || 'amber'] || T.amber;
    const label = String(n.tag.text);
    const tw = Math.max(0.42, label.length * 0.1 + 0.3);
    const th = 0.3;
    const at = n.tag.at || 'n';
    let x = p.x - tw / 2;
    let y = p.y - r - 0.05 - th;
    if (at === 's') y = p.y + r + 0.05;
    else if (at === 'e') { x = p.x + r + 0.06; y = p.y - th / 2; }
    else if (at === 'w') { x = p.x - r - 0.06 - tw; y = p.y - th / 2; }
    else if (at === 'ne') { x = p.x + r * 0.55; y = p.y - r - th + 0.02; }
    else if (at === 'nw') { x = p.x - r * 0.55 - tw; y = p.y - r - th + 0.02; }
    else if (at === 'se') { x = p.x + r * 0.55; y = p.y + r - 0.02; }
    else if (at === 'sw') { x = p.x - r * 0.55 - tw; y = p.y + r - 0.02; }
    ctx.slide.addText(label, {
      shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.08, x, y, w: tw, h: th, fill: { color: tone.soft },
      line: { color: tone.accent, width: 1 }, color: tone.text, bold: true, fontSize: 14, fontFace: fonts.body,
      align: 'center', valign: 'middle', margin: 0,
    });
  });
}

function legend(ctx, items, x, y) {
  let lx = x;
  items.forEach((it) => {
    const lw = chipW(it.label, 14) + 0.1;
    chip(ctx, { x: lx, y, w: lw, h: 0.34, label: it.label, tone: it.tone || 'teal', solid: it.solid !== false, size: 14 });
    lx += lw + 0.15;
  });
}

// ------------------------------------------------------------------ bloques del panel derecho
// Cada bloque devuelve su alto; el espaciado entre bloques lo pone drawSide.
const SIDE = {
  // Fila de casillas: cola, pila, orden de visita...
  strip(ctx, b, x, y, w) {
    const { colors, fonts } = ctx.theme;
    const t = ctx.T[b.tone || 'amber'];
    const items = b.items || [];
    let h = 0;
    if (b.label) {
      text(ctx, b.label, { x, y, w, h: 0.35, fontSize: 17, bold: true, color: colors.slate, valign: 'middle' });
      h += 0.42;
    }
    const bs = b.size || 0.68;
    const gap = b.arrows ? 0.42 : 0.12;
    if (!items.length) {
      const ew = 2.1;
      ctx.slide.addText(b.empty || 'vacía', {
        shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.08, x, y: y + h, w: ew, h: bs, fill: { color: colors.panel },
        line: { color: colors.border, width: 1.25 }, color: colors.muted, italic: true, fontSize: 18, fontFace: fonts.body,
        align: 'center', valign: 'middle', margin: 0,
      });
      return h + bs;
    }
    let cx = x;
    const hl = b.hl || [];
    items.forEach((it, i) => {
      const bw = Math.max(bs, String(it).length * 0.19 + 0.34);
      const solid = hl.includes(i);
      ctx.slide.addText(String(it), {
        shape: ctx.pptx.ShapeType.roundRect, rectRadius: 0.08, x: cx, y: y + h, w: bw, h: bs,
        fill: { color: solid ? t.accent : t.soft }, line: { color: t.accent, width: 1.5 }, color: solid ? t.on : t.text,
        bold: true, fontSize: 24, fontFace: fonts.heading, align: 'center', valign: 'middle', margin: 0,
      });
      if (b.mark && b.mark.index === i) {
        text(ctx, b.mark.text, { x: cx + bw / 2 - 0.8, y: y + h + bs + 0.02, w: 1.6, h: 0.3, fontSize: 15, color: colors.slate, align: 'center', valign: 'middle' });
      }
      if (b.arrows && i < items.length - 1) {
        text(ctx, '→', { x: cx + bw, y: y + h, w: gap, h: bs, fontSize: 22, color: colors.slate, align: 'center', valign: 'middle' });
      }
      cx += bw + gap;
    });
    return h + bs + (b.mark ? 0.34 : 0);
  },

  text(ctx, b, x, y, w) {
    const fs = b.size || 17;
    const h = estLines(b.text, fs, w) * lineH(fs) + 0.1;
    text(ctx, b.text, { x, y, w, h, fontSize: fs, color: ctx.theme.colors.ink });
    return h;
  },

  list(ctx, b, x, y, w) {
    const fs = b.size || 17;
    const h = b.items.reduce((a, it) => a + estLines(it, fs, w - 0.3) * lineH(fs) + 8 / 72, 0);
    paragraphs(ctx, b.items, { x, y, w, h, fontSize: fs, bullet: true, spaceAfter: 8, color: ctx.theme.colors.ink });
    return h;
  },

  // Aviso con fondo de color (explica el paso actual)
  note(ctx, b, x, y, w) {
    const fs = b.size || 17;
    const h = Math.max(0.7, estLines(b.text, fs, w - 0.5) * lineH(fs) + 0.3);
    callout(ctx, { x, y, w, h, tone: b.tone || 'teal', label: b.label, text: b.text, size: fs });
    return h;
  },

  code(ctx, b, x, y, w) {
    return codeBlock(ctx, { x, y, w, code: b.code, lang: b.lang || 'plain', fontSize: b.size || 16 });
  },

  table(ctx, b, x, y, w) {
    const { colors } = ctx.theme;
    const T = ctx.T;
    let h = 0;
    if (b.label) {
      text(ctx, b.label, { x, y, w, h: 0.35, fontSize: 16, bold: true, color: colors.slate, valign: 'middle' });
      h += 0.4;
    }
    const weights = b.colWeights || b.columns.map(() => 1);
    const sum = weights.reduce((a, c) => a + c, 0);
    const tw = b.width || w;
    const colW = weights.map((v) => (v / sum) * tw);
    const cells = new Set((b.hlCells || []).map(([r, c]) => `${r}:${c}`));
    const rowH = b.rowH || 0.45;
    const align = b.columns.map((_, c) => (c === 0 && b.firstColLeft ? 'left' : 'center'));
    const tb = table(ctx, {
      x, y: y + h, colW, header: b.columns, rows: b.rows, rowH: [b.headerH || rowH, ...b.rows.map(() => rowH)], fontSize: b.fontSize || 16, align,
      cellStyle: (r, c) => {
        const tone = b.rowTone && b.rowTone[r];
        let st = {};
        if (tone) st = { fill: T[tone].soft, color: T[tone].text, bold: true };
        if (c === 0 && b.firstCol !== false && !tone) st = { bold: true, color: colors.heading, fill: colors.tealLight };
        if (cells.has(`${r}:${c}`)) st = { fill: T.teal.soft, color: T.teal.text, bold: true };
        return st;
      },
    });
    return h + tb.h;
  },
};

function drawSide(ctx, blocks, x, y0, w) {
  let y = y0;
  blocks.forEach((b) => {
    if (!SIDE[b.type]) throw new Error('Bloque desconocido: ' + b.type);
    y += SIDE[b.type](ctx, b, x, y, w) + 0.25;
  });
}

// ------------------------------------------------------------------ grafo + panel derecho
function graphSide(ctx, s) {
  const { mx, w } = ctx.theme.page;
  const g = resolveGraph(s.graph);
  const gw = s.graph.width || 6.2;
  const gh = s.graph.height || 3.8;
  const rect = { x: mx, y: s.top || 1.85, w: gw, h: gh };
  drawGraph(ctx, g, rect);
  if (s.legend) legend(ctx, s.legend, mx, rect.y + gh + 0.05);
  if (s.side) {
    const sx = mx + gw + 0.4;
    drawSide(ctx, s.side, sx, rect.y, w - mx - sx);
  }
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.2, w: w - 2 * mx, h: s.calloutH || 0.65, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ 2-3 grafos en paneles con título y texto
function graphPanels(ctx, s) {
  const { colors, fonts } = ctx.theme;
  const { mx, w } = ctx.theme.page;
  const n = s.graphs.length;
  const gap = n === 3 ? 0.3 : 0.4;
  const pw = (w - 2 * mx - (n - 1) * gap) / n;
  const top = s.top || 1.85;
  const ph = s.panelHeight || 4.15;
  const gh = s.graphHeight || (n === 3 ? 2.75 : 2.7);
  s.graphs.forEach((gs, i) => {
    const x = mx + i * (pw + gap);
    surface(ctx, null, { x, y: top, w: pw, h: ph });
    const g = resolveGraph(gs);
    if (n === 3 && !g.nodeSize) g.nodeSize = 0.5;
    drawGraph(ctx, g, { x: x + 0.12, y: top + 0.12, w: pw - 0.24, h: gh }, { panel: false });
    const t = ctx.T[gs.tone || 'teal'];
    let y = top + 0.12 + gh + 0.12;
    text(ctx, gs.title, { x: x + 0.25, y, w: pw - 0.5, h: 0.45, fontSize: 22, bold: true, color: t.text, fontFace: fonts.heading, valign: 'middle' });
    y += 0.5;
    if (gs.text) {
      text(ctx, gs.text, { x: x + 0.25, y, w: pw - 0.5, h: top + ph - y - 0.1, fontSize: gs.textSize || 17, color: colors.slate });
    }
  });
  if (s.callout) callout(ctx, { x: mx, y: s.calloutY || 6.2, w: w - 2 * mx, h: s.calloutH || 0.65, size: 16, ...s.callout });
}

// ------------------------------------------------------------------ avisos bajo el contenido (uno o varios lado a lado)
function bottomCallouts(ctx, s) {
  const { mx, w } = ctx.theme.page;
  const list = s.callouts || (s.callout ? [s.callout] : []);
  const k = list.length;
  if (!k) return;
  const gap = 0.3;
  const cw = (w - 2 * mx - (k - 1) * gap) / k;
  list.forEach((c, i) => {
    callout(ctx, { x: mx + i * (cw + gap), y: s.calloutY || 6.2, w: cw, h: s.calloutH || 0.65, size: 16, ...c });
  });
}

// ------------------------------------------------------------------ matriz n × n con encabezados vi / vj y celdas resaltadas
// m: { label, tone, rows[[...]], labels[] (por defecto v1…vn), cellW, headW, rowH, hl: [[fila, columna, tono?]] }
function matrixBlock(ctx, m, x, y) {
  const { colors } = ctx.theme;
  const T = ctx.T;
  const nCols = m.rows[0].length;
  const cw = m.cellW || 0.5;
  const hw = m.headW || 0.6;
  const rh = m.rowH || 0.52;
  const labels = m.labels || Array.from({ length: nCols }, (_, i) => `v${i + 1}`);
  const tw = hw + nCols * cw;
  const lt = T[m.tone || 'teal'];
  text(ctx, m.label, { x, y, w: tw + 0.3, h: 0.35, fontSize: 17, bold: true, color: lt.text, valign: 'middle' });
  const marks = new Map((m.hl || []).map(([r, c, tone]) => [`${r}:${c}`, tone || 'teal']));
  const rows = m.rows.map((r, i) => [labels[i] || '', ...r]);
  const tb = table(ctx, {
    x, y: y + 0.42, colW: [hw, ...Array.from({ length: nCols }, () => cw)], header: ['', ...labels], rows,
    rowH: Array.from({ length: rows.length + 1 }, () => rh), fontSize: m.fontSize || 18,
    align: Array.from({ length: nCols + 1 }, () => 'center'),
    cellStyle: (r, c) => {
      if (c === 0) return { bold: true, color: colors.heading, fill: colors.tealLight };
      const tone = marks.get(`${r}:${c - 1}`);
      return tone ? { fill: T[tone].soft, color: T[tone].text, bold: true } : {};
    },
  });
  return { w: tw, h: 0.42 + tb.h };
}

// ------------------------------------------------------------------ grafo opcional + matrices + bloques a la derecha
function matricesSlide(ctx, s) {
  const { mx, w } = ctx.theme.page;
  const top = s.top || 1.85;
  let x = mx;
  if (s.graph) {
    const g = resolveGraph(s.graph);
    const gw = s.graph.width || 4.4;
    const gh = s.graph.height || 3.12;
    drawGraph(ctx, g, { x, y: top + 0.42, w: gw, h: gh });
    if (s.graphLabel) text(ctx, s.graphLabel, { x, y: top, w: gw, h: 0.35, fontSize: 17, bold: true, color: ctx.T.slate.text, valign: 'middle' });
    x += gw + 0.3;
  }
  s.matrices.forEach((m) => {
    const b = matrixBlock(ctx, m, x, top);
    x += b.w + 0.25;
  });
  if (s.side) {
    const sx = x + 0.15;
    drawSide(ctx, s.side, sx, top, w - mx - sx);
  }
  bottomCallouts(ctx, s);
}

module.exports = {
  'grafos-graph': graphSide,
  'grafos-panels': graphPanels,
  'grafos-matrices': matricesSlide,
};
