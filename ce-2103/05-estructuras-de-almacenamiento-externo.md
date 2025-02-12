# Estructuras de almacenamiento externo

La jerarquía de memoria, se puede representar con la siguiente pirámide:

![Jerarquía de memoria](./images/estructuras-almacenamiento-externo-01.png)

Conforme se "sube" en la jerarquía, la cantidad de memoria disminuye pero el costo y velocidad de la misma aumentan. Conforme se desciende, el costo y velocidad disminuyen pero la cantidad de memoria aumenta. Es por eso, que el cache, es una memoria muy rápida pero de poca capacidad, mientras que el disco duro es una memoria lenta pero de gran capacidad.

## Conceptos esenciales

- **Dato**: Sucesión de símbolos representados con números o letras. No contienen ninguna información en sí mismo, sino que representan un _hecho_ con algún significado dado por una unidad y su magnitud. Requieren organización y procesamiento para extraer información. Por ejemplo: _$10, 20 años, 3 kg, 10 metros, 22 km_.

- **Información**: Es la interpretación significativa de los datos

- **Sistemas de almacenamiento**: Sistemas para almacenar datos en formato binario sin importar la información que se pueda extraer de dichos datos. Solo ven bloques crudos de bits.

## Discos Duros (Hard-disk drives)

> No deben confundirse con discos de estado sólido (SSD).

Son dispositivos de almacenameinto persistente que mantiene la información almacenada incluso cuando no están siendo alimentados con electricidad.

- Los datos se almacenan mediante magnetización de partículas dentro del material magnético de los discos.

- El disco es capaz de leer los datos al detectar los patrones de magnetización creados al escribir los datos.

### Componentes

- _Platos_: Discos circulares de material magnético en ambas caras
- _Eje_: sostiene uno o más platos conectados a un motor que gira los platos a un RPM constante.
- _Brazo actuador_: Mueve las cabezas de lectura/escritura a lo largo de los platos.
- _Cabezales_: Dispositivos electromagnéticos que leen y escriben datos en los platos.
- _Hard disk assembly_: Combinación de los platos, eje, brazo actuador y cabezales.

### Funcionamiento

La velocidad del giro influencia directamente a la velocidad de I/O. A mayor velocidad, mayor consumo energético y mayor costo.

- Velocidaddes para uso general (consumidor):

  - 5400 RPM
  - 7200 RPM

- Velocidades para uso profesional (servidores):
  - 10000 RPM
  - 15000 RPM

Los datos se escriben en círculos concentricos llamados _pistas_ y se dividen en _sectores_. Un sector es la unidad mínima de almacenamiento en un disco duro y generalmente tiene un tamaño de 512 bytes.

![](./images/estructuras-almacenamiento-externo-02.png)

![](./images/estructuras-almacenamiento-externo-03.jpeg")

![](./images/estructuras-almacenamiento-externo-04.jpg")

### Tiempos de acceso

El tiempo de búsqueda (_seek time_) es el tiempo que tarda el brazo actuador en moverse a la pista deseada (8 - 10ms en discos de 7200 RPM). El tiempo de latencia es el tiempo que tarda el sector deseado en pasar por debajo de la cabeza de lectura/escritura (4 - 5ms en discos de 7200 RPM).

El tiempo de acceso total es la suma del tiempo de búsqueda y el tiempo de latencia.

### Tiempo de transferencia

Los discos duros tienen un tiempo de transferencia que es el tiempo que tarda en leer o escribir un bloque de datos. Este tiempo depende de la velocidad de rotación del disco y de la densidad de los datos. Por ejemplo, un disco de 7200 RPM tiene un tiempo de transferencia de 0.5ms.

El _external data rate_ es la cantidad de datos que se pueden transferir por segundo. Por ejemplo, un disco de 7200 RPM con un external data rate de 300MB/s puede transferir 300MB de datos por segundo.

### Interfaces

El HDD se conecta a otros components de la computadora a través de una interfaz. Las interfaces más comunes son:

- PATA (Parallel Advanced Technology Attachment)

  - Interfaz de 40 pines que se conecta a la placa madre.
  - Velocidad de transferencia de 133MB/s.
  - No es hot-swappable.
  - No se usa en la actualidad.
  - Solo para discos internos

- SATA (Serial Advanced Technology Attachment)

  - Evolución de PATA.
  - Estandar en computación moderna.
  - Velocidad de transferencia de 600MB/s.
  - Bajo consumo energético.
  - Hot-swappable.

- SCSI (Small Computer System Interface)

  - Interfaz de alta velocidad.
  - Se usa en servidores y estaciones de trabajo.
  - Hot-swappable.

- SAS (Serial Attached SCSI)
  - Evolución de SCSI.
  - Velocidad de transferencia de 12GB/s.
  - Hot-swappable.
  - Se usa en servidores y estaciones de trabajo.

## Discos de Estado Sólido (SSD)

No son discos duros, sino dispositivos de almacenamiento de estado sólido que utilizan memoria flash para almacenar datos. No tienen partes móviles, lo que los hace más rápidos y menos propensos a fallas que los discos duros.

- Utiliza memoria flash para almacenar datos.

- Menor acceso aleatorio que los discos duros.

- No tiene latencia de búsqueda.

- Writes limitados (menor tiempo de vida útil).

- El precio es más alto que los discos duros.

### Componentes

- **Controlador**: Procesador que ejecuta el firmware y es responsable de la gestión de la memoria, la corrección de errores y la interfaz con el sistema operativo.

- **Memoria NAND**: Memoria flash que almacena los datos. Se divide en celdas que pueden ser de tipo SLC, MLC, TLC o QLC.

- **DRAM**: Memoria volátil que se utiliza para almacenar datos temporales y mejorar el rendimiento.

- **Firmware**: Software que controla el funcionamiento del SSD.

- **Conector**: Interfaz que conecta el SSD a la placa madre. Los conectores más comunes son SATA y PCIE (utilizando el protocolo NVMe).

- **Form factor**: Tamaño y forma del SSD. Los form factors más comunes son 2.5", M.2 y U.2. También existen SSDs en formato de tarjeta de expansión PCIe.

### Desempeño

La transferencia de datos de un SSD es mucho más rápida que la de un disco duro. Los SSDs modernos pueden alcanzar velocidades de lectura de hasta 550 MB/s y velocidades de escritura de hasta 520 MB/s. Un SSD PCIe NVMe puede alcanzar velocidades de lectura de hasta 3500 MB/s y velocidades de escritura de hasta 3300 MB/s.

## Particionamiento de discos

Un solo disco físico puede ser dividido en varias particiones, cada una de las cuales se comporta como un disco independiente (lógico). Las particiones se pueden formatear con diferentes sistemas de archivos y se pueden montar en diferentes puntos de montaje.

En enlace entre lo físico y lo lógico se hace a través de la _metadada_ almacenada en la tabla de particiones. La tabla de particiones es un registro que contiene información sobre las particiones del disco, como su tamaño, ubicación y tipo de sistema de archivos. Esta tabla se encuentra en el primer sector del disco (MBR) y es leída por el sistema operativo al arrancar.

Una partición puede existir sin inicializarse.

### Volumen

Es una partición inicializada con un _sistema de archivos_. Es la interfaz lógica que utiliza el sistema operativo para acceder a los datos almacenados en el disco.

## Sistemas de archivos
El sistema de archivos puede entender como la abstracción que provee el Sistema Operativo para acceder a los datos almacenados en el disco (interfaz lógica entre usuario y la capa física de almacenamiento). Determina la forma en que los archivos son nombrados, organizados y almacenados en el disco. Almacena metadata/atributos de los archivos. Por ejemplo el nombre, tamaño, fecha de creación, etc.

Hay distintos sistemas de archivos conocidos y usualmente se asocian con uno u otro Sistema Operativo.  Por ejemplo, Windows utiliza _NTFS_, Linux utiliza _ext3_ o _ext4_, MacOS utiliza _HFS+_, y así por el estilo.

El sistema de archivos requiere espacio en disco para almacenar la metadata. Por ejemplo, si se tiene un archivo de 1 KB, el sistema de archivos necesita espacio adicional para almacenar la metadata del archivo (nombre, tamaño, fecha de creación, etc.). Por tal motivo, posterior a formatear un disco, el espacio disponible es menor al espacio total del disco.

### Propósito
Algunas de las funcionalidades principales del sistema de archivo incluyen:

- Nombrar y organizar archivos.
- Proveer un API para el acceso a los archivos: Creación, lectura, escritura, eliminación, etc.
- Almacenar un índice de archivos y directorios.
- Gestionar permisos y restricciones de acceso para mantener la integridad y seguridad de los datos.
- Funciones avanzadas como compresión, cifrado, cuotas de disco, etc.

## Archivos

Se puede definir como el mecanismo de abstracción para hacer transparente al usuario, los detalles complejos del disco. Dicha abstracción provee un "canal de comunicación" para poder ejecutar operaciones como:

- Leer bytes
- Escribir bytes
- Desplazarse a una posición específica en el disco

Un archivo se puede procesar de varias formas:

- **Acceso secuencial**: byte por byte desde el principio hasta el final según el orden en que fueron escritos.

- **Acceso aleatorio**: acceso directo a cualquier parte del archivo (conocido como acceso directo) independientemente del orden de escritura.

> Acceso secuencial es más rápido que el acceso aleatorio, pero el acceso aleatorio es más flexible.

- **Acceso indexado**: acceso a través de un índice que contiene la ubicación de los datos. Depende de la estructura y propósito del archivo. Por ejemplo, si es un archivo que contiene registros de clientes, un índice puede mapear el identificador de cada cliente, a la posición de su registro en el archivo. Precursor de las bases de datos.

### Estructura de un archivo

Las estructuras más comunes de archivos son:

- Secuencia de bytes
- Registros de tamaño fijo
- Árboles de registros

#### Secuencia de bytes

En este caso, se trata de archivos planos que contienen una secuencia de bytes. No tienen estructura interna y se pueden leer o escribir byte por byte. El sistema operativo no tiene conocimiento de la estructura interna del archivo, por lo que no puede realizar operaciones avanzadas como búsqueda o indexación.

Los archivos se reducen a ser "cubetas" de bytes, maximizando la flexibilidad. Windows/Linux/MacOS utilizan este tipo de archivos.

#### Registros de tamaño fijo

En este caso, el archivo se organiza en registros de tamaño fijo. Cada registro contiene una estructura de datos con campos de tamaño fijo. Los registros se pueden leer o escribir de forma secuencial o aleatoria. Este tipo de archivos permite realizar operaciones de búsqueda y ordenamiento.

Al crear un archivo de registros de tamaño fijo, se debe especificar la estructura de cada registro. Por ejemplo, si se tiene un archivo de registros de empleados, cada registro puede contener los campos: nombre, apellido, edad, salario, etc.

Muy utilizados en mainframes y bases de datos.

#### Árboles de registros

Similar al caso anterior, pero en lugar de almacenar los registros de forma secuencial, se almacenan en una estructura de árbol. Cada nodo del árbol contiene un registro y apunta a otros nodos. Este tipo de archivos permite realizar operaciones de búsqueda y ordenamiento de forma eficiente.

### Tipos de archivos

- **Archivos regulares**: Contienen datos de usuario. Pueden ser de texto o binarios.
- **Directorios**: Archivos que contienen una lista de archivos y directorios. Son partes esenciales del sistema de archivos.
- **Character special files**: Representan dispositivos de caracteres, como terminales y puertos serie.
- **Block special files**: Representan dispositivos de bloques, como discos duros y unidades flash.
- **Sockets**: Archivos que permiten la comunicación entre procesos.
- **Pipes**: Archivos que permiten la comunicación entre procesos.
- **Symbolic links**: Archivos que apuntan a otros archivos.
- **Binary files**: Archivos que contienen datos binarios, como imágenes, videos, etc.

## Cache

- El cache se basa en el principio de localidad, que establece que los programas tienden a acceder a un conjunto reducido de direcciones de memoria en un corto periodo de tiempo.
- El concepto de caching puede ser aplicado e cualquier capa de computación, como CPU, disco, red, etc
- Se puede aplicar en distintas capas de la arquitectura de un sistema de información.
- Busca mantener datos usados frecuentemente en una ubicación óptima: cercano al usuario, cercano a la aplicación, en memoria más rápida, etc.

### Funcionamiento general

1. Se solicita un dato
2. Se busca en el cache
3. Si se encuentra, se devuelve al usuario (cache hit)
4. Si no se encuentra, se busca en la fuente original (cache miss) y se almacena en el cache para futuras solicitudes.

### Operaciones en el cache

Dado que la capacidad de un caché es limitada, usarlo de forma eficiente es crucial. Las operaciones más comunes son:

- **Hit**: Cuando la información solicitada se encuentra en el caché.
- **Miss**: Cuando la información solicitada no se encuentra en el caché.

Cada vez que se produce un _miss_, se debe decidir qué información se debe eliminar del caché para hacer espacio para la nueva información. Existen diferentes políticas de reemplazo, como _Least Recently Used_ (LRU), _First In First Out_ (FIFO), _Least Frequently Used_ (LFU), _Most Recently Used_ (MRU), etc. Veamos algunas de estas

#### Least Recently Used (LRU)

La política LRU reemplaza la entrada que no ha sido utilizada por más tiempo. Es la política más común y se basa en la idea de que si un elemento no ha sido utilizado recientemente, es menos probable que se utilice en el futuro.

#### First In First Out (FIFO)

La política FIFO reemplaza la entrada que ha estado en el caché por más tiempo. Es la política más simple y se basa en la idea de que los elementos que han estado en el caché por más tiempo son menos probables de ser utilizados en el futuro.

#### Least Frequently Used (LFU)

La política LFU reemplaza la entrada que ha sido utilizada menos veces. Se basa en la idea de que los elementos que han sido utilizados menos veces son menos probables de ser utilizados en el futuro.

#### Most Recently Used (MRU)

La política MRU reemplaza la entrada que ha sido utilizada más recientemente. Se basa en la idea de que los elementos que han sido utilizados más recientemente son más probables de ser utilizados en el futuro.

### Tipos de cache a nivel general

#### En memoria

Se almacena en la memoria RAM. Se utiliza para almacenar datos que se acceden con frecuencia a nivel del proceso.

#### Caché de disco

Se almacena en el disco duro. Se utiliza para almacenar datos que se acceden con frecuencia a nivel del disco. Por ejemplo, los datos de un archivo que se accede con frecuencia.

#### Caché distribuido

Se almacena en varios servidores. Se utiliza para almacenar datos que se acceden con frecuencia a nivel de la red. Por ejemplo, los datos de un sitio web que se accede con frecuencia.

### Tipos de cache a nivel específicos

#### Application server cache

Es una especialización del cache en memorira. Se almacena en la memoria RAM del servidor de aplicaciones. Se utiliza para almacenar datos que se acceden con frecuencia a nivel de la aplicación.

#### Caché global

Se almacena en varios servidores. Se utiliza para almacenar datos que se acceden con frecuencia a nivel global. Por ejemplo, los datos de un sitio web que se accede con frecuencia en todo el mundo.

## Algoritmos de ordenamiento externo

Los algoritmos de ordenamiento externo son algoritmos que se utilizan para ordenar grandes conjuntos de datos que no caben en la memoria principal. Usualmente utilizan un enfoque híbrido que combina la memoria principal y la memoria secundaria para ordenar los datos.

Algunos de estos algoritmos incluyen:
- External merge
- External merge-sort

### External merge
Suponga que se necesitan unir dos archivos **ordenados** que no caben en memoria. El algoritmo de _external merge_ divide los archivos en bloques que caben en memoria, los ordena y los guarda en un archivo temporal. Luego, combina los bloques ordenados en un solo archivo ordenado. Si cada bloque es de tamaño _n_, en memoria se mantendrán tres frames de tamaño _n_. 

![](./images/05-estructuras-almacenamiento-externo/image-05.png)

Se leen los primeros bloques de ambos archivos en memoria

![](./images/05-estructuras-almacenamiento-externo/image-06.png)

Usando el frame temporal, se van comparando los elementos de ambos bloques y se ordena en dicho frame. Cuando el frame temporal se llena, se escribe en el archivo de salida.

![](./images/05-estructuras-almacenamiento-externo/image-07.png)

![](./images/05-estructuras-almacenamiento-externo/image-08.png)

![](./images/05-estructuras-almacenamiento-externo/image-09.png)

![](./images/05-estructuras-almacenamiento-externo/image-10.png)

![](./images/05-estructuras-almacenamiento-externo/image-11.png)

### External merge-sort
Para ordenar un archivo cuyos elementos están desordenados, podemos aplicar una forma del algoritmo tradicional de merge-sort. En merge-sort en memoria, el array se divide en sub-array en memoria. En el caso de _external merge-sort_, en vez de crear sub-array en memoria se crean *archivos temporales en disco* de tamaño incremental que actúen como dichos sub-arrays. Cada archivo temporal se llama _run_.

El algoritmo irá creando runs de tamaño 1, tamaño 2 y así sucesivamente hasta que se logre ordenar el archivo completo. Un _run de tamaño 1_ es el bloque mínimo de datos (_pages_) que se puede tener en memoria. La cantidad de elementos de dicho bloque dependerá de la naturaleza de los datos en el archivo.

En memoria únicamente se mantiene tres frames. En cada frame cabe un run de tamaño 1. Estos frames se ordenan aplicando el algoritmo de _external merge_ como veremos más adelante.

El proceso es el siguiente para la _etapa de división_:

1. Se realiza una pasada inicial para leer página por página del archivo.
2. Se ordena cada página y se escribe en un archivo temporal (_run_ de tamaño 1). Se generan n archivos temporales, donde _n_ es la cantidad de páginas del archivo original

Para la _etapa de mezcla_, se sigue el siguiente proceso:

1. Por cada página de cada run i, se carga una página de cada uno en memoria y se aplica ordenan en un nuevo frame. Dicho frame se escribe en un nuevo run de tamaño i+1.
2. Se repite el proceso por cada set de _runs_

La visualización del algoritmo en [este enlace](https://valeriodiste.github.io/ExternalMergeSortVisualizer/External%20Merge%20Sort%20Visualizer/index.html) es súmamente útil. A continuación se adjunto algunas capturas de la misma.

Por ejemplo, el estado inicial es el siguiente:

![](./images/05-estructuras-almacenamiento-externo/image-12.png)

Posterior a la etapa de división, tenemos 4 runs de tamaño 1:

![](./images/05-estructuras-almacenamiento-externo/image-13.png)

En la etapa de mezcla, observe como se las primeras páginas (y únicas en este caso) de los primeros dos runs de tamaño 1:

![](./images/05-estructuras-almacenamiento-externo/image-14.png)

Cada vez que el buffer se llena, se escribe en un nuevo run de tamaño 2:

![](./images/05-estructuras-almacenamiento-externo/image-15.png)

Se repite el proceso con los runs de tamaño dos. Y así sucesivamente hasta que se logre ordenar el archivo completo.

![](./images/05-estructuras-almacenamiento-externo/image-16.png)

> Se pueden hacer mejoras sobre el algoritmo de _external merge-sort_ como el uso de _multiway merge_ para reducir el número de pasadas sobre el archivo.

## Referencias
- https://www.geeksforgeeks.org/external-sorting/
- Koutris. P. CS 564 [Spring 2018]. https://pages.cs.wisc.edu/~paris/cs564-s18/lectures/lecture-16.pdf
- https://valeriodiste.github.io/ExternalMergeSortVisualizer/External%20Merge%20Sort%20Visualizer/index.html