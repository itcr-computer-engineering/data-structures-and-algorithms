# Administración de Memoria
La administración de memoria conlleva diferentes ideas según el contexto. En el caso de los sistemas operativos, la administración de memoria se refiere a la gestión de la memoria principal de un sistema informático. En el caso del desarrollo de software, la administración de memoria se refiere a la gestión de la memoria de un programa en ejecución. Para lograr existosamente la segunda, se requiere comprender la primera.

En este capítulo, se abordarán los conceptos básicos de la administración de memoria en sistemas operativos y se entra en detalle a la administración de memoria en programas en ejecución.

## Breve introducción a sistemas operativos
Capa de software que interactúa directamente con el hardware, intermediario entre el hardware que posee una computadora y las aplicaciones de software, facilitando la gestión de recursos del sistema.

### El sistema operativo como API para los developers

API corresponde a las siglas de la palabra _Application Programming Interface_, concepto aplicable a varios contextos: API web, API del sistema operativo, API class libraries, etc; en nuestro caso, nos interesa el API del sistema operativo. Sea cual sea el contexto, la idea es la misma: _proveer una capa de abstracción para que los desarrolladores puedan interactuar con un sistema sin necesidad de conocer los detalles de su implementación_.

> Un estándar para las API de los S.O es el **posix**. El posix son las siglas de la palabra en inglés _portable operative interface for unix_. Es un **estándar del IEEE para los APIS del S.O**.

Un ejemplo de API por ejemplo para abrir un archivo, se utiliza la función `fopen` que retorna un  _pointer_ o _handler_ al archivo.

`fptr = fopen("archivo.txt")`

### El sistema operativo como administrador de los recursos de la máquina.
El hardware es complejo. Si no hubiera un ente especializado en la administración de los recursos de la máquina, los desarrolladores tendrían que lidiar con la complejidad del hardware directamente. El sistema operativo se encarga de la administración de los recursos de la máquina, permitiendo a los desarrolladores interactuar con la máquina de forma más sencilla. _El sistema operativo, hace transparentes los recursos de la máquina_.

Los recursos administrados son: 

- CPU
- Memoria Principal
- Discos
- I/O

> **Thread vs Process**
> 
> Un programa es un archivo ejecutable que contiene el código o el conjunto de instrucciones del procesador, que se almacena como un archivo en el disco. Cuando un programa se ejecuta, se carga en memoria y se convierte en un **proceso**. Un proceso activo incluye los recursos administrados por el sistema operativo que el programa necesita para ejecutarse: registros de procesador, contadores de programas. punteros de pila, páginas de memoria, etc.
> 
> Un **thread (hilo)** es un flujo de control dentro de un proceso, y cada hilo tiene su propia pila de llamadas, registros de procesador y estado de ejecución. Multiples hilos comparten el mismo espacio de direcciones de memoria, archivos abiertos, etc. 

## Definición de Administración de Memoria
Es el conjunto de tareas que realiza el sistema operativo para gestionar la memoria principal de una computadora. La administración de memoria es una parte fundamental de los sistemas operativos modernos, ya que permite a los programas ejecutarse sin tener que preocuparse por la gestión de la memoria.

Algunas de las responsabilidades de la administración de memoria son:

- Asignar/Liberar memoria al inicio/fin de un proceso.
- Controlar la memoria asignada a un proceso.
- Minimizar la fragmentación.
- Mantener la integridad de los datos.

La idea de controlar la memoria asignada a un proceso, tiene como fin hacer que el mismo tenga un límite y aislamiento, para que así no afecte a otros procesos en la memoria que se estén ejecutando.

### Evolución de la Administración de memoria

Los sistemas operativos evolucionan y mejoran la administración, esto con el fin de cumplir con los requerimientos de los clientes finales.
Por ejemplo:

- Ejecutar varios procesos "a la vez" con un solo CPU el S.O "presta" el CPU por tiempo (QUANTA), cambia contexto y ejecuta otro programa.

#### 1^er^ Enfoque: Ninguna Abstracción

- Acceso directo a la memoria principal, fisica, sin ninguna abstracción. Direcciones de memoria generadas en tiempo de compilación o carga (se generan de forma estática)
- Inicialmente no permitía la multiprogramación

Multiprogramación
<!-- ![memoria.png](https://github.com/JBB092/Datos-II/blob/main/LayoutMemoria.png?raw=true) -->

- Posteriormente se logra la multiprogramación mediante _static relocation_. El _static recolation_ consiste en que al cargar el programa, se ajustan las direcciones considerando la dirección inicial de donde se carga un programa.

#### 2^do^ enfoque: espacios de direcciones

- Similar a los números telefónicos: Un bloque de números asignados a ciertas zonas.
- Cada programa tiene un grupo de direcciones asignadas.
- Requiere cambios en el hardware para “ajustar” las direcciones. En tiempo real.
- Esta traducción se le conoce como Dynamic Relocation.
- El programa completo debe caber en el RAM para poder ejecutarse.

<!-- ![Untitled](Clase%202%20-%209%202%202024%20bc85ecfa5c4e49f49e41b79383c208ee/Untitled.jpeg) -->

#### 3^er^ enfoque: Memoria virtual

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



### Memory layout de un programa en C / C++

- El layout depende del lenguaje/compilador que el sistema operativo respeta.
- No es un bloque contiguo, la estrategia/enfoque de administración de memoria se aplica sobre todo el layout transparentemente.
  <!-- ![](Clase-14-Feb-2024/Memory-Layout.png) -->

### Stack

- Utiliza un stack (estructura de datos) cuya naturaleza es _LIFO_.
- Cada entrada se llama STACK FRAME.
- Hay un stack frame por cada llamada a una función (Call stack).
- Al terminar la función se elimina el frame.

_Consideraciones importantes:_ - Las variables locales almacenables en el stack deben ser de tamaño conocido al momento de la compilación. Por esta razón, memoria dinámica como listas enlazadas no puede almacenarse en stacks. - El stack es bug-free y amigable.

#### Componentes de cada stack frame

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

### Heap

### Punteros

- La memoria se puede representar como celdas o filas. 

| Direccion | Valor |
| --------- | ----- |

---

- Una variable es un alias de una dirección

| Direccion         | Valor | Alias                                             |
| ----------------- | ----- | ------------------------------------------------- |
| 0x01<—(int x = 0) | 0     | X—>(Esto solo existe en el contexto del programa) |

---

- Para simplificar, podemos representar:

| Alias | Direccion | Valor | Tipo (Determina el tamaño del bloque de memoria) |
| ----- | --------- | ----- | ------------------------------------------------ |

---

- Una variable puede ser mas de una dirección de memoria.
  Int->32 bits->48->4 Dir.

- Un puntero es un tipo de datos

  - Los valores que pueden almacenar son direcciones de memoria.
  - Soporta ciertos operadores especiales
  - Tamaño de memoria ocupada por una variable tipo pointer depende de la arquitectura(32bits o 64bits)

- Declaración

        Int* ptr = null;
        char* char ptr = nul;
        void* ptr = null;

- Cual es el proposito de declarar pointers con tipo si todos ocupen el mismo espacio?

* Type check
* Read/Write size
* Aritmetica de pointers

- Todo puntero debe asignarse con un valor inicial. Un puntero sin inicializar en un bad pointer

        Int* ptr; 	:(

        int* ptr=null; 	:)

        char* ptr=0; 	:)

        char* ptr=nullptr;—>c++ 14 	:)

        int* ptr;

        if(ptr==null) {

        //————>nunca entrara

        } else {

        //

        }

* Un bad pointer tiene un valor random

### Operador &

- Unario
- Retorna la dirección de memoria de una variable
  Int n = 10;
  Int \* ptr = &n;

| Direccion | Alias | Valor                 |
| --------- | ----- | --------------------- |
| 0x01      | n     | 20                    |
| 0x05      | ptr   | 0x01 (—> apunta a 20) |
| 0x06      | b     | 20                    |

### Operador\*

- Unario
- Accede a la dirección de memoria contenida en la variable pointer
- Lectura—> rvalue

  Escritura—> lvalue

        *ptr = 20; //Lvalue
        Int b = * ptr; //Rvalue

* Los punteros pueden ser fuerte de bugs. Tener cuidado al usarlos.

        int* foo() {
          int temp = 50;
          return&temp;
      }
      void bar() {
          int temp = 66;
          return;
      }
      int main() {
          int* r = foo();
          cout <<*r; —>50
          bar();
          cout <<*r; —>60
      }				WTF!!!

* Usando el API del heap

        Int ptr= (int*)malloc(size of(int)); ——>Cantidad de Bytes por reservar

* Para liberar memoria se usa free(ptr);
* La casilla de memoria se marca como libre pero la mem no se libera
* En c++ se puede usar new/delete

        int* ptr= new int;
      free(ptr);
      if(ptr==null) {
       ———>no entra :((
      }

- El operador -> se utiliza en c++

      Person* p = new Person();
      p->name = “Hola”;

### Sharing

- Dos o mas pointers hacia la misma memoria

| Direccion | Alias | Value                 |
| --------- | ----- | --------------------- |
| 0x01      | num   | 20                    |
| 0x05      | Ptr 1 | 0x01 (—> apunta a 20) |
| 0x06      | Ptr 2 | 0x05 (—> apunta a 20) |

- Dos formas de acceder a la misma memoria.
