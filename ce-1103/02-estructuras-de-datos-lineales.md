# Estructuras de Datos Lineales

> **¿Qué es una estructura de datos?**
>
> Una estructura de datos es una forma particular de organizar datos en una computadora para que puedan ser utilizados de manera eficiente. Se utilizan para procesar, recuperar y almacenador datos. Existe una colección minima de estructuras de datos comunes que son utilizadas en la mayoría de los lenguajes de programación.

Las estructuras de datos lineales son estructuras de datos cuyos elementos se organizan secuencialmente, uno tras de otro. Hay un solo nivel de lementos y se recorren en una sola pasada. Cada elemento de la estructura tiene un predecesor y un sucesor, excepto el primer y el último elemento.

## Arreglos y Matrices

### Arreglos
Los *arreglos* son colecciones de elementos del mismo tipo. Los elementos se almacenan en posiciones contiguas de memoria. Es la estructura de datos más básica y se utiliza en la mayoría de los lenguajes de programación.

Terminología básica de arreglos incluye:

- *Índice*: los elementos en un array se identifican por su índice (empieza en cero usualmente). Por ejemplo, el primer elemento de un array tiene índice 0, el segundo tiene índice 1, y así sucesivamente.
- *Longitud*: el número de elementos en un array. Por ejemplo, un array con 5 elementos tiene longitud 5 y sus índices van de 0 a 4.
- *Elemento*: un valor almacenado en una posición específica del array. Por ejemplo, el elemento en la posición 0 del array es el primer elemento del array.

Visualmente, un arreglo se puede representar con la imagen siguiente. Nótese que cada elemento tiene una posición de memoria contigua (en la imagen se muestran direcciones de memoria en decimal). Cada "espacio" del arreglo es del mismo tamaño según el tipo de dato que se almacene (por ejemplo, un `int` ocupa 4 bytes, por eso observe como las direcciones aumentan de cuatro en cuatro).

![Representación de un arreglo en memoria](images/02-estructuras-de-datos-lineales/image-00.png)

En C# una arreglo se declara de la siguiente manera:

```csharp
// This array will store integer type element
int[] arr;

// This array will store char type element
char[] arr2;

// This array will store float type element
float[] arr3;
```

## Listas


### Tipo de Dato Abstracto Lista

Pueden implementarse se muchas formas. Las más comunes son:

- **ArrayList**: Implementación mediante arreglos
- **SinglyLinkedList**: Implementación mediante listas simples enlazadas
- **DoubleLinkedList**: Implementación mediante listas doblemente enlazadas
- **CircularLinkedList**: Implementación mediante listas enlazadas circulares

### Implementación mediante arreglos

```java
public class ArrayList implements List {
    private int maxSize;
    private int currentSize;
    private int[] storage;

    public ArrayList(int size) {
        this.maxSize = size;
        this.currentSize = 0;
        this.storage = new int[size];
    }

    public void clear() {
        this.currentSize = 0;
    }

    public boolean isEmpty() {
        return this.currentSize == 0;
    }

    public int size() {
        return this.currentSize;
    }

    public boolean contains(int element) {
        for (int i = 0; i < this.maxSize; i++) {
            if (this.storage[i] == element) {
                return true;
            }
        }
        return false;
    }

    public boolean add(int element) {
        if (this.currentSize > this.maxSize) {
            return false;
        }
        this.storage[currentSize++] = element;
        return true;
    }

    public int remove(int element) {
        int i;
        for (i = 0; i < this.currentSize; i++) {
            if (this.storage[i] == element) {
                indexToRemove = i;
            }
        }
        if (i == this.maxSize) {
            throw new NoSuchElementException();
        }
        for (int j = i; j < this.currentSize - 1; j++) {
            this.storage[j] = this.storage[j + 1];
        }
        this.currentSize--;
    }
}
```

- Algunos lenguajes explicitamente proveen soporte para ArrayList
- **La principal ventaja** que proveen en vez de usar directamente es la abstracción de más alto nivel. El programador no tiene que lidiar con _shifts_, re-sizes u otros problemas de usar arreglos directamente
- Una estrategia que se puede utilizar para evitar lanzar una excepción al llegar al tamaño máximo, es crear un nuevo array de mayor tamaño y copiar los elementos del array actual. Pero si tendrá un _hit_ de performance.

### Implementación mediante listas simples enlazadas

> Todos los enfoques utilizando listas enlazadas utilizan memoria dinámica en vez de un arreglo, es decir, asigna memoria en el _heap_ cada vez que un elemento se agrega
>
> Dado que crea la memoria _justo en el momento_, cada elemento de la lista está separado en la memoria (a diferencia de un array donde todos los elementos están en memoria contigua)

- Cada elemento de la lista es un _nodo_. Cada nodo tiene dos partes:
  - El **valor**: es el elemento relevante para el programador. El valor que solicitó registrar en la lista. Por ejemplo, `add(3)`, el 3 es el valor de interés para el programador
  - Una **referencia** al nodo siguiente que actua como el elemento que encadena la lista.
- Visualmente, una lista enlazada se puede representar como:
  
  ![](images/linked-list-1.png)

  - Como se puede notar, el último elemento apunta a _null_ indicando el fin de la lista
  - Es esencial llevar y mantener una referencia a la cabeza de la lista. Si la cabeza de la lista se pierde, se pierde toda la lista.
  - Opcionalmente y para mejorar la eficiencia de la inserción al final, se puede llevar una referencia a la cola de la lista. Este tipo se conoce como _DoubleEndedLinkedList_.

#### Estructura general en Java

```java
// No es public, es una clase interna para no exponer la clase nodo a
// otras clases fuera del paquete
class Node {
    int value;
    Node next;

    public Node(int value) {
        this.value = value;
        this.next = null;
    }
}

public class SinglyLinkedList implements List {
    private Node head;
    private int size;

    public SinglyLinkedList() {
        this.head = null;
        this.size = 0;
    }

    public void clear() {
        this.head = null;
        this.size = 0;
    }

    public boolean isEmpty() {
        return this.size == 0;
    }

    public int size() {
        return this.size;
    }

    public boolean contains(int element) {
        Node current = this.head;
        while (current != null) {
            if (current.value == element) {
                return true;
            }
            current = current.next;
        }
        return false;
    }

    public boolean add(int element) {
        Node newNode = new Node(element);
        if (this.head == null) {
            this.head = newNode;
        } else {
            Node current = this.head;
            while (current.next != null) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.size++;
        return true;
    }

    public int remove(int element) {
        if (this.head == null) {
            throw new NoSuchElementException();
        }
        if (this.head.value == element) {
            this.head = this.head.next;
            this.size--;
            return element;
        }
        Node current = this.head;
        while (current.next != null) {
            if (current.next.value == element) {
                current.next = current.next.next;
                this.size--;
                return element;
            }
            current = current.next;
        }
        throw new NoSuchElementException();
    }
}

```

### Implementación mediante lista doblemente enlazada

- La lista doblemente enlazada es similar a la lista simple enlazada, pero cada nodo tiene una referencia al nodo anterior y al siguiente
- Visualmente, una lista doblemente enlazada se puede representar como:
  ![](images/double-linked-list-1.png)
- La ventaja sobre la lista simple enlazada es que se puede recorrer la lista en ambas direcciones. La desventaja es que cada nodo tiene que mantener una referencia adicional al nodo anterior, lo que consume más memoria e implica mayor complejidad en la implementación.

#### Estructura general en Java

```java
class Node {
    int value;
    Node next;
    Node prev;

    public Node(int value) {
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}

public class DoubleLinkedList implements List {
    private Node head;
    private int size;

    public DoubleLinkedList() {
        this.head = null;
        this.size = 0;
    }

    public void clear() {
        this.head = null;
        this.size = 0;
    }

    public boolean isEmpty() {
        return this.size == 0;
    }

    public int size() {
        return this.size;
    }

    public boolean contains(int element) {
        Node current = this.head;
        while (current != null) {
            if (current.value == element) {
                return true;
            }
            current = current.next;
        }
        return false;
    }

    public boolean add(int element) {
        Node newNode = new Node(element);
        if (this.head == null) {
            this.head = newNode;
        } else {
            Node current = this.head;
            while (current.next != null) {
                current = current.next;
            }
            current.next = newNode;
            newNode.prev = current;
        }
        this.size++;
        return true;
    }

    public int remove(int element) {
        if (this.head == null) {
            throw new NoSuchElementException();
        }
        if (this.head.value == element) {
            this.head = this.head.next;
            if (this.head != null) {
                this.head.prev = null;
            }
            this.size--;
            return element;
        }
        Node current = this.head;
        while (current.next != null) {
            if (current.next.value == element) {
                current.next = current.next.next;
                if (current.next != null) {
                    current.next.prev = current;
                }
                this.size--;
                return element;
            }
            current = current.next;
        }
        throw new NoSuchElementException();
    }
}

```

#### Aplicabilidad

- Cuando se necesita recorrer la lista en ambas direcciones, por ejemplo, en un editor de texto, donde se necesita recorrer el texto hacia adelante y hacia atrás o en un navegador web, donde se necesita recorrer el historial de navegación hacia adelante y hacia atrás.

### Implementación mediante lista enlazada circular

- La lista enlazada circular es similar a la lista simple enlazada, pero el último nodo apunta al primer nodo
- Visualmente, una lista enlazada circular se puede representar como:
  ![](images/circular-linked-list-1.png)
- Usualmente se implementan como cirular doblemente enlazada.
- Para mejorar las inserciones, en vez de mantener la referencia a _head_ se utiliza una referencia a _tail_ únicamente:
  ![](images/circular-linked-list-2.png)

#### Estructura general en Java

```java
class Node {
    int value;
    Node next;

    public Node(int value) {
        this.value = value;
        this.next = null;
    }
}
public class CircularSinglyLinkedList {
    private Node tail;
    private int size;

    public CircularSinglyLinkedList() {
        this.tail = null;
        this.size = 0;
    }

    public void clear() {
        this.tail = null;
        this.size = 0;
    }

    public boolean isEmpty() {
        return this.size == 0;
    }

    public int size() {
        return this.size;
    }

    public boolean contains(int element) {
        if (this.tail == null) {
            return false;
        }
        Node current = this.tail.next;
        while (current != this.tail) {
            if (current.value == element) {
                return true;
            }
            current = current.next;
        }
        return current.value == element;
    }

    public boolean add(int element) {
        Node newNode = new Node(element);
        if (this.tail == null) {
            newNode.next = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.tail.next;
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.size++;
        return true;
    }

    public int remove(int element) {
        if (this.tail == null) {
            throw new NoSuchElementException();
        }
        Node current = this.tail.next;
        Node prev = this.tail;
        while (current != this.tail) {
            if (current.value == element) {
                prev.next = current.next;
                this.size--;
                return element;
            }
            prev = current;
            current = current.next;
        }
        if (current.value == element) {
            if (this.size == 1) {
                this.tail = null;
            } else {
                prev.next = current.next;
                if (current == this.tail) {
                    this.tail = prev;
                }
            }
            this.size--;
            return element;
        }
        throw new NoSuchElementException();
    }
}
```

#### Aplicabilidad

Cuando se necesita una lista que no tenga un final o un principio, por ejemplo, una lista de reproducción de música, donde la última canción apunta a la primera o una lista de tareas pendientes, donde la última tarea apunta a la primera.

### Tabla comparativa de implementaciones

| Implementación | Ventajas                                                                                                                      | Desventajas                                                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| ArrayList      | - Acceso aleatorio rápido                                                                                                     | - Inserciones y eliminaciones son costosas<br/>- Uso ineficiente de memoria (Un arreglo grande poco usado, sigue utilizando toda la memoria asignada) |
| LinkedList     | - Inserciones y eliminaciones son rápidas<br/>-Uso más eficiente de la memoria aunque cada nodo tiene un _overhead_ adicional | - Acceso aleatorio a los elementos es costoso                                                                                                         |

## Pilas

Una pila es una estructura de datos lineal que sigue el principio de LIFO (del inglés Last In, First Out), es decir, el último elemento en entrar es el primero en salir.

### Tipo de dato abstracto Pila

La pila tiene dos operaciones básicas:

- **Apilar (push)**: añade un elemento a la pila.
- **Desapilar (pop)**: elimina el último elemento apilado.
- **Tope (top)**: permite ver el elemento que está en la cima de la pila sin desapilarlo.

<pre>
| Before Push | After Push 3 | After Push 5 | After Pop | After Pop |
|-------------|--------------|--------------|-----------|-----------|
|             |              |   +---+      |           |           |
|             |              |   | 5 |      |           |           |
|             |   +---+      |   +---+      |   +---+   |           |
|   +---+     |   | 3 |      |   | 3 |      |   | 3 |   |   +---+   |
|   +---+     |   +---+      |   +---+      |   +---+   |   +---+   |
</pre>


```java
public interface IStack {
    void push(int element);
    int pop();
    int top();
}
```

Al igual que en el caso de las listas, se pueden implementar pilas con arreglos o con listas enlazadas.

### Implementación de pilas con arreglos

En la implementación de pilas con arreglos, se utiliza un arreglo unidimensional para almacenar los elementos de la pila.

```java
public class ArrayStack implements IStack {
    private int[] stack;
    private int top;
    private int size;

    public ArrayStack(int size) {
        this.size = size;
        stack = new int[size];
        top = -1;
    }

    public void push(int element) {
        if (top == size - 1) {
            System.out.println("Stack Overflow");
        } else {
            stack[++top] = element;
        }
    }

    public int pop() {
        if (top == -1) {
            System.out.println("Stack Underflow");
            return -1;
        } else {
            return stack[top--];
        }
    }

    public int top() {
        if (top == -1) {
            System.out.println("Stack Underflow");
            return -1;
        } else {
            return stack[top];
        }
    }
}
```

### Implementación de pilas con listas enlazadas

```java
public class LinkedListStack implements IStack {
    private Node top;

    public void push(int element) {
        Node newNode = new Node(element);
        newNode.next = top;
        top = newNode;
    }

    public int pop() {
        if (top == null) {
            System.out.println("Stack Underflow");
            return -1;
        } else {
            int element = top.data;
            top = top.next;
            return element;
        }
    }

    public int top() {
        if (top == null) {
            // Preguntar a los estudiantes, que es mejor, este enfoque o
            // lanzar excepciones como se vio en ejemplos pasados
            System.out.println("Stack Underflow");
            return -1;
        } else {
            return top.data;
        }
    }

    // Otro enfoque para que la clase nodo solo pueda usarse dentro de
    // la clase Stack
    private class Node {
        int data;
        Node next;

        public Node(int data) {
            this.data = data;
        }
    }
}
```
## Colas

Es una estructura de datos que sigue el principio de FIFO (del inglés First In, First Out), es decir, el primer elemento en entrar es el primero en salir. Respeta el orden de llegada de los elementos.

### Tipo de dato abstracto Cola

```java
public interface IQueue {
    void enqueue(int element);
    int dequeue();
    int front();
}
```

Cola vacía:

<pre>
Frente -->  Cola Vacía  <-- Final
</pre>

Agregando elementos 1, 2, 3, 4 y 5:

<pre>
Frente --> [ 1 ] --> [ 2 ] --> [ 3 ] --> [ 4 ] --> [ 5 ] <-- Final
</pre>

Quitando un elemento:

<pre>
Frente --> [ 2 ] --> [ 3 ] --> [ 4 ] --> [ 5 ] <-- Final
</pre>

Agregando el elemento 6:

<pre>
Frente --> [ 2 ] --> [ 3 ] --> [ 4 ] --> [ 5 ] --> [ 6 ] <-- Final
</pre>

Quitando dos elementos:

<pre>
Frente --> [ 4 ] --> [ 5 ] --> [ 6 ] <-- Final
</pre>

### Implementación de colas con arreglos

```java
public class ArrayQueue implements IQueue {
    private int[] queue;
    private int front;
    private int rear;
    private int size;

    public ArrayQueue(int size) {
        this.size = size;
        queue = new int[size];
        front = -1;
        rear = -1;
    }

    public void enqueue(int element) {
        if (rear == size - 1) {
            System.out.println("Queue Overflow");
        } else {
            if (front == -1) {
                front = 0;
            }
            queue[++rear] = element;
        }
    }

    public int dequeue() {
        if (front == -1) {
            System.out.println("Queue Underflow");
            return -1;
        } else {
            int element = queue[front];
            if (front == rear) {
                front = -1;
                rear = -1;
            } else {
                front++;
            }
            return element;
        }
    }

    public int front() {
        if (front == -1) {
            System.out.println("Queue Underflow");
            return -1;
        } else {
            return queue[front];
        }
    }
}
```

Esta implementación tiene un problema conocido como "drifting" que ocurre cuando se hacen muchas operaciones de inserción y eliminación. La cola se desplaza hacia la izquierda y se desperdicia espacio. Para solucionar este problema se puede implementar una cola circular.

```java
public class CircularArrayQueue implements IQueue {
    private int[] queue;
    private int front;
    private int rear;
    private int size;

    public CircularArrayQueue(int size) {
        this.size = size;
        queue = new int[size];
        front = -1;
        rear = -1;
    }

    public void enqueue(int element) {
        if ((rear + 1) % size == front) {
            System.out.println("Queue Overflow");
        } else {
            if (front == -1) {
                front = 0;
            }
            rear = (rear + 1) % size;
            queue[rear] = element;
        }
    }

    public int dequeue() {
        if (front == -1) {
            System.out.println("Queue Underflow");
            return -1;
        } else {
            int element = queue[front];
            if (front == rear) {
                front = -1;
                rear = -1;
            } else {
                front = (front + 1) % size;
            }
            return element;
        }
    }

    public int front() {
        if (front == -1) {
            System.out.println("Queue Underflow");
            return -1;
        } else {
            return queue[front];
        }
    }
}
```

Con una cola circular, el frente y el final no necesariamente estan al principio y al final del arreglo, respectivamente. En lugar de eso, el frente y el final se mueven a lo largo del arreglo. Cuando el final llega al final del arreglo, se mueve al principio del arreglo.

### Implementación de colas con listas enlazadas

```java
public class LinkedListQueue {
    private Node front;
    private Node rear;

    public LinkedListQueue() {
        front = null;
        rear = null;
    }

    public void enqueue(int element) {
        Node newNode = new Node(element);
        if (rear == null) {
            front = newNode;
            rear = newNode;
        } else {
            rear.next = newNode;
            rear = newNode;
        }
    }

    public int dequeue() {
        if (front == null) {
            System.out.println("Queue Underflow");
            return -1;
        } else {
            int element = front.data;
            front = front.next;
            if (front == null) {
                rear = null;
            }
            return element;
        }
    }

    public int front() {
        if (front == null) {
            System.out.println("Queue Underflow");
            return -1;
        } else {
            return front.data;
        }
    }

    private class Node {
        private int data;
        private Node next;

        public Node(int data) {
            this.data = data;
            this.next = null;
        }
    }
}
```
## Colas de prioridad

Una cola de prioridad es una estructura de datos que almacena elementos en una cola, pero en lugar de seguir un orden de llegada, los elementos se organizan de acuerdo a su prioridad. Los elementos con mayor prioridad se desencolan antes que los elementos con menor prioridad.

### Tipo de dato abstracto Cola de prioridad

```java
public interface IPriorityQueue {
    void enqueue(int element, int priority);
    int dequeue();
    int front();
}
```

- **Encolar (enqueue)**: Cuando un elemento se añade a la cosa, se mantiene el orden de acuerdo a su prioridad, reorganizando los elementos si es necesario.
- **Desencolar (dequeue)**: Se elimina el elemento con mayor prioridad primero.
- **Tope (front)**: Permite ver el elemento con mayor prioridad sin desencolarlo.

### Tipos de colas de prioridad

- Orden ascendente: el elemento con menor valor numérico tiene mayor prioridad.
- Orden descendente: el elemento con mayor valor numérico tiene mayor prioridad.

### Implementación de colas de prioridad con listas enlazadas

Las colas de proridad se pueden implementar de muchas maneras:

- Con arreglos
- Con listas enlazadas
- Con montículos (heaps)

Más adelante en el curso, veremos la implementación con heap. Por ahora, vamos a ver una implementación con listas enlazadas.

```java
public class LinkedListPriorityQueue implements IPriorityQueue {
    private Node front;
    private Node rear;

    public LinkedListPriorityQueue() {
        front = null;
        rear = null;
    }

    public void enqueue(int element, int priority) {
        Node newNode = new Node(element, priority);
        if (front == null) {
            front = newNode;
            rear = newNode;
        } else if (priority < front.priority) {
            newNode.next = front;
            front = newNode;
        } else {
            Node current = front;
            while (current.next != null && current.next.priority <= priority) {
                current = current.next;
            }
            newNode.next = current.next;
            current.next = newNode;
            if (newNode.next == null) {
                rear = newNode;
            }
        }
    }

    public int dequeue() {
        if (front == null) {
            System.out.println("Queue Underflow");
            return -1;
        } else {
            int element = front.element;
            front = front.next;
            return element;
        }
    }

    public int front() {
        if (front == null) {
            System.out.println("Queue Underflow");
            return -1;
        } else {
            return front.element;
        }
    }
}
```
## Generics

Hasta ahora, los ejemplos vistos de las estructuras de datos, han sido únicamente para el tipo de dato `integer`. ¿Qué pasa si queremos implementar una estructura de datos para otro tipo de dato? Por ejemplo, si queremos implementar una pila para `String` o para `double`. En este caso, tendríamos que implementar una pila para cada tipo de dato que necesitemos. Esto no es eficiente y no es escalable.

Otra opción es utilizar el tipo de dato `Object` que es la superclase de todos los tipos de datos en Java. Sin embargo, esto no es una solución óptima ya que se pierde el tipo de dato específico y se tendría que hacer un _casting_ cada vez que se quiera utilizar el dato. Esto puede resultar en errores en tiempo de ejecución.

Java y muchos otros lenguajes, proveen el concepto de **generics** para solucionar este problema. Los **generics** permiten definir clases, interfaces y métodos con un tipo de dato que se especifica en el momento de la creación de la instancia.

```java
public class LinkedList<T> {
    private Node<T> head;

    private static class Node<T> {
        private T data;
        private Node<T> next;

        public Node(T data) {
            this.data = data;
            this.next = null;
        }
    }

    public void add(T data) {
        Node<T> newNode = new Node<>(data);
        if (head == null) {
            head = newNode;
        } else {
            Node<T> current = head;
            while (current.next != null) {
                current = current.next;
            }
            current.next = newNode;
        }
    }

    // Other methods for LinkedList implementation...
}

/// Ejemplo de instanciación

public static void main(String[] args) {
    LinkedList<String> list = new LinkedList<>();
    list.add("Hello");
    list.add("World");
    list.add("Java");

    LinkedList<Integer> numbers = new LinkedList<>();
    numbers.add(1);
    numbers.add(2);

    LinkedList<Double> decimals = new LinkedList<>();
    decimals.add(3.14);
    decimals.add(2.71);
}

```

Una consideración importante al utilizar generics es al comparar los elementos en la estructura. Se puede aprovechar la interfaz `Comparable` de Java para forzar que los elementos de tipo T sean comparables entre sí.

```java
public class LinkedList<T extends Comparable<T>> {
    // ...

    private class Node<T extends Comparable<T>> {
        public int compareTo(T other) {
            return this.data.compareTo(other);
        }
    }
}

```

Para cualquier tipo de datos _personalizado_, se debe implmentar la interfaz `Comparable` y definir las reglas de comparación que tengan sentido dentro del contexto de la aplicación.

- Clase `Persona`: comparar por cédula
- Clase `Estudiante`: comparar por número de carné

# Referencias
- https://www.geeksforgeeks.org/introduction-to-arrays-data-structure-and-algorithm-tutorials/