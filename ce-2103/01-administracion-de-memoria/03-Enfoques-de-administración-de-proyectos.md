# Evolución de la Administración de memoria

Los sistemas operativos evolucionan y mejoran la administración, esto con el fin de cumplir con los requerimientos de los clientes finales.
Por ejemplo:

- Ejecutar varios procesos "a la vez" con un solo CPU el S.O "presta" el CPU por tiempo (QUANTA), cambia contexto y ejecuta otro programa.

## 1^er^ Enfoque: Ninguna Abstracción

- Acceso directo a la memoria principal, fisica, sin ninguna abstracción. Direcciones de memoria generadas en tiempo de compilación o carga (se generan de forma estática)
- Inicialmente no permitía la multiprogramación

Multiprogramación
<!-- ![memoria.png](https://github.com/JBB092/Datos-II/blob/main/LayoutMemoria.png?raw=true) -->

- Posteriormente se logra la multiprogramación mediante _static relocation_. El _static recolation_ consiste en que al cargar el programa, se ajustan las direcciones considerando la dirección inicial de donde se carga un programa.

# 2^do^ enfoque: espacios de direcciones

- Similar a los números telefónicos: Un bloque de números asignados a ciertas zonas.
- Cada programa tiene un grupo de direcciones asignadas.
- Requiere cambios en el hardware para “ajustar” las direcciones. En tiempo real.
- Esta traducción se le conoce como Dynamic Relocation.
- El programa completo debe caber en el RAM para poder ejecutarse.

<!-- ![Untitled](Clase%202%20-%209%202%202024%20bc85ecfa5c4e49f49e41b79383c208ee/Untitled.jpeg) -->

# 3^er^ enfoque: Memoria virtual

- Nuevo requerimiento: Ejecutar un programa más grande que la memoria total.
- Programa requiere de 16GB de RAM, pero tengo 512 MB → Funciona lento, pero funciona.
- En un sistema operativo de 32 bits un proceso tendrá un espacio de direcciones de ~ 4GB. Si la memoria física son solo 16 B :

<!-- ![Untitled](Clase%202%20-%209%202%202024%20bc85ecfa5c4e49f49e41b79383c208ee/Untitled%201.jpeg) -->

- La memoria virtual agrega una capa de indirección que “traduce”. Requiere Hardware especializado, conocido como

MMU → Memory Mapping Unit

<!-- ![Untitled](Clase%202%20-%209%202%202024%20bc85ecfa5c4e49f49e41b79383c208ee/Untitled%202.jpeg) -->

- El address space del programa se divide en Frames

Page size = framesize

<!-- ![Untitled](Clase%202%20-%209%202%202024%20bc85ecfa5c4e49f49e41b79383c208ee/Untitled%203.jpeg) -->

- Dado que los frames se acaban, se utilizan un algoritmo de reemplazo para quitar el contenido de un frame, guardarlo a disco, y subir la página.

Solicitud → SWAP

# Memory layout de un programa en C / C++

- El layout depende del lenguaje/compilador que el sistema operativo respeta.
- No es un bloque contiguo, la estrategia/enfoque de administración de memoria se aplica sobre todo el layout transparentemente.
  <!-- ![](Clase-14-Feb-2024/Memory-Layout.png) -->

## Stack

- Utiliza un stack (estructura de datos) cuya naturaleza es _LIFO_.
- Cada entrada se llama STACK FRAME.
- Hay un stack frame por cada llamada a una función (Call stack).
- Al terminar la función se elimina el frame.

_Consideraciones importantes:_ - Las variables locales almacenables en el stack deben ser de tamaño conocido al momento de la compilación. Por esta razón, memoria dinámica como listas enlazadas no puede almacenarse en stacks. - El stack es bug-free y amigable.

## Componentes de cada FRAME

- Espacio para las variables locales (automáticas).
- Número de instrucción donde regresar una vez terminada la función.
- Espacio para los argumentos y el return value.
<!-- 
A continuación un ejemplo del comportamiento de los stack frames a partir del código siguiente:
![](Clase-14-Feb-2024/Sample-Code.png)

Se crea el stack frame de la función _main_ y se ejecuta la primera instrucción de la misma.
![](Clase-14-Feb-2024/Stack-F1.png)
La función _main_ hace una llamada a la función _foo_ así que se crea el stack frame de la función _foo_ y se ejecuta la primera instrucción de la misma.
![](Clase-14-Feb-2024/Stack-F2.png)
Dado que la función _foo_ hace otra llamada a la función _bar_, se crea otro stack frame para la función _bar_.
![](Clase-14-Feb-2024/Stack-F3.png)
Luego de terminar de ejecutar la función _bar_, se elimina su stack frame y se continúa con la siguiente línea de la función _foo_ que también termina de ejecutarse, entonces, nuevamente, se libera un frame stack y volvemos a _main_ para ejecutar la siguiente instrucción de la misma. Dado que nuevamente es una llamada a _foo_, el ciclo que vimos se repetirá una vez más.
![](Clase-14-Feb-2024/Stack-F4.png) -->
