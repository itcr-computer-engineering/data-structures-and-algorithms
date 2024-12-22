# Introducción

## Definición de algoritmo:

- Conjunto de instrucciones finitas para resolver un problema

- ### <u> Recta de cocina:</u>

- Input: Ingredientes

- Output: Comida

- Instrucciones: Algoritmo

### <u>Características:</u>

- <u>No son ambiguos</u>: cada paso tiene un solo significado

- <u>Entrada bien definida</u>: Debe ser clara y consistente

- <u>Salida bien definida</u>: Debe indicar que tipo de output genera

- <u>Finitos</u>: Terminan en un tiempo determinado.

- <u>Factibles</u>: Pueden ser ejecutados con los recursos tecnológicos
  disponibles

---

¿Programa vs Algoritmo?  
Un programa es la implementación de un algoritmo en un lenguaje de
programación.

---

## Representación de un algoritmo:

- Pseudo código

- Lenguaje natural

- Definición formal

- Diagramas de flujo

### Complejidad:

- Cantidad de recursos utilizados para resolver una tarea
  (Tiempo/Memoria/Disco)

- Complejidad Temporal es la más común seguida por la complejidad
  especial/memoria

- Meta: Reducir tiempo y memoria

<u>Time complexity:</u> Función del tiempo según el tamaño del imput

F(input) -\> tiempo

Tiempo se refiere a la cantidad de comparaciones, Accesos a mem,
…Operaciones elementales

- <u>Space complexity</u>: f(input) -\> memoria usada

---

La(s) estructuras(s) de datos usadas en un algoritmo, tienen un efecto
claro en la complejidad.

---

## Análisis de algoritmos:

- Determinar tiempo y espacio requerido para ejecutar un algoritmo

## ¿Porqué analizar algoritmos?

- Predecir comportamiento

- Comparar distintos algoritmos para el mismo propósito.

- Optimizar

- Clasificar según complejidad

### <u>Tipos:</u>

- Empírico

- Teórico

### Análisis empírico

- Ejecutar un programa para evaluar el desempeño real

- Conocido como bench mark

- Fácil de entender y calcular

- No es independiente del hardware

- Requiere ejecutar el programa

- Muy utilizado en la práctica junto con pruebas A/B para identificar
  mejoras o regrsiones.

- Se usa un enfoque de percentiles.

<u>Percentil:</u> Indica el % de valores que son inferiores a cierto valor D75,
P95, P99

Usar promedios puede ser engañoso

Otra forma de análisis empírico es el ´profiling´. Es una técnica de
análisis dinámico para encontrar cuellos de botella o secciones de la
app econ mal rendimiento. Provee una visión completa: CPU, rendering,
caching.

## Notas adicionales:

- El algoritmo es la abstracción del programa

### Complejidad:

Se busca una function que crezca lento respecto al input, o que sea
constante.

Las estructuras de datos evolucionan con el fin de mejorar el tema de la
complejidad.

### <u>Big Data:</u>

Surge cuando comienzan a haber fuentes de datos no
estructurados.

### <u>Datos estructurados:</u>

Tienen una estructura fija (como una tabla de
Excel)

### <u>Datos no estructurados:</u>

Se encuentran en redes sociales (Mensajes en
json, comentarios en publicaciones…)

Es un conjunto de tecnologías que se usan con el fin de tratar
cantidades descomunales de datos estructurados y no estructurados.

### <u>Empírico:</u>

Algo que no tiene una formación básica. Ejemplo (Un ingeniero
que aprendió todo por medio de tutoriales de youtube)

En el análisis empírico, se analiza el algoritmo ejecutándolo. Se
utiliza mucho en la practica.

### <u>A/B testing:</u>

Hay un grupo tratamiento y un grupo de control. Cuando se
saca un feature, se realiza de manera controlada. A algunos usuarios se
les muestra y a otros no. Se comparan los datos de la app/pagina en cada
uno de los grupos y se va liberando a más grupos.

### <u>Percentiles:</u>

Lo que se hace es buscar un umbral y se usa el porcentaje
para definir para cuantos usuarios es eficiente y a cuantos no.

Análisis de algoritmos es determinar el tiempo y espacio requerido por un algoritmo para ejecutarse. El estudio de algoritmos se remonta al trabajo de _Charles Babbage_ y de _Alan Turing_.

> La máquina analítica de Babbage requería esfuerzo físico para configurarse, es por tanto entendible el interés de Babbage en la eficiencia de los algoritmos, dado que esto reduciría el esfuerzo físico requerido.

## ¿Por qué analizar algoritmos?

- Predecir el comportamiento
- Comparar distintos algoritmos para el mismo propósito (búsqueda, ordenamiento, etc.)
- Optimización
- Clasificar problemas según su complejidad
