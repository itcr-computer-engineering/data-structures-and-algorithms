# Generador de presentaciones

Genera los archivos `.pptx` del curso a partir de una especificación JSON usando [pptxgenjs](https://gitbrent.github.io/PptxGenJS/). Así cada presentación se puede regenerar o ajustar editando solo el spec.

## Uso

```powershell
cd presentaciones\generador
npm install
node build.js specs\ce-2103\08-bases-de-datos.json
```

El archivo de salida se define en `meta.output` del spec (relativo al spec). Puede indicarse otro destino como segundo argumento.

## Revisión visual (Windows + PowerPoint)

```powershell
powershell -File render.ps1 -Pptx "..\ce-2103\Lección 08 - Bases de Datos.pptx" -Pdf
powershell -File contact-sheet.ps1
```

- `render.ps1` exporta cada diapositiva a `render\slide-NN.png`, avisa de formas fuera de la diapositiva y, con `-Pdf`, genera el PDF junto al `.pptx`.
- `contact-sheet.ps1` arma hojas de contacto (`render\sheet-NN.png`) para revisar varias diapositivas a la vez.

## Uso con Copilot (skill)

La skill `.github\skills\generar-presentacion\` guía a Copilot para crear una presentación nueva de otro tema: leer el capítulo, planificar, escribir el spec, construir y hacer la revisión visual. Pídale, por ejemplo: «Genera una presentación de `ce-2103\04-algoritmos-de-busqueda.md`». Incluye una plantilla (`templates\spec-template.json`), la referencia completa del spec y la lista de revisión visual.

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
| `code` | Bloques de código en columnas | `columns[{weight,blocks[{label,code,lang}],cards}]`, `callouts`; lenguajes: `sql`, `json`, `c`, `cpp`, `java`, `csharp`, `python`, `pseudo`, `plain` (por defecto `meta.codeLang`) |
| `diagram` | Diagramas a medida | `kind`: `dbms-architecture`, `annotated-table`, `m2m`, `scan`, `index-map`, `join-result`, `venn-grid`, `timeline-cards`, `scale`, `flat-table`, `entities`, `er`, `schema`, `tree`, `merge-steps`, `bitstream`, `strips` |

Todos excepto `title` aceptan `section` (etiqueta superior) y `title`. Los diagramas nuevos se agregan en `lib\diagrams.js`; los tipos de diapositiva, en `lib\layouts.js`.

## Crear otra presentación

1. Copie `specs\ce-2103\08-bases-de-datos.json` y ajuste `meta`, `assetsDir` y `slides`.
2. Ejecute `node build.js <spec>`.
3. Revise con `render.ps1` y `contact-sheet.ps1`: sin textos desbordados, máximo ~5 ideas por diapositiva y texto de al menos 14 pt.
