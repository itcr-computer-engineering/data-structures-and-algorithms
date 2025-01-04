# Algoritmos de búsqueda
Este tema abarca los algoritmos de búsqueda en estructuras de datos como arrays y expande para incluir búsquedas en planos (aplicables a juegos por ejemplo). No incluye motores de búsqueda textuales.

## Búsqueda secuencial

Búsqueda secuencial es la solución trivial para buscar en una colección de elementos. Cuando la colección está desordenada, es la única opción. Revisa/procesa cada elemento hasta encontrar el elemento deseado.

- En el peor caso, cada elemento de la colección es comparado contra la llave de búsqueda
- Si hay un _match_, la búsqueda termina y se retorna el índice del elemento
- Si no hay _match_, se retorna -1 (u otro índice negativo)

Por ejemplo, dado el siguiente array, para buscar el elemento `20`, se seguiría el siguiente proceso:

![](images/search-algo-1.png)

### Implementación

```java
public class SequentialSearch {
    public static int search(int[] arr, int x) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == x) {
                return i;
            }
        }
        return -1;
    }
}
```

### Time complexity

- Worst-case: O(n)
- Best-case: O(1)

### Consideraciones importantes

- Es ineficiente para colecciones grandes
- Si el array no está ordenado o se quiere evitar ordenar, es la única opción

## Búsqueda binaria
Búsqueda binaria es un algoritmo de búsqueda que encuentra la posición de un valor en un arreglo ordenado. A diferencia de la búsqueda lineal, que recorre el arreglo desde el primer elemento hasta el último, la búsqueda binaria divide el arreglo en dos mitades y compara el valor buscado con el elemento en el medio. 
- Si el valor buscado es menor que el elemento en el medio, la búsqueda continúa en la mitad izquierda del arreglo. 
- Si el valor buscado es mayor que el elemento en el medio, la búsqueda continúa en la mitad derecha del arreglo. 

Este proceso se repite hasta que el valor buscado sea encontrado o hasta que el subarreglo de búsqueda sea vacío.

### Ejecución de búsqueda binaria
Dado el siguiente arreglo:

```
| Indices   | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| Elementos | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
```
Para buscar el número 9:
- Comenzamos comparando el número 9 con el elemento en el medio del arreglo, que es 5.
- Como 9 es mayor que 5, la búsqueda continúa en la mitad derecha del arreglo.
- Ahora comparamos el número 9 con el elemento en el medio de la mitad derecha del arreglo, que es 8.
- Como 9 es mayor que 8, la búsqueda continúa en la mitad derecha de la mitad derecha del arreglo.
- Ahora comparamos el número 9 con el elemento en el medio de la mitad derecha de la mitad derecha del arreglo, que es 9.
- Como 9 es igual a 9, hemos encontrado el número que buscábamos.

Visualmente, se puede representar de la siguiente manera:
```
| Indices   | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| Elementos | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
            |-----------------------------------|
    5 < 9                     ^
                                |---------------|
    7 < 9                             ^  
                                        |-------|  
    8 < 9                                 ^
                                             |--|
    9 == 9                                    ^
```

### Implementación en Java
```java	
public static int binarySearch(int[] arr, int target) {
    int left = 0;
    int right = arr.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (arr[mid] == target) {
            return mid;
        }

        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}
```

## Búsqueda por interpolación

- Es una mejora sobre `búsqueda binaria`, especificamente si los valores en el array están distribuídos uniformemente. La búsqueda por interpolación calcula la posición de la mitad del array basado en el valor del elemento buscado y los valores en los extremos del array.

- Búsqueda binaria siempre compara contra el elemento central del array, mientras que búsqueda por interpolación considera la llave de búsqueda antes de decidir contra cual elemento del array comparar.

- El código es igual al de búsqueda binaria, con la diferencia de que la posición del elemento medio se calcula de manera diferente:

```
mid = low + ((high - low) / (arr[high] - arr[low])) * (x - arr[low])
```

> Low y high se refieren a los índices del array, y arr[low] y arr[high] a los valores en esos índices.

La mejora en rendimiento con respecto a búsqueda binaria se da en el caso promedio (que depende de la distribución uniforme de los elementos en el array), con una complejidad de tiempo de `O(log log n)`.

### Referencias

- https://iq.opengenus.org/time-complexity-of-interpolation-search/


## Búsqeda por salto (Jump Search)

- Aplicable para arrays ordenados
- Compara menos elementos que búsqueda lineal saltándose _n_ elementos a la vez
- Determinar el tamaño del bloque de saltos es crucial para el rendimiento del algoritmo
- Normalmente se utiliza sqrt(n) como tamaño de bloque, donde n es el tamaño del array

![](images/search-algo-2.png)

### Complejidad

Complejidad temporal: O(sqrt(n))

### Referencias

- https://www.geeksforgeeks.org/jump-search/

## Pathfinding

_Pathfinding_ se refiere a búsqueda de caminos entre dos puntos en un plano, especialmente útil para video juegos y simulaciones. Incluye una amplia variedad de algoritmos y no hay una solución única para todos los casos. Por ejemplo, la elección del algoritmo depende de:

- ¿És el destino estacionario o móvil?
- ¿Hay obstáculos en el mapa?
- ¿Hay diferente tipos de terreno en el mapa?

### Pathfinding básico

### Pathfinding basado en grafos

#### Dijkstra

Cuando hay costos de movimiento según la dirección. Se lleva el costo acumulado de llegar a cada nodo y se elige el camino con menor costo.

```java
frontier = PriorityQueue()
frontier.put(start, 0)
came_from = {}
cost_so_far = {}
came_from[start] = None
cost_so_far[start] = 0
while not frontier.empty() {
    current = frontier.get()
    if current == goal {
        break
    }
    for next in graph.neighbors(current) {
        new_cost = cost_so_far[current] + graph.cost(current, next)
        if next not in cost_so_far or new_cost < cost_so_far[next] {
            cost_so_far[next] = new_cost
            priority = new_cost
            frontier.put(next, priority)
            came_from[next] = current
        }
    }
}
```

> Visualmente, se puede entender la diferencia entre BFS y Dijkstra en el siguiente gráfico: https://www.redblobgames.com/pathfinding/a-star/introduction.html#breadth-first-search

#### A\*

Considera el costo real (similar a Dijkstra) y una heurística que estima el costo restante. La heurística es una función que estima el costo de llegar al destino desde un nodo dado. La heurística debe ser admisible, es decir, nunca sobreestimar el costo real.

Se utiliza con ciertas mejoras, en game engines modernos, como Unity.

```java
frontier = PriorityQueue()
frontier.put(start, 0)
came_from = {}
cost_so_far = {}
came_from[start] = None
cost_so_far[start] = 0
while not frontier.empty() {
    current = frontier.get()
    if current == goal {
        break
    }
    for next in graph.neighbors(current) {
        new_cost = cost_so_far[current] + graph.cost(current, next)
        if next not in cost_so_far or new_cost < cost_so_far[next] {
            cost_so_far[next] = new_cost
            priority = new_cost + heuristic(goal, next)
            frontier.put(next, priority)
            came_from[next] = current
        }
    }
}
```

Para calcular la heurística, se puede utilizar la distancia Manhattan o la distancia Euclidiana. La distancia Manhattan es la suma de las diferencias en las coordenadas x y y, mientras que la distancia Euclidiana es la distancia en línea recta.

```java
// Manhattan distance
function heuristic(a, b) {
    return abs(a.x - b.x) + abs(a.y - b.y)
}
```

Dependiendo del escenario, la heurística puede ser precalculada y almacenada en una tabla de búsqueda.

A* y Dijkstra son similares, pero A* es más rápido porque la heurística guía la búsqueda hacia el destino. La visualización [aquí](https://www.redblobgames.com/pathfinding/a-star/introduction.html#astar) permite compararlas.

Aunque A* y Dijkstra encuentran el camino, la cantidad de comparaciones realizadas por A* es mucho menor. En el peor caso, A* es igual a Dijkstra, pero en el mejor caso, A* es mucho más rápido.
e

### Referencias

- [Pathfinding](https://en.wikipedia.org/wiki/Pathfinding)
- [Pathfinding on Grids](https://www.redblobgames.com/pathfinding/a-star/introduction.html)
