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
La memoria ha sido un componente fundamental en las computadoras desde sus inicios y por ende ha necesitado del sistema operativo para administrarla. Conforme los recursos computacionales se adaptan a las necesidades de los usuarios y las prestaciones de hardware, la  administración de memoria se adapta para reducir el _overhead_ y mejorar la eficiencia.

A continuación se presenta la evolución de la abstracción de la memoria en los sistemas operativos.

#### Ninguna abstracción de memoria

La abstracción más simple es no tener ninguna. Las computadoras mainframe de los años 60, minicomputadoras de los 70s y computadoras personales en los 80s, no tenían abstracción de memoria. Los programas accedían directamente a la memoria **física**. Un programa con la instrucción `MOV REGISTER1, 1000` en realidad accedía a la dirección de memoria 1000.

Había cierta organización de la memoria:

![Organización de la memoria sin abstracción](images/01-administracion-de-memoria/image.png)

Bajo estas condiciones, era imposible ejecutar más de un programa a la vez (_multiprogramación_), ya que cada programa accedía directamente a la memoria física. Dos o más programas cargados en memoria, podían afectarse entre sí causando errores en la ejecución. El uso de threads era posible dado que compartían la misma memoria, pero de poco valor.

![El problema de la re-ubicación](images/01-administracion-de-memoria/image-01.png)

El _swapping_ se introduce como técnica para "pausar" la ejecución de un, guardar su estado en disco y cargar otro programa en memoria. Esta técnica permitió la multiprogramación _a cierto grado_, dado que solo un programa podía estar cargado en memoria en un momento dado. La idea era que mientras un programa estaba esperando por una operación de I/O, otro programa podía ejecutarse.

La computadora _IBM 360_, introduce una técnica para poder tener dos programas en memoria: _static relocation_. Cuando un programa se cargaba en memoria, se le asignaba una dirección base (la dirección inicial en la que se carga) y se modificaban todas las referencias a memoria para sumarles la dirección base. Esto funcionaba pero claramente no era eficiente puesto que entre más grande fuera el programa, más tarda en cargarse.

> Multiprogramación
>
> Se denomina multiprogramación a una técnica por la que dos o más procesos pueden alojarse en la memoria principal y ser ejecutados concurrentemente por el procesador o CPU. [...] la ejecución de los procesos (o hilos) se va solapando en el tiempo a tal velocidad, que causa la impresión de realizarse en paralelo (simultáneamente)
> 
> [...] En los antiguos sistemas monoprogramados, cuando un proceso en ejecución requería hacer uso de un dispositivo de E/S, el procesador quedaba ocioso mientras el proceso permaneciese en espera y no retomara su ejecución 
> _de Wikipedia_

#### Espacios de direcciones
Constituye una abstracción para la memoria física. Cada programa tiene su propio espacio de direcciones, que va desde 0 a un valor máximo. El sistema operativo se encarga de mapear las direcciones virtuales a direcciones físicas. Dos programas puede ver la dirección `28`, pero en realidad se refieren a direcciones físicas diferentes.

Bajo este enfoque, el hardware provee dos registros llamados _base_ y _limite_. Cuando un programa específico se ejecuta, el sistema operativo carga el _base_ y _limite_ con los valores correspondientes al espacio de direcciones del programa. Cada vez que el programa accede a una dirección de memoria, el hardware verifica que la dirección esté dentro del rango permitido por el _base_ y _limite_ y genera la dirección física correspondiente.

Una limitante de este enfoque es que el programa completo debe caber en la memoria, lo cual es claramente poco práctico para los programas modernos con requerimientos de memoria cada vez más agresivos y que compiten con muchos otros programas ejecutándose concurrentemente.

> Concurrencia vs Paralelismo
> 
> La concurrencia se refiere a la capacidad de un sistema de llevar a cabo múltiples tareas en un mismo periodo de tiempo traslapándose entre sí, pero no implica que se ejecuten a la misma vez. En paralelismo, las tareas se ejecutan al mismo tiempo. Paralelismo implica múltiples núcleos de procesamiento. La concurrencia puede lograrse con un solo núcleo bajo multiprogramación.

#### Memoria virtual
La memoría virtual es la solución para poder ejecutar programas que no caben en la memoria física. La idea básica es que cada programa tiene su propio espacio de direcciones dividido en bloques llamados _páginas_. Cada página es es un rango contiguo de direcciones. 

Las páginas se mapean a bloques de memoria física llamados _frames_, pero no notas las páginas necesitan estar cargadas. Cuando un programa referencia una página que está cargada en memoria (_page-hit_), el hardware mapea la dirección virtual a la dirección física correspondiente. Si la página no está cargada, el sistema operativo la carga desde el disco a un frame libre en memoria y re-ejecuta la instrucción que causó el fallo de página (_page-fault_).

Entonces, cuando un programa tiene una instrucción `MOV REGISTER1, 1000`, la dirección 1000 es una dirección virtual parte de su espacio de direcciones virtuales.

![Funcionamiento del MMU](images/01-administracion-de-memoria/image-02.png)

Como se nota en la imagen anterior, hay hardware especializado, el _Memory Management Unit (MMU)_ que se encarga de mapear las direcciones virtuales a direcciones físicas. El MMU tiene una tabla de páginas que mapea las direcciones virtuales a direcciones físicas. La tabla de páginas se mantiene en memoria y el MMU la consulta cada vez que necesita mapear una dirección virtual a una dirección física.

![Relación entre direcciones virtuales y físicas](images/01-administracion-de-memoria/image-02.png)

El MMU tiene una tabla que lleva el inventario de páginas cargadas y su correspondiente frame. Dicha tabla aloja información estadística sobre las páginas, como la frecuencia de uso, para poder tomar decisiones sobre qué páginas mantener en memoria y cuáles sacar. Dado que los frames son limitados, se utilizan algoritmos de reemplazo de páginas para decidir cuál página sacar de memoria cuando se necesita cargar una nueva y no hay espacio.

## Administración de memoria a nivel del programa
 Memory layout de un programa en C / C++

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

# Referencias adicionales
- Modern Operating Systems, Andrew S. Tanenbaum, Herbert Bos, Pearson, 2014.