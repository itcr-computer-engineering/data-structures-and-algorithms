# Lista de revisión visual

Para cada hoja de contacto y cada diapositiva sospechosa a tamaño completo (`render\slide-NN.png`). Corrija en el spec y repita `build.js` → `render.ps1` → `contact-sheet.ps1` hasta que todo pase.

## Debe cumplirse

- [ ] **Sin desbordes:** ningún texto sale de su tarjeta, panel, chip o diapositiva; ningún bloque de código se corta en el borde derecho (`render.ps1` solo detecta formas fuera de la diapositiva, no texto que se sale de su caja).
- [ ] **Sin solapes:** `callout`, tarjetas, tablas y rótulos no se pisan entre sí ni con el pie (y ≥ 7.0). Las tablas que crecieron por texto largo empujan lo que está debajo.
- [ ] **Sin palabras partidas ni títulos de tarjeta en dos líneas** (p. ej. `PRODUCTO_I / D` en una celda); sin viudas de una palabra en una viñeta.
- [ ] **Texto legible:** ≥ 14 pt en contenido (solo pie, referencias y etiquetas menores pueden ser menores); contraste alto.
- [ ] **No abrumador:** una idea por diapositiva, ≲ 5 viñetas, ≲ 25 palabras por tarjeta, ≤ 6 filas de tabla. Si no cabe, divida o pase el detalle a `notes`.
- [ ] **Equilibrio:** sin grandes vacíos (> ~1.5 in) ni contenido pegado a un borde; flechas y rótulos alineados con lo que señalan.
- [ ] **Consistencia:** mismos nombres, datos y capitalización que en las diapositivas anteriores y el capítulo; el tono (`teal`, `amber`, `red`, `green`) coincide con su significado.
- [ ] **Contenido fiel y correcto:** coincide con el capítulo; lo añadido está verificado.
- [ ] **Notas del orador** presentes en las diapositivas con contenido denso o ejercicios.

## Ajustes frecuentes

| Síntoma | Corrección |
|---|---|
| Callout sobre una tabla | Reducir filas/texto; en `table` el callout se coloca tras la tabla (máx. y 5.9). |
| Tarjetas con mucho espacio vacío | Bajar `cardHeight` o subir `textSize`; añadir `callout` debajo. |
| Texto de tarjeta cortado | Subir `cardHeight`, bajar `textSize` o acortar el texto. |
| Código cortado a la derecha | Subir el `weight` de esa columna, bajar `size`/`codeSize` o reducir la sangría. |
| Panel `compare` demasiado alto/vacío | Usar `panelHeight` y subir `textSize`/`itemSize`. |
| Diapositiva `code` con bloques que chocan con callouts | Usar `top`, `calloutsY`, `calloutsH` o dividir en dos diapositivas. |
| Celda de tabla/conector desalineado | Ajustar `colW`/`colWeights`; recordar que las mayúsculas ocupan más ancho. |
| Título largo | Acortar a una línea; el detalle va en `intro` o `notes`. |

## Hojas de contacto y detalle

1. `contact-sheet.ps1` genera `render\sheet-NN.png` (2 × 3 diapositivas); úselas para detectar patrones.
2. Abra a tamaño completo las diapositivas con tablas, diagramas, código denso o conectores.
3. Tras corregir, vuelva a renderizar y revise **solo** lo modificado y lo que pudo moverse (callouts, diapositivas siguientes con el mismo layout).
