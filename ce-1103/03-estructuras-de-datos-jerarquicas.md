# Estructuras de datos jerárquicas

Son estructuras de datos que permiten organizar los datos de manera jerárquica, es decir, en forma de árbol. Los datos se organizan de manera que exista un nodo raíz y cada nodo puede tener cero o más nodos hijos. Cada nodo hijo puede tener a su vez cero o más nodos hijos, y así sucesivamente.

Existen muchos tipos de árboles, cada uno con sus propias características y aplicaciones. Algunos de los árboles más comunes son:

- **Árboles binarios**: cada nodo tiene a lo sumo dos hijos.

  - **Árboles binarios de búsqueda**: Es un árbol binario con ciertas reglas que permiten realizar búsquedas eficientes.
  - **Árboles AVL**: Es un árbol binario de búsqueda balanceado.
  - **Árboles splay**: Es un árbol binario de búsqueda que reorganiza los nodos para que los nodos más utilizados estén cerca de la raíz.
  - **Árboles de expresiones**: Es un árbol que se utiliza para representar expresiones matemáticas.
  - **Árboles rojinegros**: Es un árbol binario de búsqueda balanceado.
  - **Heap**: Es un árbol binario que cumple con ciertas reglas y se utiliza para implementar colas de prioridad.

- **Arboles N-arios**: Cada nodo puede tener un número variable de hijos.
  - **Árboles B**: Es un árbol que permite almacenar grandes cantidades de datos en disco.
  - **Árboles B+**: Es una variante del árbol B que se utiliza en bases de datos y sistemas de archivos.
  - **Árboles trie**: Es un árbol que se utiliza para almacenar un conjunto de cadenas de caracteres.
  - **Árboles de sufijos**: Es un árbol que se utiliza para almacenar todas las subcadenas de una cadena de caracteres.

A excepción de algunos árboles que puede implementarse con arreglos, la mayoría de los árboles se implementan con nodos enlazados, de forma similar a las _Listas_.

## Terminología básica

![Árbol binario](images/trees-1.png)

## Tipo de dato abstracto Árbol

Los árboles tienen las siguientes operaciones básicas:

- **Insertar (insert)**: añade un nodo al árbol.
- **Eliminar (delete)**: elimina un nodo del árbol.
- **Buscar (search)**: busca un nodo en el árbol.
- **Recorrer (traverse)**: recorre todos los nodos del árbol. Se puede realizar en distintos órdenes:
  - **Preorden**: primero se visita la raíz, luego el subárbol izquierdo y finalmente el subárbol derecho.
  - **Inorden**: primero se visita el subárbol izquierdo, luego la raíz y finalmente el subárbol derecho.
  - **Postorden**: primero se visita el subárbol izquierdo, luego el subárbol derecho y finalmente la raíz.
  - **Por niveles**: se recorren todos los nodos de un nivel antes de pasar al siguiente nivel.

## Árboles Binarios de Búsqueda (BST)
Un BST es un árbol binario que cumple con la siguiente propiedad: para cada nodo, todos los nodos del subárbol izquierdo tienen un valor menor que el nodo y todos los nodos del subárbol derecho tienen un valor mayor que el nodo.

Los BST se pueden implementar mediante arrays o nodos enlazados. En este curso, BST se verán como nodos enlazados. Los _árboles Heap_ que veremos más adelante, se implementarán con arrays.

### Implementación
La estructura básica de un BST se puede implementar de la siguiente forma:
```java
class TreeNode {
    int key;
    TreeNode left, right;

    public TreeNode(int item) {
        key = item;
        left = right = null;
    }
}

public class BinarySearchTree {
    TreeNode root;

    public BinarySearchTree() {
        root = null;
    }
}
```

### Búsqueda de elementos
```java
    public boolean search(int key) {
        return searchRecursive(root, key);
    }

    private boolean searchRecursive(TreeNode root, int key) {
        if (root == null) {
            return false
        } 
        if (root.key == key) {
            return true;
        }
        else if (key > root.key) {
            return searchRecursive(root.right, key);
        } else {
            return searchRecursive(root.left, key);
        }
    }
```

> Dado que los árboles son una estructura jerárquica, la búsqueda se puede realizar de forma recursiva (preferida por simplicidad). De tal forma, la mayoría de los métodos van en parejas: _uno público que recibe los parámetros iniciales_ y _otro privado que realiza la operación recursiva_. 

### Inserción de elementos
La inserción usa el mismo principio de búsqueda para encontrar el lugar donde se debe insertar el nuevo nodo. **Si el nodo ya existe, no se inserta**.

```java
    public void insert(int key) {
        root = insertRecursive(root, key);
    }

    private TreeNode insertRecursive(TreeNode root, int key) {
        if (root == null) {
            root = new TreeNode(key);
            return root;
        }

        if (key < root.key)
            root.left = insertRecursive(root.left, key);
        else if (key > root.key)
            root.right = insertRecursive(root.right, key);

        return root;
    }
```
Note que el método insert re-asigna el valor de root al resultado de insertRecursive. Esto es necesario para que los cambios hechos en el árbol se reflejen en la raíz. Un error de principiante es creer que el siguiente código funciona:

```java
    public void insert(int key) {
        insertRecursive(root, key);
    }

    private void insertRecursive(TreeNode root, int key) {
        if (root == null) {
            root = new TreeNode(key);
            return;
        }

        if (key < root.key)
            insertRecursive(root.left, key);
        else if (key > root.key)
            insertRecursive(root.right, key);
    }
```
No funciona puesto que **las referencias en Java se pasan por valor**. Esto significa que el valor de root no cambia en el método insert, por lo que el árbol no se modifica.

### Eliminación de elementos
La eliminación en un BST considera varios casos:

- El nodo a eliminar es una hoja.

- El nodo a eliminar tiene un solo hijo.

- El nodo a eliminar tiene dos hijos.

**Cuando el nodo es hoja**, simplemente se elimina. **Cuando el nodo tiene un solo hijo**, se reemplaza el nodo por su hijo. **Cuando el nodo tiene dos hijos**, se reemplaza el nodo por el nodo más pequeño del subárbol derecho o por el nodo mayor del súbarbol izquierdo (**solo se puede usar una de estas estrategias** en toda la implementación)

```java
    public void delete(int key) {
        root = deleteRecursive(root, key);
    }

    private TreeNode deleteRecursive(TreeNode root, int key) {
        if (root == null)
            return root;

        if (key < root.key)
            root.left = deleteRecursive(root.left, key);
        else if (key > root.key)
            root.right = deleteRecursive(root.right, key);
        else {
            if (root.left == null)
                return root.right;
            else if (root.right == null)
                return root.left;

            root.key = minValue(root.right);
            root.right = deleteRecursive(root.right, root.key);
        }
        return root;
    }

    private int minValue(TreeNode root) {
        int minValue = root.key;
        while (root.left != null) {
            minValue = root.left.key;
            root = root.left;
        }
        return minValue;
    }
```

### Recorridos
Recorrer un árbol no solo es útil para imprimirlo, sino que también es útil para realizar operaciones en todos los nodos. Los recorridos más comunes son:

- Inorden (izquierda, raíz, derecha).
- Preorden (raíz, izquierda, derecha).
- Postorden (izquierda, derecha, raíz).

```java
    public void inOrder() {
        inOrderRecursive(root);
    }

    private void inOrderRecursive(TreeNode root) {
        if (root != null) {
            inOrderRecursive(root.left);
            System.out.print(root.key + " ");
            inOrderRecursive(root.right);
        }
    }

    public void preOrder() {
        preOrderRecursive(root);
    }

    private void preOrderRecursive(TreeNode root) {
        if (root != null) {
            System.out.print(root.key + " ");
            preOrderRecursive(root.left);
            preOrderRecursive(root.right);
        }
    }

    public void postOrder() {
        postOrderRecursive(root);
    }

    private void postOrderRecursive(TreeNode root) {
        if (root != null) {
            postOrderRecursive(root.left);
            postOrderRecursive(root.right);
            System.out.print(root.key + " ");
        }
    }
```

#### In-orden
El recorrido in-orden de un árbol BST imprime los nodos en *orden ascendente*. Esto se debe a que el recorrido in-orden visita primero el subárbol izquierdo, luego la raíz y finalmente el subárbol derecho. 

Por ejemplo, el siguiente árbol:

```java
        8
       / \
      3   10
     / \    \
    1   6   14
       / \  /
      4   7 13
```

Se imprime como `1 3 4 6 7 8 10 13 14`.

#### Pre-orden
El recorrido pre-orden de un árbol BST imprime la raíz antes que los subárboles. Esto se debe a que el recorrido pre-orden visita primero la raíz, luego el subárbol izquierdo y finalmente el subárbol derecho.

```java
        8
       / \
      3   10
     / \    \
    1   6   14
       / \  /
      4   7 13
```

Se imprime como `8 3 1 6 4 7 10 14 13`.


#### Post-orden
El recorrido post-orden de un árbol BST imprime los subárboles antes que la raíz. Esto se debe a que el recorrido post-orden visita primero el subárbol izquierdo, luego el subárbol derecho y finalmente la raíz.

```java
        8
       / \
      3   10
     / \    \
    1   6   14
       / \  /
      4   7 13
```

Se imprime como `1 4 7 6 3 13 14 10 8`.

* El problema de los BST de no ser balanceados *
Los BST pueden degenerar en listas enlazadas si los elementos se insertan en orden. Esto puede ocurrir si los elementos se insertan en orden ascendente o descendente. En este caso, la búsqueda, inserción y eliminación se convierten en operaciones de tiempo lineal.

```java
        1
         \
          2
           \
            3
             \
              4
               \
                5
                 \
                  6
                   \
                    7
                     \
                      8
                       \
                        9
```

## Árboles Heap (montículo)

- Un árbol _heap_ es un árbol binario completo, es decir, todos los niveles del árbol están completamente llenos, excepto posiblemente el último nivel, que se llena de izquierda a derecha.

- Cumple con la propiedad de _heap_, que establece que el valor de cada nodo es mayor o igual que el valor de sus hijos. Si el valor del nodo es mayor que el de sus hijos, se trata de un árbol **heap máximo**, si el valor del nodo es menor que el de sus hijos, se trata de un árbol **heap mínimo**.

- Visualmente, un árbol _heap_ se puede representar de la siguiente forma:

![Árbol Heap](images/heap-tree-1.png)

- Son una opción natural para implementar colas de prioridad.

- Son la estructura esencial para posteriormente implementar _heap sort_ (lo veremos más adelante en los algoritmos de ordenamiento).

### Tipo de dato abstracto

Un heap tiene las siguientes operaciones:

- **Insertar (insert)**: añade un elemento al heap y funciona de la siguinte manera:
  1. Añade el elemento al final del array.
  2. Compara el elemento con su padre y si es mayor, intercambia el elemento con su padre.
  3. Repite el paso 2 hasta que el elemento sea menor que su padre o llegue a la raíz del heap.
- **Eliminar (delete)**: elimina el nodo raíz del heap,
- **Obtener (get)**: permite ver el nodo raíz del heap sin eliminarlo.

```java
public interface IHeap {
    void insert(int element);
    int delete();
    int get();
}
```

### Implementación de árboles heap

Normalmente se implementan sobre un array. La raíz del árbol se almacena en la posición 0 del array, y los hijos de un nodo en la posición `i` se almacenan en las posiciones `2 * i + 1` y `2 * i + 2`.

![Árbol Heap](images/heap-tree-2.png)

```java
public class HeapTree {
    private int[] heap;
    private int size;

    public HeapTree(int capacity) {
        heap = new int[capacity];
        size = 0;
    }

    public void insert(int element) {
        if (size == heap.length) {
            throw new IllegalStateException("Heap is full");
        }
        heap[size++] = element;
        heapifyUp(size);
    }

    public int delete() {
        if (size == 0) {
            throw new IllegalStateException("Heap is empty");
        }

        int root = heap[0];
        heap[0] = heap[size - 1];
        size--;
        heapifyDown(0);

        return root;
    }

    public int get() {
        if (size == 0) {
            throw new IllegalStateException("Heap is empty");
        }

        return heap[0];
    }

    private void heapifyUp(int index) {
        int parentIndex = (index - 1) / 2;

        while (index > 0 && heap[index] > heap[parentIndex]) {
            swap(index, parentIndex);
            index = parentIndex;
            parentIndex = (index - 1) / 2;
        }
    }

    private void heapifyDown(int index) {
        int leftChildIndex = 2 * index + 1;
        int rightChildIndex = 2 * index + 2;
        int largestIndex = index;

        if (leftChildIndex < size && heap[leftChildIndex] > heap[largestIndex]) {
            largestIndex = leftChildIndex;
        }

        if (rightChildIndex < size && heap[rightChildIndex] > heap[largestIndex]) {
            largestIndex = rightChildIndex;
        }

        if (largestIndex != index) {
            swap(index, largestIndex);
            heapifyDown(largestIndex);
        }
    }

    private void swap(int index1, int index2) {
        int temp = heap[index1];
        heap[index1] = heap[index2];
        heap[index2] = temp;
    }
}
```

## Árboles AVL
Los árboles AVL son árboles binarios de búsqueda **balanceados**. Fueron los primeros árboles auto-balanceados que se propusieron. Fueron introducidos por Adelson-Velsky y Landis en 1962.

Dado que se mantienen balanceados, las operaciones de búsqueda, inserción y eliminación tienen un tiempo de ejecución garantizado de O(log n) y no sufren de la degradación de rendimiento que sufren los árboles binarios de búsqueda no balanceados.

### Características
- Es un árbol binario de búsqueda.
- Está balanceado en altura.
- El factor de balance de cada nodo es -1, 0 o 1.
- Las eliminaciones e inserciones pueden requerir balanceo a través de rotaciones.

> El factor de balance de un nodo es la diferencia entre la altura del subárbol derecho y la altura del subárbol izquierdo.

```java
          10
        /    \
       5      15
      / \    /  \
     3   8  12   20
    / \         /   \
   2   4       17    25
```


Factores de balance de cada nodo:

| Nodo | Factor de Balance |
|------|------------------|
| 10   | 4 - 4 = 0       |
| 5    | 2 - 3 = -1       |
| 15   | 3 - 2 = 1       |
| 3    | 2 - 2 = 0       |
| 8    | 1 - 1 = 0       |
| 12   | 1 - 1 = 0       |
| 20   | 2 - 2 = 0       |
| 2    | 0 - 0 = 0       |
| 4    | 0 - 0 = 0       |
| 17   | 1 - 1 = 0       |
| 25   | 1 - 1 = 0       |


### Ventajas
- Búsquedas rápidas
- Auto-balanceados

### Desventajas
- Requieren más memoria que los árboles binarios de búsqueda no balanceados.
- Las operaciones de inserción y eliminación son más lentas que en los árboles binarios de búsqueda no balanceados.
- Las rotaciones pueden ser costosas.
- Difíciles de implementar.

### Inserción
Para insertar un nodo _w_: 

- Se realiza una inserción normal de un árbol binario de búsqueda para el nodo _w_.

- Iniciando en _w_, se recorre el camino de búsqueda hacia la raíz. Sea _z_ el primero nodo no balanceado, _y_ el hijo de _z_ que está en el camino de _w_ a _z_ y _x_ el nieto de _z_ que está en el camino de _w_ a _z_.

- Se rebalancea el árbol mediante rotaciones simples o dobles en el subárbol con raíz en _z_. Hay 4 posibles casos de rotaciones.
 
  - **Rotación derecha**: _y_ es el hijo izquierdo de _z_ y _x_ es el hijo izquierdo de _y_. 
  - **Rotación Izquierda-derecha**: _y_ es el hijo izquierdo de _z_ y _x_ es el hijo derecho de _y_.
  - **Rotación Izquierda**: _y_ es el hijo derecho de _z_ y _x_ es el hijo derecho de _y_.
  - **Rotación Derecha-izquierda**: _y_ es el hijo derecho de _z_ y _x_ es el hijo izquierdo de _y_.


#### Ejemplo de rotación derecha

Dado el siguiente árbol AVL:

 ```java
        10
      /    \
     5      15
    / \    /  \
   3   8  12   20
  / \         /   \
 2   4       17    25
```

Se inserta el nodo 1:
 
 ```java
          10
        /    \
       5      15  -------> 5 es z
      / \    /  \
     3   8  12   20 -------> 3 es y
    / \         /   \
   2   4       17    25 -------> 2 es x
  /
 1
```

El factor de balance del nodo 5 es 2, por lo que se debe rebalancear el árbol. El nodo 3 es el hijo de 5 que está en el camino de 1 a 5 y el nodo 2 es el nieto de 5 que está en el camino de 1 a 5. Estamos en el caso de rotación derecha.

Aplicando el siguiente código a _z_:

```java
void rotateRight(Node node) {
    Node left = node.left;
    node.left = left.right;
    left.right = node;
    node = left;
}
```

Se obtiene: 

 ```java
        10
      /    \
     3      15
    / \    /  \
   2   5  12   20
  /   / \    /   \
 1   4   8  17    25   
```

> La rotación izquieda es la versión espejo de la rotación derecha.

#### Ejemplo de rotación izquierda-derecha
Dado el siguiente árbol AVL:

  ```java
          10
        /    \
       5     15
      / \   /  \
     4   8 12  20
    /         / \
   2         17 25 
```

Se inserta el nodo 3:

  ```java
          10
        /    \
       5     15 
      / \   /  \
     4   8 12  20 ----------> 4 es z
    /         / \
   2         17 25  --------> 2 es y
    \
     3 ----------------------> 3 es x
```

El factor de balance del nodo 5 es 2, por lo que se debe rebalancear el árbol. El nodo 4 es el hijo de 5 que está en el camino de 3 a 5 y el nodo 2 es el nieto de 5 que está en el camino de 3 a 5. Estamos en el caso de rotación izquierda-derecha.

Aplicando el siguiente código a _z_:

```java
void rotateLeftRight(Node node) {
    rotateLeft(node.left);
    rotateRight(node);
}

void rotateLeft(Node node) {
    Node right = node.right;
    node.right = right.left;
    right.left = node;
    node = right;
}


void rotateRight(Node node) {
    Node left = node.left;
    node.left = left.right;
    left.right = node;
    node = left;
}
```

Primero, se rota a la izquierda el nodo 2:
  
```java
          10
        /    \
       5     15 
      / \   /  \
     4   8 12  20
    /         / \
   3         17 25
  /  
 2    
```  


Luego, se rota a la derecha el nodo 4:

```java
          10
        /    \
       5     15 
      / \   /  \
     3   8 12  20
    / \        / \
   2   4       17 25
```  

> La rotación derecha-izquierda es la versión espejo de la rotación izquierda-derecha.


#### Implementación de inserción
```java	
class AVLNode {
    int key, height;
    AVLNode left, right;

    AVLNode(int key) {
        this.key = key;
        this.height = 1;
        this.left = this.right = null;
    }
}

public class AVLTree {
    private AVLNode root;

    // Get height of node
    private int height(AVLNode node) {
        if (node == null)
            return 0;
        return node.height;
    }

    // Get balance factor of node
    private int getBalance(AVLNode node) {
        if (node == null)
            return 0;
        return height(node.right) - height(node.left);
    }

    // Right rotate subtree rooted with y
    private AVLNode rightRotate(AVLNode y) {
        AVLNode x = y.left;
        AVLNode T2 = x.right;

        // Perform rotation
        x.right = y;
        y.left = T2;

        // Update heights
        y.height = Math.max(height(y.left), height(y.right)) + 1;
        x.height = Math.max(height(x.left), height(x.right)) + 1;

        return x;
    }

    // Left rotate subtree rooted with x
    private AVLNode leftRotate(AVLNode x) {
        AVLNode y = x.right;
        AVLNode T2 = y.left;

        // Perform rotation
        y.left = x;
        x.right = T2;

        // Update heights
        x.height = Math.max(height(x.left), height(x.right)) + 1;
        y.height = Math.max(height(y.left), height(y.right)) + 1;

        return y;
    }

    // Insert a key into the tree
    public void insert(int key) {
        root = insertRecursive(root, key);
    }

    // Recursive function to insert a key into the tree
    private AVLNode insertRecursive(AVLNode node, int key) {
        // Perform normal BST insertion
        if (node == null)
            return new AVLNode(key);

        if (key < node.key)
            node.left = insertRecursive(node.left, key);
        else if (key > node.key)
            node.right = insertRecursive(node.right, key);
        else // Duplicate keys not allowed
            return node;

        // Update height of this ancestor node
        node.height = 1 + Math.max(height(node.left), height(node.right));

        // Get the balance factor of this ancestor node
        int balance = getBalance(node);

        // If node becomes unbalanced, perform rotations
        // Left Left Case
        if (balance > 1 && key < node.left.key)
            return rightRotate(node);

        // Right Right Case
        if (balance < -1 && key > node.right.key)
            return leftRotate(node);

        // Left Right Case
        if (balance > 1 && key > node.left.key) {
            node.left = leftRotate(node.left);
            return rightRotate(node);
        }

        // Right Left Case
        if (balance < -1 && key < node.right.key) {
            node.right = rightRotate(node.right);
            return leftRotate(node);
        }

        return node;
    }
```
### Eliminación
Para eliminar en un árbol AVL:

- Se realiza una eliminación normal de un árbol binario de búsqueda.

- Comenzando desde w, avanza hacia arriba y encuentra el primer nodo desequilibrado. Sea z el primer nodo desequilibrado, y el hijo de mayor altura de z, y x el hijo de mayor altura de y. 

- Rebalancea el árbol realizando rotaciones apropiadas en el subárbol con raíz en z. Puede haber 4 casos posibles que deben ser manejados, ya que x, y y z pueden estar dispuestos de 4 formas diferentes. A continuación se presentan las 4 disposiciones posibles:

    - **Rotación derecha**: _y_ es el hijo izquierdo de _z_ y _x_ es el hijo izquierdo de _y_. 
    - **Rotación Izquierda-derecha**: _y_ es el hijo izquierdo de _z_ y _x_ es el hijo derecho de _y_.
    - **Rotación Izquierda**: _y_ es el hijo derecho de _z_ y _x_ es el hijo derecho de _y_.
    - **Rotación Derecha-izquierda**: _y_ es el hijo derecho de _z_ y _x_ es el hijo izquierdo de _y_.


Dado el siguiente árbol, eliminemos 5:
```java
          10
        /    \
       5     15 
      / \   /  \
     3   8 12  20
    / \        / \
   2   4       17 25
```

Se elimina el nodo 5 usando la lógica de eliminación de un árbol binario de búsqueda:

```java
          10
        /    \
       4     15 
      / \   /  \
     3   8 12  20
    /          / \
   2          17 25
```

En este punto, no se cumple la propiedad de AVL. Se elimina 8:

```java
          10
        /    \
       4     15 
      /     /  \
     3     12  20
    /          / \
   2          17 25
```

Se puede notar que 4 tiene un factor de balance -2, por lo que debe rebalancear usando rotación derecha en 4:

```java
          10
        /    \
       3     15  -------> 4 es z
      / \    /  \
     2   4   12  20 -------> 3 es y
                / \
               17 25 -------> 2 es x
```

Se eliminan 2 y 4:

```java
          10-------> 10 es z
        /    \
       3      15----> 17 es y  
             /  \
            12  20-------> 15 es x
                / \
               17 25 
```

Estos nos dejan con un factor de balance en 10 de 2, por lo que se debe rebalancear usando rotación izquierda en 10:

```java
          15
        /    \
       10     20
      /  \   /  \    
     3   12 17  25 
```

### Búsquedas y recorridos
No hay cambios con respecto a BST

## Árboles de expresión

Aunque no son técnicamente un TDA distinto, es relevante mencionarlos dado que su uso es muy común en la resolución de problemas de programación.

Son árboles binarios en los que las hojas son operandos y los nodos internos son operadores. Se utilizan para representar (y resolver) expresiones aritméticas o expresiones sintácticas de un lenguaje de programación en la etapa de compilación.

Por ejemplo, la expresión matemática `3 + (4 * 5)` se puede representar con el siguiente árbol de expresión:

```
    +
   / \
  3   *
     / \
    4   5
```

### Conversión de arboles de expresión a notación infija

La notación infija es la forma tradicional de escribir expresiones matemáticas, en la que los operadores se escriben entre los operandos. Para generar la expresión, únicamente se requiere recorrer el árbol en inorden (izquierda, raíz, derecha).

```java
private void inOrderRecursive(TreeNode root) {
    if (root != null) {
        inOrderRecursive(root.left);
        System.out.print(root.key + " ");
        inOrderRecursive(root.right);
    }
}
```

Para la expresión: `(x + y) * (a - b)`, el árbol sería:

![Ejemplo de árbol de expresión #1](images/expression-tree-1.png)

Para la expresión: `(x * (y - z)) * (a - f)`, el árbol sería:

![Ejemplo de árbol de expresión #2](images/expression-tree-2.png)

Para la expresión: `(x * (y / -Z))`, el árbol sería:

![Ejemplo de árbol de expresión #3](images/expression-tree-3.png)

Para la expresión: `(A + (B * - (C + D)))`, el árbol sería:

![Ejemplo de árbol de expresión #4](images/expression-tree-4.png)

Para la expresión: `((A * (X + Y)) * C)`, el árbol sería:

![Ejemplo de árbol de expresión #5](images/expression-tree-5.png)

### Conversión de expresión a árbol de expresión

Para convertir una expresión infija a un árbol de expresión, primero se debe convertir la expresión a notación postfija (postfix) y luego se debe recorrer la expresión postfija para construir el árbol.

### Convertir expresión infija a postfija

Para convertir una expresión infija a postfija, se puede utilizar el algoritmo de Shunting Yard. Este algoritmo fue desarrollado por Edsger Dijkstra en 1961 y permite convertir una expresión infija a postfija en tiempo lineal.

El algoritmo utiliza dos estructuras de datos: una pila para almacenar los operadores y una cola para almacenar los operandos. El algoritmo recorre la expresión infija de izquierda a derecha y, dependiendo del tipo de token que se encuentre, realiza una de las siguientes acciones:

- Si el token es un operando, se añade a la cola.
- Si el token es un operador, se añade a la pila. Antes de añadirlo, se verifica si hay operadores en la pila con mayor precedencia. Si es así, se desapilan y se añaden a la cola.

Por ejemplo,

![Paso 1](images/expression-tree-6.png)

![Paso 2](images/expression-tree-7.png)

![Paso 3](images/expression-tree-8.png)

![Paso 4](images/expression-tree-9.png)

La cola (que contiene la expresión en postfijo) se utiliza como input para generar el árbol de expresión.

![Paso 1](images/expression-tree-10.png)

![Paso 2](images/expression-tree-11.png)

![Paso 3](images/expression-tree-12.png)

![Paso 4](images/expression-tree-13.png)

## Árboles B

Los árboles B son una variante de los árboles N-arios que se utilizan para almacenar grandes cantidades de datos en disco. Los árboles B son muy utilizados en bases de datos y sistemas de archivos.

Descritos por Rudolf Bayer y Edward M. McCreight en 1972, los árboles B son árboles balanceados que se caracterizan por tener un número variable de hijos por nodo. Los árboles B son muy similares a los árboles binarios de búsqueda, pero con la diferencia de que cada nodo puede tener más de dos hijos.

Visualmente se pueden representar de la siguiente forma:

![Árbol B](images/b-tree-1.png)

### Características

Un árbol B de orden _m_, tiene las siguientes características:

- Cada nodo se compone de llaves y ramas. Las llaves están ordenadas y dividen las ramas en el órden esperado. Por ejemplo, entre las llaves 15 y 20, hay un nodo hijo, cuyas llaves serán mayores a 15 pero menores a 20.
- Todas las hojas están al mismo nivel.
- Se define con un orden _m_, que depende del tamaño del bloque del disco
- Cada nodo excepto la raíz **debe** contener al menos _m/2_ llaves. La raíz contiene un mínimo de una una llave.
- La inserción siempre ocurre en las hojas.
- Crecen o decrecen desde la raíz.

> Pueden implementarse en memoria principal o en secundaria (propósito original). En este curso, nos enfocaremos en la implementación en memoria principal.

### Estructura básica en Java

```java
class BTreeNode {
    int order;
    int[] keys;
    int keyCount;
    BTreeNode[] branches;
}
```

### Búsqueda
Es muy similar a la búsqueda de un elemento en un BST. Los pasos se pueden resumir de la siguiente manera para buscar una llave _k_:

1. Iniciando en la raíz, se compara _k_ con las llaves del nodo. Si _k_ se encuentra, se retorna el nodo o `true`. 
2. Al ir comparando a _k_ con cada una de las llaves, si se encuentra alguna llave mayor a _k_ (o se llega al final de las llaves, osea _k_ es mayor que todas), y hay una rama para dicha llave, se desciende por esa rama y se repite el proceso.
3. Si estamos en una rama, y no se encuentra _k_ en las llaves, se return `null` o `false`

```java
private Node Search(Node x, int key) {
    int i = 0;
    if (x == null)
      return x;
    for (i = 0; i < x.n; i++) {
      if (key < x.key[i]) {
        break;
      }
      if (key == x.key[i]) {
        return x;
      }
    }
    if (x.leaf) {
      return null;
    } else {
      return Search(x.child[i], key);
    }
  }
```  

### Inserción

El árbol B crece hacia arriba desde la raíz. La inserción siempre ocurre en las hojas.

El proceso de inserción para una llave _k_ sería:

- Se busca la llave en la raíz, entre las llaves del nodo.
- Dado que las llaves del nodo están ordenadas, se detiene si hay una llave mayor. Si tiene un hijo, se desciende a él y se repite el proceso.
- Si el nodo no tiene hijos:
  - Si el nodo no está lleno, se inserta en la posición correspondiente del arreglo de llaves
  - Si el nodo está lleno, se divide el nodo.

El proceso de división de un nodo _n_ con _m-1_ llaves es el siguiente:

1. Se selecciona la llave mediana _m_ y se sube al nodo padre.
2. Se crean dos nuevos nodos, _n1_ y _n2_.
3. Se distribuyen las llaves de _n_ entre _n1_ y _n2_.
4. Se actualizan las ramas de _n1_ y _n2_.

El proceso de división se repite hasta llegar a la raíz.

Graficamente se puede ver de la siguiente manera (orden 5):

![Árbol B](images/b-tree-insertion-1.png)

> La raíz está llena. Al insertar la llave 8:

![Árbol B](images/b-tree-insertion-2.png)

> Varios elementos después:

![Árbol B](images/b-tree-insertion-3.png)

> Varios elementos después...:

![Árbol B](images/b-tree-insertion-4.png)

### Eliminación
Eliminar en un árbol B consiste de:
1. Encontrar el nodo que contiene la llave a eliminar.
2. Eliminar la llave del nodo.
3. Balancear el árbol para 

#### Caso #1 - El nodo es hoja
En este caso, la llave por eliminar está en un nodo _hoja_. Hay dos sub-casos:
 
*1.1* El nodo tiene más de _m-1_ llaves. En este caso, simplemente se elimina la llave.

Por ejemplo en este árbol de orden 3:

![Árbol B](images/b-tree-deletion-1.png)

*1.2* El nodo tiene _m-1_ llaves. En este caso, se _pide prestado_ una llave de uno de los nodos hermanos. Primero se visita el hermano izquierdo. Si el hermano izquierdo tiene más de _m-1_ llaves, se toma la llave más grande del hermano izquierdo Si no, se chequea el hermano derecho

![Árbol B](images/b-tree-deletion-2.png)

Si los dos hermanos tienen _m-1_ llaves, se fusionan los nodos y se elimina la llave del nodo padre. La mezcla de los nodos se haces mediante el nodo padre.

![Árbol B](images/b-tree-deletion-3.png)

#### Caso #2 - El nodo es interno
Si la llave por eliminar está dentro de un nodo interno, los siguientes casos pueden ocurrir:

*2.1* La llave eliminada se reemplaza por la llave inmediatamente mayor (o menor) del sub-árbol derecho (o izquierdo) del nodo, siuempre y cuando el sub-árbol derecho (o izquierdo) más del mínimo de llaves.

![Árbol B](images/b-tree-deletion-4.png)

*2.2* Si ninguno de los hijos izquierdo o derecho tiene más de _m-1_ llaves, se fusionan los nodos y se elimina la llave del nodo padre.

![Árbol B](images/b-tree-deletion-5.png)

#### Caso #3
La eliminación ocurre en un nodo interno. Si no se puede realizar el caso #2 (anterior), se unen los hijos junto con el padre. 

![Árbol B](images/b-tree-deletion-6.png)

## Tries

Un Trie (del inglés _reTRIEval_) es una estructura de datos que permite almacenar un conjunto de cadenas de caracteres y realizar búsquedas de palabras en ellas. Los Tries son árboles de búsqueda n-arios que almacenan cadenas de caracteres, donde cada nodo del árbol representa un carácter. Los Tries son útiles para realizar búsquedas de palabras en un conjunto de cadenas de caracteres, como en diccionarios o en motores de búsqueda.

> Se pronuncia como el inglés _try_.

Visualmente, un trie se puede ilustrar como:

![Trie](images/trie-1.png)

Cada rama de un nodo corresponde a un caracter de la llave insertada. El último nodo de cada llave se conoce como _EndOfWord_. La raíz no tiene un valor asignado.

### El TDA Trie

El TDA Trie tiene las siguientes operaciones básicas:

- **Insertar (insert)**: añade una cadena de caracteres al trie.
- **Buscar (search)**: busca una cadena de caracteres en el trie.
- **Eliminar (delete)**: elimina una cadena de caracteres del trie.

### Estructura básica

```java
class TrieNode
{
    TrieNode[] children = new TrieNode[ALPHABET_SIZE];
    boolean isEndOfWord;

    TrieNode(){
        isEndOfWord = false;
        for (int i = 0; i < ALPHABET_SIZE; i++)
            children[i] = null;
    }
}

class Trie
{
    TrieNode root;
}
```

### Inserción

Insertar una _llave_ en un Trie es un proceso simple:

- Cada caracter de la llave se inserta como un nodo Trie individual.
- Los hijos de un nodo son un arreglo de punteros (o referencias) a los nodos del siguiente nivel del trie.
- El caracter de la llave actúa como un índice para el arreglo de hijos. Si la llave de entrada es nueva o una extensión de la llave existente, se construyen nodos no existentes de la llave y se marca el final de la palabra para el último nodo.
- Si la llave de entrada es un prefijo de la llave existente en el Trie, simplemente se marca el último nodo de la llave como el final de una palabra.

La longitud de la llave determina la profundidad del Trie.

![Trie](images/trie-2.png)

```java
void insert(String key) {
    int level;
    int length = key.length();
    int index;

    TrieNode pCrawl = root;

    for (level = 0; level < length; level++) {
        index = key.charAt(level) - 'a';
        if (pCrawl.children[index] == null)
            pCrawl.children[index] = new TrieNode();

        pCrawl = pCrawl.children[index];
    }

    // mark last node as leaf
    pCrawl.isEndOfWord = true;
}
```

### Búsqueda

Buscar una llave en un Trie es similar a la operación de inserción. Sin embargo, se detiene si no hay más caracteres en la llave o si no hay más nodos en el Trie. La búsqueda puede terminar debido al final de una cadena o la falta de una llave en el Trie.

- En el primer caso, si el campo isEndOfWord del último nodo es verdadero, entonces la llave existe en el Trie.
- En el segundo caso, la búsqueda termina sin examinar todos los caracteres de la llave, ya que la llave no está presente en el Trie.

```java
boolean search(String key) {
    int level;
    int length = key.length();
    int index;
    TrieNode pCrawl = root;

    for (level = 0; level < length; level++) {
        index = key.charAt(level) - 'a';

        if (pCrawl.children[index] == null)
            return false;

        pCrawl = pCrawl.children[index];
    }
    return (pCrawl.isEndOfWord);
}
```