# Bases de Datos
En este capítulo, se introducen conceptos fundamentales de bases de datos relacionales y NoSQL. Dicho conocimiento proveerá una conclusión al tema de almacenamiento externo y funcionará como base para los cursos posteriores centrados en bases de datos.

## Definiciones fundamentales
Un **dato** es una representación simbólica (numérica, alfabética, algorítmica, etc.) de un atributo o variable cuantitativa o cualitativa. Los datos describen hechos, entidades o relaciones entre ellos. Por ejemplo, un dato puede ser la edad de una persona, el nombre de un producto o la fecha de un evento.

Una **base de datos** es una colección de datos organizada para un propósito específico. Las bases de datos puede ser almancenadas en medios no electrónicos, como la base de datos de una biblioteca, donde cada tarjeta de papel, tiene datos de un libro específicos. Para efectos de este capítulos, consideramos las bases de datos dentro del contexto de Tecnologías de la Información, donde los datos son almacenados y gestionados electrónicamente.

Las bases de datos tiene un _dominio_ o universo de discurso específico, que describe el tipo de datos que almacenan. **No hay bases de datos genéricas**.

Un sistema administrador de bases de datos (DBMS) es un software que permite a los usuarios crear, leer, actualizar y eliminar datos en una base de datos. Ejemplos de DMBS comunes son MySQL, PostgreSQL, Oracle, SQL Server, SQLite, DB2, MongoDB, entre otras.

![DBMS populares](./images/08-databases/image-01.png)

## Enfoques en el manejo de la información
### Enfoque orientado a archivos
Antes de la era de los DBMS, los datos generados por los sistemas de información se almacenaban en archivos simples. El programa o el sistema que los accediera, era responsable de interpretar el formato de cada registro y asegurar la consistencia del archivo completo. Usualmente, un programa accedía a un único archivo con información diseñada para este. Sin embargo, conforme la complejidad de los sistemas crece, surgen problemas como:

- Formatos inconsistentes
- Redundancia (duplicación) de datos en archivos separados
- Diseño de datos ineficiente
- Inseguridad en el manejo de los datos
- Cambios en los archivos requerían cambios en los programas (acoplamiento alto)
- Fragilidad en la integridad de los datos, un error en un programa podía corromper los datos

Bajo el enfoque de archivos, los datos se almacenaban secuencialmente en los archivos, en registros compuestos de campos por ejemplo:

![Estructura de un archivo](./images/08-databases/image-02.png)

En los DBMS modernos, los datos estructurados, se almacenan _lógicamente_ con una estructura igual, es decir, registros y campos.

### Enfoque orientado a bases de datos
Tal y como se mencionó en secciones anteriores, el DBMS es un software que permite a los usuarios crear, leer, actualizar y eliminar datos en una base de datos. Bajo este enfoque, se crea una capa de indirección entre los programas y los datos, delegando la responsabilidad de la gestión de los datos al DBMS. Los programas acceden a los datos a través de consultas y comandos, sin necesidad de conocer la estructura interna de la base de datos.

Las ventajas de este enfoque son:

- **Independencia de los datos**: Los programas no necesitan conocer la estructura interna de la base de datos. Los DBMS son auto-descriptivos, es decir, pueden describir su estructura interna.

![Metadata en los DBMS](./images/08-databases/image-03.png)

- **Integridad de los datos**: Los DBMS pueden aplicar reglas de integridad para garantizar la precisión y consistencia de los datos.

- **Seguridad**: Los DBMS pueden controlar el acceso a los datos y protegerlos contra accesos no autorizados.

- **Concurrencia**: Los DBMS pueden gestionar el acceso simultáneo a los datos por múltiples usuarios.

- **Escalabilidad**: Los DBMS pueden manejar grandes volúmenes de datos y crecer con las necesidades de la organización.

- **Facilidad para compartir datos**: Los DBMS permiten compartir datos entre  múltiples usuarios y aplicaciones, sin necesidad de duplicarlos.

Algunos de los componentes de un DBMS incluyen: 

- **Datos**: La información almacenada en la base de datos.

- **Motor de base de datos**: Interpreta y ejecuta las consultas y comandos enviados por los usuarios.

- **Lenguaje de consulta**: Permite a los usuarios interactuar con la base de datos mediante consultas y comandos.

- **Gestor de transacciones**: Controla las operaciones de inserción, actualización y eliminación de datos para garantizar la consistencia y la integridad.

- **Gestor de almacenamiento**: Administra el almacenamiento físico de los datos en el disco.

- **Gestor de seguridad**: Controla el acceso a los datos y protege la base de datos contra accesos no autorizados.

## Tipos de bases de datos
De forma análoga a los lenguajes de programación en los que se adopta un paradigma que determina sus características, las bases de datos pueden adoptar un enfoque:

1. **Relacional**: Las bases de datos relacionales almacenan datos en tablas, donde cada fila representa un registro y cada columna un campo. Las relaciones entre las tablas se establecen mediante claves primarias y claves foráneas. Se fundamentan en el modelo relacional propuesto por Edgar Codd en 1970.

1. **Orientadas a objetos**: los datos se modelan como objetos, con atributos y métodos. Las bases de datos orientadas a objetos permiten almacenar objetos complejos y sus relaciones de manera eficiente.

1. **NoSQL**: Las bases de datos NoSQL (Not Only SQL) son una alternativa a las bases de datos relacionales, diseñadas para manejar grandes volúmenes de datos no estructurados o semi-estructurados de manera flexible y escalable. NoSQL se refiere a una amplia gama de tecnologías de bases de datos que no utilizan el modelo relacional tradicional basado en tablas.

Algunos DBMS pueden soportar más de un enfoque, por ejemplo, Oracle Database soporta bases de datos relacionales y objetos. Por eso, decimos que la base de datos sigue un enfoque específico en vez de referirse al DBMS como tal.

> Los tipos de bases de datos listadas en esta sección excluyen tipos utilizados en el pasado. Podrá aprender más sobre esto en el curso de bases de datos.

### Bases de datos relacionales
Se fundamentan en el modelo relacional propuesto por Edgar Codd en 1970. En este modelo, los datos se almacenan en tablas, donde cada fila representa un registro y cada columna un campo. Cada fila tiene un identificador único llamado clave primaria, que permite identificar de manera única cada registro en la tabla. Considere la siguiente tabla llamada `ESTUDIANTE`:

| ID | NOMBRE | EDAD | CARRERA |
|----|--------|------|---------|
| 1  | Juan   | 20   | Ingeniería en Sistemas |
| 2  | María  | 22   | Ingeniería Civil |
| 3  | Pedro  | 21   | Ingeniería Industrial |

La columna ID es la clave primaria de la tabla ESTUDIANTE. No pueden haber dos o más registros con el mismo ID. 

Las relaciones entre las tablas se establecen mediante claves foráneas, que son campos en una tabla que hacen referencia a la clave primaria de otra tabla. Por ejemplo, considere la tabla `CURSO`:

| ID | NOMBRE | ESTUDIANTE_ID |
|----|--------|---------------|
| 1  | Matemáticas | 1 |
| 2  | Física | 2 |
| 3  | Química | 3 |

La columna `ESTUDIANTE_ID` es una clave foránea que hace referencia a la clave primaria de la tabla `ESTUDIANTE`. Esta relación permite asociar un curso con un estudiante. No hace falta duplicar la información del estudiante en la tabla `CURSO` (tener todos los campos de `ESTUDIANTE` de nuevo en la tabla `CURSO`).

#### Terminología clave
Algunos de los conceptos clave en las bases de datos relacionales son:

- _Relación_: Una tabla que almacena datos relacionados.
- _Atributo_: Una columna en una tabla que representa un campo de datos.
- _Esquema de la relación_: La estructura de una tabla, que incluye los atributos y las restricciones. Puede verse como una clase en Orientación a Objetos que define la estructura pero no es un objeto en sí.
- _Tuplas_: Una fila o registro en una tabla que representa una instancia en particular de dicha relación. 
- _Clave primaria_: Un atributo o conjunto de atributos que identifica de manera única cada tupla en una tabla.
- _Clave foránea_: Un atributo en una tabla que hace referencia a la clave primaria de otra tabla.
- _Clave candidata_: Un atributo o conjunto de atributos que pueden ser claves primarias.

#### Integridad referencial
La integridad referencial es una restricción que garantiza que las relaciones entre las tablas sean válidas. En una relación entre dos tablas, la clave foránea en la tabla secundaria debe hacer referencia a una clave primaria existente en la tabla principal. Por ejemplo, en la tabla `CURSO`, el campo `ESTUDIANTE_ID` debe hacer referencia a un `ID` existente en la tabla `ESTUDIANTE`.

Estos permite que las relaciones se "normalicen", es decir, que se evite la redundancia de datos y se garantice la consistencia de los datos.

#### ACID
ACID es un acrónimo que describe las propiedades de las transacciones en una base de datos relacional. Las transacciones son operaciones que modifican los datos en una base de datos y deben cumplir con las siguientes propiedades:

- _Atomic_: Una transacción es atómica si se ejecuta completamente o no se ejecuta en absoluto. Si una parte de la transacción falla, se deshace la transacción completa.
- _Consistent_: Una transacción es consistente si lleva la base de datos de un estado consistente a otro estado consistente. La base de datos debe cumplir con todas las restricciones de integridad antes y después de la transacción.
- _Isolated_: Una transacción es aislada si su ejecución es independiente de otras transacciones. Las transacciones concurrentes no deben interferir entre sí
- _Durable_: Una transacción es duradera si los cambios realizados por la transacción persisten en la base de datos incluso después de un fallo del sistema.

#### El lenguaje SQL (Structured Query Language)
Es un lenguaje estandarizado para interactuar con bases de datos relacionales. SQL permite realizar diversas operaciones para gestionar datos de manera eficiente y precisa. Las operaciones SQL se puede clasificar en dos tipos:

- **DDL (Data Definition Language)**: Utilizado para definir y modificar estructuras de bases de datos (CREATE, ALTER, DROP).
- **DML (Data Manipulation Language)**: Utilizado para manipular datos dentro de objetos de la base de datos (SELECT, INSERT, UPDATE, DELETE).

Aunque el lenguaje SQL es un estandar del American National Standards Institute (ANSI), cada DBMS puede tener extensiones propias o dialectos específicos.

| Operación                               | Descripción  |
|-----------------------------------------|--------------|
| ```sql
SELECT columna1, columna2
FROM tabla
WHERE condición;
``` | Consulta SELECT para recuperar datos de una tabla. |
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
## NoSQL

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

## Referencias
Gillenson. M. (2012). Fundamentals of Database Management Systems. John Wiley & Sons.