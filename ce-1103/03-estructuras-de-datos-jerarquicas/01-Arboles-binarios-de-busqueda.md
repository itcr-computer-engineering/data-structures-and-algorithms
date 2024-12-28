# Introducción a Árboles Binarios de Búsqueda (BST)
Un BST es un árbol binario que cumple con la siguiente propiedad: para cada nodo, todos los nodos del subárbol izquierdo tienen un valor menor que el nodo y todos los nodos del subárbol derecho tienen un valor mayor que el nodo.

Gráficamente, un BST se ve de la siguiente forma:

<pre>
        8
       / \
      3   10
     / \    \
    1   6   14
       / \  /
      4   7 13
</pre>

Los BST se pueden implementar mediante arrays o nodos enlazados. En este curso, BST se verán como nodos enlazados. Los _árboles Heap_ que veremos más adelante, se implementarán con arrays.

# Implementación
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

## Búsqueda de elementos
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

## Inserción de elementos
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

## Eliminación de elementos
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

## Recorridos
Recorrer un árbol no solo es útil para imprimirlo, sino que también es útil para realizar operaciones en todos los nodos. Los recorridos más comunes son:

- Inorden (izquierda, raíz, derecha)
- Preorden (raíz, izquierda, derecha)
- Postorden (izquierda, derecha, raíz)

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

### In-orden
El recorrido in-orden de un árbol BST imprime los nodos en *orden ascendente*. Esto se debe a que el recorrido in-orden visita primero el subárbol izquierdo, luego la raíz y finalmente el subárbol derecho. 

Por ejemplo, el siguiente árbol:

<pre>
        8
       / \
      3   10
     / \    \
    1   6   14
       / \  /
      4   7 13
</pre>

Se imprime como `1 3 4 6 7 8 10 13 14`.

## Pre-orden
El recorrido pre-orden de un árbol BST imprime la raíz antes que los subárboles. Esto se debe a que el recorrido pre-orden visita primero la raíz, luego el subárbol izquierdo y finalmente el subárbol derecho.

<pre>
        8
       / \
      3   10
     / \    \
    1   6   14
       / \  /
      4   7 13
</pre>

Se imprime como `8 3 1 6 4 7 10 14 13`.


## Post-orden
El recorrido post-orden de un árbol BST imprime los subárboles antes que la raíz. Esto se debe a que el recorrido post-orden visita primero el subárbol izquierdo, luego el subárbol derecho y finalmente la raíz.

<pre>
        8
       / \
      3   10
     / \    \
    1   6   14
       / \  /
      4   7 13
</pre>

Se imprime como `1 4 7 6 3 13 14 10 8`.

# El problema de los BST de no ser balanceados
Los BST pueden degenerar en listas enlazadas si los elementos se insertan en orden. Esto puede ocurrir si los elementos se insertan en orden ascendente o descendente. En este caso, la búsqueda, inserción y eliminación se convierten en operaciones de tiempo lineal.

<pre>
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
</pre>                        