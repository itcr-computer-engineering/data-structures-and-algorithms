# Análisis empírico de algoritmos

Ejecutar un programa paara evaluar el desempeño. Conocido también como _benchmark_.

- Es fácil de entender y calcular
- No es independiente de la máquina. No es lo mismo utilizar un procesador de hace 10 años que uno actual.
- Requiere ejecutar el programa.

Se utiliza mucho en la práctica profesional junto con pruebas A/B para evaluar regresiones o mejoras en una determinada pieza de software.

Se utiliza un enfoque de percentil para evaluar el rendimiento de un algoritmo.

> Percentil se refiere a la posición de un valor en un conjunto de datos ordenados. Por ejemplo, el percentil 90 es el valor que es mayor que el 90% de los datos.

Otra forma de análisis empírico es el _profiling_. Es una técnica de análisis dinámico que permite encontrar "cuellos de botella" o secciones de la aplicación que consumen más recursos. Provee una visión muy completa: tiempo de ejecución, uso de memoria, uso de CPU, etc.
