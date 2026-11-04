# Referencia del spec

Medidas en pulgadas; diapositiva 16:9 de 13.333 × 7.5. Márgenes laterales 0.7. Área de contenido ≈ y 1.8–6.85 (el pie ocupa y ≥ 7.0). Todo el texto admite `**negrita**` y `` `código en línea` ``.

## Estructura general

```json
{
  "meta": {
    "title": "Bases de Datos",
    "author": "CE-2103",
    "company": "Instituto Tecnológico de Costa Rica",
    "subject": "CE-2103 · Lección 08 · Bases de Datos",
    "footer": "CE-2103 · Bases de Datos",
    "theme": "dark",
    "codeLang": "sql",
    "assetsDir": "../../../../ce-2103/images/08-bases-de-datos",
    "output": "../../../ce-2103/Lección 08 - Bases de Datos.pptx"
  },
  "theme": { "colors": {}, "fonts": {} },
  "slides": []
}
```

- Las rutas de `assetsDir` y `output` son relativas al archivo del spec (`presentaciones\generador\specs\<curso>\`).
- `theme.colors` / `theme.fonts` sobrescriben valores del tema (`lib\theme.js`).

### Campos comunes a toda diapositiva (excepto `title`)

| Campo | Descripción |
|---|---|
| `type` | Ver tipos abajo. |
| `section` | Etiqueta superior (`// sección` en tema oscuro). |
| `title` | Título (una línea; ≤ ~55 caracteres a 32 pt). |
| `step`, `stepTotal` | Muestra «paso n/total» y puntos arriba a la derecha (`stepTotal` = 6 por defecto). |
| `notes` | Notas del orador (detalles, respuestas, preguntas para la clase). |

### `callout`

`{ "tone": "teal|navy|slate|amber|red|green", "label": "Opcional:", "text": "…", "size": 17 }`. Tonos: `teal` = idea clave, `amber` = cuidado/ojo, `red` = problema, `green` = beneficio, `slate`/`navy` = neutro.

## Tipos de diapositiva

### `title`
`tag`, `title`, `subtitle`, `meta`, y opcional `terminal: { file, lang, code }` (ventana de terminal decorativa a la derecha; hasta ~5 líneas de ≤ 32 caracteres). Títulos de hasta ~17 caracteres van a 60 pt en una línea; más largos, a 46 pt en dos líneas (el bloque se centra solo).

### `list` / `summary`
`items`: cadenas o `{ title, text }`. `marker: "dot"` (viñeta cuadrada en vez de números), `titleSize` (24), `bold` (true), `footnote` (referencias, 12 pt, abajo). Hasta ~6 ítems de una o dos líneas.

### `flow`
`steps[{ title, text }]` (2–4; con flechas entre cajas), `callout`.

### `image`
`image` (PNG relativo a `assetsDir`), `alt`, `caption`. Se dibuja sobre una tarjeta blanca para que funcione en tema oscuro.

### `cards`
`cards[{ title, text, badge, tone, footer, footerSize, titleSize, textSize, h }]`, `columns` (por defecto `min(n,3)`), `intro` (línea de contexto arriba), `callout`, `cardHeight` (máx. 3.1 por defecto), `titleSize` (22 con ≤ 3 columnas, 20 con 4), `textSize` (18 / 17).
- `badge`: texto corto en un círculo (`1`, `A`, `1:N`, `2FN`).
- `footer`: línea inferior en negrita (ejemplos, costo, nombre de tabla).
- Sin `tone` la tarjeta es neutra; con `tone` usa el color suave del tono.
- Con 6 tarjetas en 2 filas y `intro`, la altura útil es ≈ 1.97 por tarjeta: sin `badge` y con texto de ≤ 2 líneas.

### `compare`
`panels` (exactamente 2) `[{ title, tone, text, textSize, chips[], items[], itemSize, code, codeLang, codeSize, note }]`, `vs` (círculo «vs» entre paneles), `panelHeight` (si se omite: hasta y 5.75 con `callout` o 6.75 sin él; con `panelHeight` el `callout` va justo debajo: ≤ 4.0 con callout), `callout`. Dentro de cada panel el orden es `text` → `chips` (saltan de línea solos) → `items` → `code` → `note`.

### `table`
`columns`, `rows`, `colWeights` (proporciones), `fontSize` (17), `firstColBold` (true; primera columna resaltada), `rowHeight` (0.6 mínimo), `rowPad` (0.3), `headerHeight` (0.55), `highlightRows` (índices de fila a resaltar en ámbar, p. ej. los casos especiales de un seguimiento), `callout` o `callouts[]` (varios lado a lado), `calloutY`, `calloutH`. El alto de fila se estima según el texto; con 9 filas use `fontSize: 15`, `rowHeight: 0.38`, `rowPad: 0.12` y `calloutY: 6.05`.

### `code`
`columns[{ weight, blocks[{ label, code, lang, size, note }], cards[{…, h}] }]`, `codeSize` (15), `top` (1.85), `callouts[]`, `calloutsY` (5.85), `calloutsH` (0.95). Cada columna apila sus `blocks` y luego sus `cards`. Alto de un bloque ≈ `líneas × 1.3 × tamaño/72 + 0.4`.

Lenguajes: `sql`, `json`, `c`, `cpp`, `java`, `csharp`, `python`, `pseudo`, `plain`. Por defecto `meta.codeLang` o `sql`.

## `diagram`: campo `kind`

| `kind` | Campos | Notas |
|---|---|---|
| `dbms-architecture` | `left{title,text}`, `dbms{title,components[≤5]}`, `right{title,text}`, `callout` | Tres bloques con flechas dobles; sirve para cualquier arquitectura «cliente → sistema → almacenamiento» (p. ej. compilador, SO, caché). |
| `annotated-table` | `table{columns[4],rows[3 de 4]}`, `labels{relation,attribute,tuple,key}`, `termsTitle`, `terms[]` | Tabla con rótulos y flechas, más un panel de términos. |
| `m2m` | `tables[3]{name,columns[2],colW[2],rows[3 de 2],role:"fk"}`, `legend{pk,fk}`, `callout` | La tabla central (`role: "fk"`) se une con flechas a las laterales. |
| `scan` | `query`, `cost`, `costText`, `stripLabel`, `rows` (n), `match`, `caption`, `callout` | Franja de n celdas recorridas una a una; sirve para búsqueda lineal. |
| `index-map` | `intro`, `index{title,columns,colW,rows[3]}`, `table{…}`, `cards[{…,h}]`, `callout` | Dos tablas con flechas horizontales (mapa clave → ubicación). |
| `join-result` | `queryLabel`, `query`, `queryLang`, `queryFontSize` (16), `resultLabel`, `result{columns,colW,rows}`, `callout` | Código/entrada a la izquierda y tabla de resultado a la derecha; útil para «entrada → salida» (consulta → filas, texto → frecuencias). |
| `venn-grid` | `intro`, `items[{type:"inner|left|right|full",title,text}]`, `callout` | Diagramas de Venn de JOIN. |
| `timeline-cards` | `events[{year,title,text}]` (2), `cards[]` (3) | Línea de tiempo arriba y tarjetas abajo. |
| `scale` | `up{title,subtitle,caption}`, `out{…}`, `callout` | Servidores: escalar hacia arriba vs. afuera. |
| `flat-table` | `tableLabel`, `table{columns,colW (suma ≈ 11.9),rows}`, `highlight[[fila,col]]`, `cards[]` | Tabla ancha con celdas resaltadas y 3 tarjetas debajo (anomalías, errores). |
| `entities` | `entities[{name,attrs[cadena o {name,tag}]}]`, `puzzle{…tarjeta}`, `callout` | Cajas de entidades con atributos y una tarjeta lateral. |
| `er` | `entities[{name}]` (3), `links[{from,to,label,fromCard,toCard,attr}]`, `cards[]`, `callout` | Modelo entidad-relación simplificado con cardinalidad. |
| `schema` | `tables[{name,rows[3 de [columna,clave]]}]` (4), `links[{from:[tabla,fila],to:[tabla,fila]}]`, `highlight[[tabla,fila]]`, `legend{pk,fk}`, `callout` | Tablas con PK/FK y conectores en codo hacia la clave primaria. |
| `tree` | `nodes[{id,label,sub,shape:"square",tone,x,y}]` (x, y en 0–1), `edges[{from,to,label}]`, `arrows` (puntas de flecha), `treeWidth` (6.4), `treeHeight` (3.9), `table{columns,colW,rows,rowH,emphasisCol}` (opcional, a la derecha), `callout` | Árbol genérico: Huffman, trie, BST, heap, B-tree. Nodos circulares; `shape: "square"` para hojas. Las etiquetas de arista (`0`/`1`, letras) van en círculos pequeños. Con tabla, el árbol ocupa `treeWidth`. |
| `merge-steps` | `rows[{label,nodes[{leaf,freq,hl}|{sum,hl}],note}]`, `rowHeight` (1.05), `callout` | Una fila por paso: lista de nodos que se van uniendo (hoja = cuadrado con símbolo y frecuencia; `sum` = círculo). `hl` resalta con borde ámbar los nodos que se unen. Útil para cualquier algoritmo que transforma una lista paso a paso. |
| `bitstream` | `streamLabel`, `segments[{bits,sym}]`, `equalWidth`, `bitsSize`, `symSize`, `chips{label,items[]}` (con salto de línea), `bars[{label,value,text,tone}]`, `callout`, `top` | Secuencia de códigos con el símbolo debajo; el ancho es proporcional a los bits y se reduce solo si no cabe. `bars` compara tamaños (p. ej. 120 vs 28 bits). |
| `strips` | `chars[]` (≤ 14), `rows[{dict:[i,j],match:[i,j],next:i,out}]`, `callout` | Cadena de caracteres repetida por paso, coloreando procesado/coincidencia/siguiente (LZ77, ventanas deslizantes, coincidencia de patrones). Máx. 5 filas. |

## Tema

`lib\theme.js` define las paletas `dark` (predeterminada) y `light` con las mismas claves semánticas: `bg`, `panel`, `rowA`, `rowB`, `border`, `ink`, `slate`, `muted`, `heading`, `navy`, `onAccent`, `teal`, `tealDark`, `tealLight`, `amber`, `amberMid`, `amberLight`, `red`, `redText`, `redLight`, `green`, `greenText`, `greenLight`, `code*`. Los tonos (`ctx.T.<tono>`) exponen `accent`, `on` (texto sobre el acento), `text` y `soft`.
