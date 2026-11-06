# Generador de presentaciones

Genera los archivos `.pptx` del curso a partir de una especificación JSON usando [pptxgenjs](https://gitbrent.github.io/PptxGenJS/). **El spec es la única fuente de verdad** de cada lección: el `.pptx` y el `.pdf` son resultados de compilación, así que para cambiar una lección se edita solo su spec y se regenera.

## Uso

```powershell
cd presentaciones\generador
npm install
node build.js specs\ce-2103\08-bases-de-datos.json     # una presentación
powershell -NoProfile -File build-all.ps1               # todas (.pptx)
powershell -NoProfile -File build-all.ps1 -Pdf          # todas, con PDF (requiere PowerPoint)
```

El archivo de salida se define en `meta.output` del spec (relativo al spec). Puede indicarse otro destino como segundo argumento de `build.js`. Nunca edite los `.pptx`/`.pdf` a mano: se sobrescriben al regenerar. Las imágenes que usan los specs están en `ce-1103\images` y `ce-2103\images`.

## Revisión visual (Windows + PowerPoint)

```powershell
powershell -File render.ps1 -Pptx "..\ce-2103\Lección 08 - Bases de Datos.pptx" -Pdf
powershell -File contact-sheet.ps1 -Dir "render\Lección 08 - Bases de Datos"
```

- `render.ps1` exporta cada diapositiva a `render\<nombre del pptx>\slide-NN.png`, avisa de formas fuera de la diapositiva y, con `-Pdf`, genera el PDF junto al `.pptx`. Puede ejecutarse en paralelo (un mutex serializa el uso de PowerPoint).
- `contact-sheet.ps1 -Dir <carpeta>` arma hojas de contacto (`sheet-NN.png`) para revisar varias diapositivas a la vez.

## Uso con Copilot (skill)

La skill `.github\skills\generar-presentacion\` guía a Copilot para crear una presentación nueva de otro tema: leer el material que usted indique, planificar, escribir el spec, construir y hacer la revisión visual. Pídale, por ejemplo: «Genera una presentación de estas notas: …». Incluye una plantilla (`templates\spec-template.json`), la referencia completa del spec y la lista de revisión visual.

## Estructura del spec

```json
{
  "meta": { "title": "", "footer": "", "theme": "dark", "assetsDir": "ruta a las imágenes", "output": "ruta del .pptx" },
  "theme": { "colors": {}, "fonts": {} },
  "slides": [ { "type": "...", "notes": "notas del orador" } ]
}
```

- **Temas:** `meta.theme` admite `dark` (predeterminado, estilo editor de código) y `light`. Los colores están en `lib\theme.js`; `theme.colors` en el spec sobrescribe valores sueltos.
- **Texto enriquecido:** `**negrita**` y `` `código en línea` ``. Tonos disponibles: `teal`, `navy`, `slate`, `amber`, `red`, `green`.
- **Indicador de pasos:** cualquier diapositiva acepta `step` (y opcionalmente `stepTotal`, 6 por defecto) para mostrar "paso n/total" arriba a la derecha.

| `type` | Uso | Campos principales |
|--------|-----|--------------------|
| `title` | Portada | `tag`, `title`, `subtitle`, `meta`, `terminal{file,lang,code}` |
| `list` / `summary` | Lista numerada o con viñetas | `items`, `marker` (`dot`), `footnote` |
| `flow` | Pasos con flechas | `steps[{title,text}]`, `callout` |
| `image` | Imagen con leyenda | `image`, `alt`, `caption` |
| `cards` | Rejilla de tarjetas | `cards[{title,text,badge,tone,footer}]`, `columns`, `intro`, `callout` |
| `compare` | Dos paneles | `panels[{title,tone,text,items,chips,code,note}]`, `vs`, `callout` |
| `table` | Tabla comparativa | `columns`, `rows`, `colWeights`, `callout` |
| `code` | Bloques de código en columnas | `columns[{weight,blocks[{label,code,lang}],cards}]`, `callouts`; lenguajes: `sql`, `json`, `c`, `cpp`, `java`, `csharp`, `rust`, `python`, `pseudo`, `plain` (por defecto `meta.codeLang`) |
| `diagram` | Diagramas a medida | `kind`: `dbms-architecture`, `annotated-table`, `m2m`, `scan`, `index-map`, `join-result`, `venn-grid`, `timeline-cards`, `scale`, `flat-table`, `entities`, `er`, `schema`, `tree`, `merge-steps`, `bitstream`, `strips`, más los de las extensiones por tema (abajo) |

Todos excepto `title` aceptan `section` (etiqueta superior) y `title`. Los diagramas comunes están en `lib\diagrams.js`; los tipos de diapositiva, en `lib\layouts.js`; los diagramas propios de un tema, en `lib\diagrams.<tema>.js`, que se cargan solos (cada `kind` lleva el prefijo del tema).

### Extensiones por tema

| Archivo | Presentación | `kind` |
|---------|--------------|--------|
| `diagrams.memoria.js` | CE-2103 · Administración de memoria | `memoria-imagen`, `memoria-tabla`, `memoria-layout`, `memoria-trace`, `memoria-pila-pasos`, `memoria-espacios`, `memoria-base-limite`, `memoria-celdas`, `memoria-copias`, `memoria-fragmentos` |
| `diagrams.analisis.js` | CE-2103 · Análisis de algoritmos | `analisis-casos-busqueda`, `analisis-codigo-grafica`, `analisis-imagen-tabla`, `analisis-arbol-niveles`, `analisis-costos-push`, `analisis-tabla-terminos`, `analisis-traza-loops` |
| `diagrams.diseno.js` | CE-2103 · Diseño de algoritmos | `diseno-matriz`, `diseno-tablero`, `diseno-arbol`, `diseno-bloom`, `diseno-ciclo`, `diseno-mergesort`, `diseno-subproblemas` |
| `diagrams.busqueda.js` | CE-2103 · Algoritmos de búsqueda | `busqueda-array-steps`, `busqueda-formula`, `busqueda-paneles`, `busqueda-grid` |
| `diagrams.externo.js` | CE-2103 · Almacenamiento externo | `externo-image-side`, `externo-images`, `externo-timebar`, `externo-bars`, `externo-partitions`, `externo-cache-flow`, `externo-cache-trace`, `externo-runs`, `externo-btree`, `externo-raid`, `externo-paridad`, `externo-raid5`, `externo-bloques`, `externo-asignacion`, `externo-inodo`, `externo-layout` |
| `diagrams.compresion.js` | CE-2103 · Algoritmos de compresión | `compresion-intervalos` |
| `diagrams.poo.js` | CE-1103 · POO | `poo-code`, `poo-uml`, `poo-memoria`, `poo-ecuacion`, `poo-imagen-lado`, `poo-relaciones`, `poo-ide` |
| `diagrams.lineales.js` | CE-1103 · Estructuras lineales | `lineales-array`, `lineales-nodes`, `lineales-stack`, `lineales-ring`, `lineales-matrix-refs`, `lineales-doble-insertar` |
| `diagrams.ordenamiento.js` | CE-1103 · Ordenamiento y búsqueda | `ordenamiento-array`, `ordenamiento-hash`, `ordenamiento-escalera` |
| `diagrams.jerarquicas.js` | CE-1103 · Estructuras jerárquicas | `jerarquicas-trees`, `jerarquicas-imagegrid` |
| `diagrams.grafos.js` | CE-1103 · Grafos | `grafos-graph`, `grafos-panels`, `grafos-matrices` |

Antes de crear un diagrama nuevo, mire estos: varios (arreglos con estados, nodos enlazados, árboles, grafos, trazas) se pueden reutilizar en otros temas. Sus campos están en la cabecera de cada archivo y en los specs que los usan.

### Notas técnicas

- `lib\postprocess.js` separa las letras griegas (Θ, Ω, ε…) en corridas con `Segoe UI Symbol`: sin eso, PowerPoint falla al exportar a imagen/PDF cuando una fuente normal las contiene.
- Las celdas de tabla interpretan `**negrita**` y `` `código` ``; no hay cursiva.

## Crear otra presentación

1. Copie un spec parecido (`specs\ce-2103\08-bases-de-datos.json`, `...\06-algoritmos-de-compresion.json`, o los de `specs\ce-1103\`) y ajuste `meta`, `assetsDir` y `slides`.
2. Ejecute `node build.js <spec>`.
3. Revise con `render.ps1` y `contact-sheet.ps1`: sin textos desbordados, máximo ~5 ideas por diapositiva y texto de al menos 14 pt.
