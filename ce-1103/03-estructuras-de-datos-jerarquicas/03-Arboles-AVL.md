# Árboles AVL
Los árboles AVL son árboles binarios de búsqueda **balanceados**. Fueron los primeros árboles auto-balanceados que se propusieron. Fueron introducidos por Adelson-Velsky y Landis en 1962.

Dado que se mantienen balanceados, las operaciones de búsqueda, inserción y eliminación tienen un tiempo de ejecución garantizado de O(log n) y no sufren de la degradación de rendimiento que sufren los árboles binarios de búsqueda no balanceados.

## Características
- Es un árbol binario de búsqueda.
- Está balanceado en altura.
- El factor de balance de cada nodo es -1, 0 o 1.
- Las eliminaciones e inserciones pueden requerir balanceo a través de rotaciones.

> El factor de balance de un nodo es la diferencia entre la altura del subárbol derecho y la altura del subárbol izquierdo.

<pre>
          10
        /    \
       5      15
      / \    /  \
     3   8  12   20
    / \         /   \
   2   4       17    25
</pre>


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


## Ventajas
- Búsquedas rápidas
- Auto-balanceados

## Desventajas
- Requieren más memoria que los árboles binarios de búsqueda no balanceados.
- Las operaciones de inserción y eliminación son más lentas que en los árboles binarios de búsqueda no balanceados.
- Las rotaciones pueden ser costosas.
- Difíciles de implementar.

# Inserción
Para insertar un nodo _w_: 
- Se realiza una inserción normal de un árbol binario de búsqueda para el nodo _w_.
- Iniciando en _w_, se recorre el camino de búsqueda hacia la raíz. Sea _z_ el primero nodo no balanceado, _y_ el hijo de _z_ que está en el camino de _w_ a _z_ y _x_ el nieto de _z_ que está en el camino de _w_ a _z_.
- Se rebalancea el árbol mediante rotaciones simples o dobles en el subárbol con raíz en _z_. Hay 4 posibles casos de rotaciones.
 
    - **Rotación derecha**: _y_ es el hijo izquierdo de _z_ y _x_ es el hijo izquierdo de _y_. 
    - **Rotación Izquierda-derecha**: _y_ es el hijo izquierdo de _z_ y _x_ es el hijo derecho de _y_.
    - **Rotación Izquierda**: _y_ es el hijo derecho de _z_ y _x_ es el hijo derecho de _y_.
    - **Rotación Derecha-izquierda**: _y_ es el hijo derecho de _z_ y _x_ es el hijo izquierdo de _y_.


## Ejemplo de rotación derecha

Dado el siguiente árbol AVL:

 <pre>
        10
      /    \
     5      15
    / \    /  \
   3   8  12   20
  / \         /   \
 2   4       17    25
</pre>

Se inserta el nodo 1:
 
 <pre>
          10
        /    \
       5      15  -------> 5 es z
      / \    /  \
     3   8  12   20 -------> 3 es y
    / \         /   \
   2   4       17    25 -------> 2 es x
  /
 1
</pre>

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

 <pre>
        10
      /    \
     3      15
    / \    /  \
   2   5  12   20
  /   / \    /   \
 1   4   8  17    25   
</pre>

> La rotación izquieda es la versión espejo de la rotación derecha.

## Ejemplo de rotación izquierda-derecha
Dado el siguiente árbol AVL:

  <pre>
          10
        /    \
       5     15
      / \   /  \
     4   8 12  20
    /         / \
   2         17 25 
</pre>

Se inserta el nodo 3:

  <pre>
          10
        /    \
       5     15 
      / \   /  \
     4   8 12  20 ----------> 4 es z
    /         / \
   2         17 25  --------> 2 es y
    \
     3 ----------------------> 3 es x
</pre>

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
  
<pre>
          10
        /    \
       5     15 
      / \   /  \
     4   8 12  20
    /         / \
   3         17 25
  /  
 2    
</pre>  


Luego, se rota a la derecha el nodo 4:

<pre>
          10
        /    \
       5     15 
      / \   /  \
     3   8 12  20
    / \        / \
   2   4       17 25
</pre>  

> La rotación derecha-izquierda es la versión espejo de la rotación izquierda-derecha.


## Implementación de inserción
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




# Eliminación
Para eliminar en un árbol AVL:
- Se realiza una eliminación normal de un árbol binario de búsqueda.
- Comenzando desde w, avanza hacia arriba y encuentra el primer nodo desequilibrado. Sea z el primer nodo desequilibrado, y el hijo de mayor altura de z, y x el hijo de mayor altura de y. Ten en cuenta que las definiciones de x e y son diferentes a las de la inserción aquí.
- Rebalancea el árbol realizando rotaciones apropiadas en el subárbol con raíz en z. Puede haber 4 casos posibles que deben ser manejados, ya que x, y y z pueden estar dispuestos de 4 formas diferentes. A continuación se presentan las 4 disposiciones posibles:
    - **Rotación derecha**: _y_ es el hijo izquierdo de _z_ y _x_ es el hijo izquierdo de _y_. 
    - **Rotación Izquierda-derecha**: _y_ es el hijo izquierdo de _z_ y _x_ es el hijo derecho de _y_.
    - **Rotación Izquierda**: _y_ es el hijo derecho de _z_ y _x_ es el hijo derecho de _y_.
    - **Rotación Derecha-izquierda**: _y_ es el hijo derecho de _z_ y _x_ es el hijo izquierdo de _y_.


Dado el siguiente árbol, eliminemos 5:
<pre>
          10
        /    \
       5     15 
      / \   /  \
     3   8 12  20
    / \        / \
   2   4       17 25
</pre>

Se elimina el nodo 5 usando la lógica de eliminación de un árbol binario de búsqueda:

<pre>
          10
        /    \
       4     15 
      / \   /  \
     3   8 12  20
    /          / \
   2          17 25
</pre>

En este punto, no se cumple la propiedad de AVL. Se elimina 8:

<pre>
          10
        /    \
       4     15 
      /     /  \
     3     12  20
    /          / \
   2          17 25
</pre>

Se puede notar que 4 tiene un factor de balance -2, por lo que debe rebalancear usando rotación derecha en 4:


<pre>
          10
        /    \
       3     15  -------> 4 es z
      / \    /  \
     2   4   12  20 -------> 3 es y
                / \
               17 25 -------> 2 es x
</pre>

Se eliminan 2 y 4:

<pre>
          10-------> 10 es z
        /    \
       3      15----> 17 es y  
             /  \
            12  20-------> 15 es x
                / \
               17 25 
</pre>

Estos nos dejan con un factor de balance en 10 de 2, por lo que se debe rebalancear usando rotación izquierda en 10:

<pre>
          15
        /    \
       10     20
      /  \   /  \    
     3   12 17  25 
</pre>

# Búsquedas y recorridos
No hay cambios con respecto a BST
