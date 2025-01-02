# Bases de Datos
Una **base de datos** es una colección organizada de información estructurada, o datos, almacenada típicamente de manera electrónica en un sistema informático. Está diseñada para permitir el acceso, gestión y actualización de datos de manera eficiente.

## Conceptos Clave

- **Datos**: Cualquier información que puede ser almacenada electrónicamente.
- **Sistema de Gestión de Bases de Datos (DBMS)**: Software que permite a los usuarios crear, leer, actualizar y eliminar datos en una base de datos.
- **Tablas**: Estructuras utilizadas para almacenar datos en una base de datos relacional. Las tablas constan de filas (registros) y columnas (campos).

## Tipos de Bases de Datos

1. **Bases de Datos Relacionales**: Organizan los datos en tablas con relaciones predefinidas entre ellas.
2. **Bases de Datos NoSQL**: Diseñadas para manejar grandes volúmenes de datos no estructurados o semi-estructurados.
3. **Bases de Datos Orientadas a Objetos**: Almacenan datos como objetos en lugar de en tablas.

## Terminología Clave de las Bases de Datos

- **Esquema**: Describe la estructura de la base de datos (tablas, campos, relaciones).
- **Clave Primaria**: Identificador único para cada registro en una tabla.
- **Clave Externa**: Campo en una tabla que hace referencia a la clave primaria en otra tabla.
- **Índice**: Mejora la velocidad de las operaciones de recuperación de datos en una tabla de la base de datos.

## SQL (Structured Query Language)

- **SQL**: Lenguaje estándar para interactuar con bases de datos relacionales.
- **DDL (Data Definition Language)**: Utilizado para definir y modificar estructuras de bases de datos (CREATE, ALTER, DROP).
- **DML (Data Manipulation Language)**: Utilizado para manipular datos dentro de objetos de la base de datos (SELECT, INSERT, UPDATE, DELETE).

## Diseño de Bases de Datos

- **Normalización**: Proceso de organización de datos en una base de datos para reducir la redundancia y la dependencia.
- **Diagramas ER (Entity-Relationship)**: Representación visual de entidades de la base de datos y sus relaciones.

## Beneficios de las Bases de Datos

- **Integridad de los Datos**: Asegura que los datos sean precisos y consistentes.
- **Control de Concurrencia**: Gestiona el acceso simultáneo a la base de datos.
- **Escalabilidad**: Capacidad para manejar grandes cantidades de datos.
- **Seguridad**: Protege los datos contra accesos no autorizados.

## Introducción a SQL
SQL (Structured Query Language) es un lenguaje estándar utilizado para interactuar con bases de datos relacionales. Permite realizar diversas operaciones para gestionar datos de manera eficiente y precisa.

### Operaciones Básicas en SQL
1. Consultas SELECT
La operación más común en SQL es la consulta SELECT, que se utiliza para recuperar datos de una o más tablas.

Ejemplo:

```sql
SELECT columna1, columna2
FROM tabla
WHERE condición;
```

2. Inserción de Datos
Para insertar nuevos registros en una tabla, se utiliza la instrucción INSERT.

Ejemplo:

```sql
INSERT INTO tabla (columna1, columna2)
VALUES (valor1, valor2);
```
3. Actualización de Datos
Para actualizar registros existentes en una tabla, se utiliza la instrucción UPDATE.

Ejemplo:

```sql
UPDATE tabla
SET columna1 = nuevo_valor
WHERE condición;
```
4. Eliminación de Datos
Para eliminar registros de una tabla, se utiliza la instrucción DELETE.

Ejemplo:
```sql
DELETE FROM tabla
WHERE condición;
```

Cláusulas y Expresiones SQL
1. Cláusula WHERE
La cláusula WHERE se utiliza para filtrar registros basados en una condición específica.

Ejemplo:

```sql
SELECT columna1, columna2
FROM tabla
WHERE columna1 = 'valor';
```

2. Cláusula ORDER BY
La cláusula ORDER BY se utiliza para ordenar los resultados de una consulta en orden ascendente o descendente.

Ejemplo:

```sql
SELECT columna1, columna2
FROM tabla
ORDER BY columna1 DESC;
```

3. Funciones Agregadas
SQL proporciona funciones agregadas como COUNT, SUM, AVG, MIN y MAX para realizar cálculos en conjuntos de datos.

Ejemplo:

```sql
SELECT COUNT(*)
FROM tabla;
```
## Introducción a NoSQL

NoSQL (Not Only SQL) es un término utilizado para describir bases de datos que no utilizan el modelo relacional tradicional basado en tablas. Estas bases de datos están diseñadas para manejar grandes volúmenes de datos no estructurados o semi-estructurados de manera flexible y escalable.

### Características de NoSQL

- **Estructura Flexible**: Permite almacenar datos con estructuras flexibles sin necesidad de un esquema fijo.
  
- **Escalabilidad Horizontal**: Capacidad para manejar grandes volúmenes de datos distribuyendo la carga en múltiples servidores o nodos.

- **Modelos de Datos Diversos**: Soporta varios modelos de datos como documentos, grafos, columnas y clave-valor, optimizados para diferentes tipos de aplicaciones y cargas de trabajo.

### Tipos de Bases de Datos NoSQL

1. **Bases de Datos de Documentos**
   - **Ejemplo**: MongoDB
   - **Características**: Almacena datos en documentos JSON o BSON. Es flexible y escalable.

2. **Bases de Datos de Grafos**
   - **Ejemplo**: Neo4j
   - **Características**: Modela datos como nodos y relaciones entre ellos. Útil para representar relaciones complejas.

3. **Bases de Datos de Columnas**
   - **Ejemplo**: Apache Cassandra
   - **Características**: Almacena datos en columnas en lugar de filas. Escalable y optimizado para escrituras rápidas.

4. **Bases de Datos Clave-Valor**
   - **Ejemplo**: Redis
   - **Características**: Almacena datos en pares clave-valor. Muy rápido y eficiente para almacenamiento en caché y sesiones.

### Casos de Uso de NoSQL

- **Aplicaciones Web Escalables**: Ideal para aplicaciones web que requieren escalabilidad horizontal y manejo eficiente de grandes volúmenes de datos.

- **Análisis de Datos en Tiempo Real**: Utilizado en bases de datos como Apache Kafka o Elasticsearch para análisis de datos en tiempo real y búsqueda de texto completo.

### Consideraciones y Limitaciones

- **Consistencia**: Algunas bases de datos NoSQL pueden sacrificar consistencia eventualmente consistente.
  
- **Herramientas y Ecosistema**: Aunque cada vez más robusto, el ecosistema y las herramientas de NoSQL pueden ser menos maduras en comparación con las bases de datos relacionales establecidas.

### Ventajas de las bases de datos NoSQL
- Sintaxis más flexible: A diferencia de SQL, que tiene una sintaxis rígida, las bases de datos NoSQL permiten una mayor libertad en la estructura de los datos.
- Escalabilidad horizontal: Pueden crecer fácilmente agregando más servidores.
- Rendimiento: Operan principalmente en memoria, lo que reduce los tiempos de lectura y escritura.