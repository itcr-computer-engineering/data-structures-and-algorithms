# Algoritmos de Compresión
Comprimir se refiere a reducir la cantidad de bits requeridos para representar un conjunto de datos. Los algoritmos de compresión se utilizan para reducir el tamaño de los archivos y, por lo tanto, ahorrar espacio en disco y acelerar la transferencia de datos a través de la red.

En este capítulo veremos conceptos fundamentales de compresión junto con algorimos comunes.

## Tipos de compresión
Comúnmente, los algoritmos de compresión se dividen en dos categorías principales: compresión sin pérdida y compresión con pérdida.

### Compresión con pérdida (lossy)
Reducen el tamaño de los datos identificando información innecesaria y eliminándola. Este tipo de compresión se utiliza comúnmente en archivos de audio, video e imágenes. La compresión con pérdida es irreversible, lo que significa que los datos originales no se pueden recuperar después de la compresión.

Utiliza métodos de codificación que generan representaciones inexactas de los datos originales. La calidad de los datos comprimidos se mide en términos de la cantidad de información que se pierde durante la compresión. Los algoritmos _lossy_ normalmente exponen parámetros de calidad, lo que permite ajustar el balance entre tasa de compresión y degradación de calidad evidente para el usuario final.

![Ejemplo compresión de imágen PNG](./images/06-compresion/image-01.png)

La compresión con pérdida se utiliza comúnmente en aplicaciones donde la calidad de los datos no es crítica, como la transmisión de video en línea y la transmisión de audio. Los formatos de alta fidelidad o _raw_ tiende a ser de tamaño muy grande y sin compresión _lossy_ streaming de audio y video no sería posible para la gran mayoría de los usuarios.

![Ejemplo compresión de imágen PNG](./images/06-compresion/image-02.png)

#### Percepción de la calidad
La distorsión es la diferencia entre los datos originales y los datos comprimidos. La distorsión se mide en términos de la calidad de los datos comprimidos en comparación con los datos originales. 

Aunque se puede definir modelos matemáticos para medir la distorsión, la percepción de la calidad es subjetiva y depende de la sensibilidad del observador. La percepción de la calidad se mide en términos de la cantidad de distorsión que un observador puede tolerar antes de que la calidad de los datos comprimidos se considere inaceptable. Por ejemplo, para un archivo de audio, un audiofilo puede ser más sensible a la distorsión que una persona promedio.

Los algoritmos de compresión con pérdida, buscan optimizar la percepción de calidad según los atributos fisio-psicológicos del ser humano. Por ejemplo, en el caso de la compresión de imágenes, la compresión JPEG se basa en la percepción visual humana y elimina los detalles menos perceptibles para el ojo humano. En el caso de la compresión de audio, la compresión MP3 se basa en la percepción auditiva humana y elimina los sonidos menos perceptibles para el oído humano (frequencia del sonido medida en Hz).

> Para aprender más sobre JPEG, vea el video en este [enlace]'(https://www.youtube.com/watch?v=0me3guauqOU&t=1976s).

### Compresión sin pérdida (lossless)

## Referencias
https://www.geeksforgeeks.org/what-are-data-compression-techniques/