---
name: generar-presentacion
description: Crea o actualiza una presentación PowerPoint (.pptx) en español para un tema de los cursos CE-1103 / CE-2103 (o similares) a partir del material que indique el usuario (apuntes, texto, un esquema o una presentación previa). Usa el generador pptxgenjs del repositorio con un spec JSON, que es la única fuente de verdad; tema oscuro para desarrolladores, notas del orador y revisión visual con PowerPoint. Úsala cuando pidan hacer slides, una presentación, una lección, un deck o un PPT de un tema, o regenerar/ajustar una existente. Also use for "create slides/a deck/a presentation for this lesson".
---

# Generar presentaciones de lección

Convierte el material de una lección en una presentación clara, concisa y visualmente revisada, **regenerable desde un spec JSON**. El spec es la **única fuente de verdad** del contenido: el `.pptx` y el `.pdf` son resultados de compilación y no se editan a mano. Para cambiar una lección, edite su spec y regenere (`presentaciones\generador\build-all.ps1`). El generador vive en `presentaciones\generador\` (pptxgenjs).

Ejemplo completo y de referencia: `presentaciones\generador\specs\ce-2103\08-bases-de-datos.json` (42 diapositivas) → `presentaciones\ce-2103\Lección 08 - Bases de Datos.pptx`.

## Requisitos

- Node.js y npm. La primera vez: `cd presentaciones\generador; npm install`.
- Windows con PowerPoint instalado para la revisión visual (`render.ps1` usa COM). Sin PowerPoint, exporte a PDF con LibreOffice (`soffice --headless --convert-to pdf`) y a PNG con `pdftoppm -r 80 -png`, y revise igual.

## Flujo de trabajo

1. **Leer el material.** Lea el material que indique el usuario (apuntes, texto, un esquema, una presentación previa) y, si existen, las imágenes en `<curso>\images\<NN-tema>\`. Si falta material, pídalo antes de construir. Identifique 4–6 objetivos de aprendizaje, los conceptos, los ejemplos y el vocabulario del curso. Mire también un spec existente para copiar el estilo.
2. **Planificar el esquema** (no lo escriba en el repo): secciones, 3–5 diapositivas por concepto grande, y qué visual comunica mejor cada una (ver "Elegir el tipo de diapositiva"). Para un tema muy largo o ambiguo, muestre el esquema y el número de diapositivas al usuario antes de construir. Si necesita un caso de uso/ejemplo conductor, elija uno simple y cercano a estudiantes, úselo de principio a fin y menciónelo en la respuesta final.
3. **Crear el spec.** Copie la plantilla y edítela:
   ```powershell
   New-Item -ItemType Directory -Force presentaciones\generador\specs\<curso> | Out-Null
   Copy-Item .github\skills\generar-presentacion\templates\spec-template.json presentaciones\generador\specs\<curso>\<NN>-<slug>.json
   ```
   Ajuste `meta` (`title`, `footer`, `assetsDir`, `output`, `codeLang`) y reemplace las diapositivas. Rutas relativas al spec: `assetsDir` apunta a `<curso>\images\<NN-tema>` y `output` a `presentaciones\<curso>\Lección <NN> - <Tema>.pptx`. Edite el JSON con la herramienta de edición, no con redirecciones del shell.
4. **Construir.**
   ```powershell
   cd presentaciones\generador
   node build.js specs\<curso>\<NN>-<slug>.json
   ```
   Los errores indican la diapositiva (`Diapositiva 12 (título): …`).
5. **Revisión visual (obligatoria).**
   ```powershell
   powershell -NoProfile -File render.ps1 -Pptx "..\<curso>\Lección <NN> - <Tema>.pptx"
   powershell -NoProfile -File contact-sheet.ps1 -Dir "render\Lección <NN> - <Tema>"
   ```
   `render.ps1` guarda los PNG en `render\<nombre del pptx>\` y es seguro ejecutarlo en paralelo desde varios procesos (un mutex serializa PowerPoint y no cierra una sesión ajena). Abra `sheet-NN.png` (6 diapositivas por hoja) con la herramienta `view` para una pasada general y luego `slide-NN.png` a tamaño completo para cada diapositiva sospechosa. Siga `references\qa-checklist.md`. Corrija el spec (o el generador) y repita hasta que no haya texto desbordado, solapado ni mal ubicado. `render.ps1` también avisa de formas fuera de la diapositiva.
6. **Entregables.** Con `-Pdf` en `render.ps1` genere el PDF junto al `.pptx` (las lecciones existentes incluyen ambos). Elimine `presentaciones\generador\render\<nombre>\` (`render` está en `.gitignore`).
7. **Guardar.** Haga commit del spec, el `.pptx`, el `.pdf` y cualquier cambio al generador. Nunca incluya `node_modules` ni `render`. Si cambió `lib\`, ejecute `presentaciones\generador\build-all.ps1` (con `-Pdf` para regenerar también los PDF) y compruebe que ninguna presentación se rompió.

## Mantener el contenido (una sola fuente)

- Para **actualizar** una lección, edite solo su spec JSON y regenere: `powershell -NoProfile -File build-all.ps1 [-Pdf]` (o `node build.js <spec>` para una sola). No edite el `.pptx`/`.pdf`: se sobrescriben.
- Lo que haría falta en un documento aparte (respuestas, derivaciones, advertencias) va en `notes`, no en archivos Markdown paralelos.

## Reglas de contenido (rol: profesor de primer año de Ingeniería en Computadores)

- **Idioma:** español neutro de Costa Rica, trato de «usted» en instrucciones («Escriba», «Identifique»), comillas angulares «…», términos técnicos en inglés cuando así se usan en el curso (*full table scan*, *scale out*) con su explicación. Mantenga la terminología y los ejemplos del material fuente.
- **Fidelidad:** no invente hechos. Todo lo que añada más allá del material fuente (ejemplos, analogías, comparaciones) debe ser correcto, verificado (ejecute el código y los cálculos) y estar señalado en su respuesta final para que el usuario lo revise.
- **Conciso y no abrumador:** una idea por diapositiva; como máximo ~5 viñetas o ~25 palabras por tarjeta; texto ≥ 14 pt. Todo lo demás (detalles, respuestas de ejercicios, errores comunes, preguntas para la clase) va en `notes` (notas del orador).
- **Visual primero:** prefiera diagramas, tablas, código resaltado y antes/después frente a listas. Reutilice el mismo ejemplo en varias diapositivas (mismos nombres de tablas, variables, datos).
- **Estructura típica:** portada → objetivos (`list`) → secciones con `section` → ejercicio «Ahora usted» cuando aplique → resumen (`summary`) con referencias en `footnote`. Para procesos de varios pasos use `step`/`stepTotal` (indicador «paso n/6»).
- **Código:** `meta.codeLang` fija el lenguaje por defecto (`sql`, `c`, `cpp`, `java`, `csharp`, `rust`, `python`, `pseudo`, `json`, `plain`); cada bloque puede sobrescribirlo con `lang`. Verifique el lenguaje real de los ejemplos (p. ej. CE-1103 «POO» usa C#, no Java). Use mayúsculas de forma coherente con el material (p. ej. identificadores SQL en mayúscula).
- **Accesibilidad:** `alt` en cada imagen; contraste alto (el tema oscuro ya lo cumple); evite emoji y símbolos como ✓/✗ (cambian de fuente); no codifique significado solo con color.

## Elegir el tipo de diapositiva

| Necesita comunicar… | Use |
|---|---|
| Portada | `title` (con `terminal` para la ventana de código) |
| Objetivos, resumen, pasos numerados | `list` / `summary` |
| Secuencia corta (2–4 etapas) | `flow` |
| 3–6 ideas paralelas, propiedades, ventajas, ejercicios | `cards` (con `badge` para numerar o letras) |
| Comparar dos cosas o antes/después | `compare` (con `vs`) |
| Comparar atributos de varias cosas | `table` |
| Código, comandos, consultas, bloques lado a lado | `code` |
| Una imagen de `<curso>\images` | `image` (solo PNG; se enmarca sobre fondo blanco) |
| Esquemas específicos | `diagram` con `kind` (ver `references\spec-reference.md`): árboles/tries → `tree`; transformar una lista paso a paso → `merge-steps`; secuencia de códigos/bits → `bitstream`; ventana deslizante o coincidencias sobre una cadena → `strips`; entrada → salida → `join-result` |

Detalles de campos, valores por defecto y límites de cada tipo: `references\spec-reference.md`.

## Cuando ningún tipo encaja

Extienda el generador en vez de forzar el contenido:

- Nuevo diagrama: función en `presentaciones\generador\lib\diagrams.js`, registrada en `module.exports`, con campos en el spec. Nuevo tipo de diapositiva: `lib\layouts.js`. Primitivas reutilizables (cajas, chips, flechas, tablas, código, tarjetas, callouts): `lib\components.js`.
- **Diagramas específicos de un tema** (o si varios agentes trabajan a la vez): cree `lib\diagrams.<tema>.js`, que exporta `{ '<tema>-<nombre>': (ctx, spec) => … }`. `diagrams.js` lo carga solo y falla si un `kind` se repite. **Antes de crear uno, revise las extensiones existentes** (lista en `presentaciones\generador\README.md`, sección «Extensiones por tema»): hay diagramas reutilizables de arreglos con estados, nodos enlazados, árboles, grafos y trazas paso a paso. Use `require('./components')` para las primitivas y copie el patrón de `diagrams.js` (`header` ya lo dibuja `layouts.diagram`).
- Use **solo colores semánticos** del tema (`colors.heading`, `colors.panel`, `ctx.T.<tono>.accent/on/text/soft`, etc.); nunca hexadecimales fijos, para que `meta.theme: "dark" | "light"` siga funcionando.
- Otro lenguaje de código: agréguelo a `LANGS` en `lib\components.js` (palabras clave, tipos, marca de comentario).
- Documente el campo nuevo en `references\spec-reference.md` y en `presentaciones\generador\README.md`.

## Trampas conocidas

- **Letras griegas (Θ, Ω, ε, Σ…):** en algunos equipos PowerPoint falla al exportar si una fuente normal (Calibri, Arial…) trae griego. `lib\postprocess.js` ya separa el griego en una corrida con `Segoe UI Symbol`, así que puede escribir Θ(n), Ω(n) con normalidad en cualquier texto, tabla o tarjeta. Consolas (código) no necesita el cambio.
- **Marcado en celdas:** las celdas de `table` también interpretan `**negrita**` y `` `código` ``. No hay cursiva: evite `*texto*` (los asteriscos se muestran).
- **PowerPoint «could not open the file»:** casi siempre una forma o un texto con alto negativo/nulo, o una forma no válida generada por pptxgenjs, p. ej. `rectRadius` aplicado a una elipse (`text()` ya fuerza un alto mínimo). Para localizarla, construya una presentación de una sola diapositiva por cada diapositiva del spec y ábralas con COM (`Presentations.Open`); la que falle es la culpable. Si `render.ps1` falla por un proceso huérfano, cierre solo ese proceso `POWERPNT` con `Stop-Process -Id <PID>`.
- **Ediciones por texto en el spec:** el JSON creado por las herramientas puede tener finales de línea CRLF; si hace reemplazos de varias líneas con PowerShell, normalice con `-replace "`r`n","`n"` antes de comparar y escriba UTF-8 sin BOM. Para cambios puntuales use la herramienta de edición.
- Las propiedades de párrafo (viñetas, espaciado) solo van en la primera corrida de cada párrafo; en otra corrida abren un párrafo nuevo (ya resuelto en `paragraphs()`).
- Las tablas crecen en PowerPoint si el texto no cabe, y empujan lo que está debajo: acorte el texto o ensanche columnas, y deje un margen antes del `callout`. Las mayúsculas son ~25 % más anchas que las minúsculas.
- Anchos aproximados: Calibri ≈ 0.45–0.5 em por carácter; Consolas 0.55 em (14 pt ≈ 0.107 in, 16 pt ≈ 0.122 in). Un bloque de código no hace *wrap*: ensanche la columna (`weight`) o reduzca `codeSize`/sangría.
- Los títulos de tarjeta no deben ocupar dos líneas (en 3 columnas, ≤ ~20 caracteres a 22 pt): acórtelos.
- Escribir en el repo: use las herramientas de crear/editar archivos; el shell solo para ejecutar el generador y los scripts.
