# Programación Orientada a Objetos
En este capítulo, se introduce la programación orientada a objetos junto a conceptos esenciales para comprender su funcionamiento e implementación en lenguajes de programación comunes.

## Conceptos esenciales
Antes de entrar en detalle en POO, es importante entender algunos conceptos básicos de programación y tipos de datos. Estos conceptos son fundamentales para comprender cómo funciona la programación orientada a objetos y cómo se pueden utilizar en la práctica.

### Tipos de Datos
Un *tipo de dato* es una clasificación que especifica qué tipo de valores puede tomar una variable, así como las operaciones que se pueden realizar sobre estos valores. Los tipos de datos se utilizan en la declaración de variables y en la definición de funciones, entre otros usos.

Por ejemplo, en `Python`, los tipos de datos más comunes son:

- **Enteros (int)**: Números enteros como 1, 20, -5.
- **Flotantes (float)**: Números con decimales como 3.14
- **Cadenas (str)**: Secuencias de caracteres como "Hola, mundo!"
- **Booleanos (bool)**: Valores de verdad como True o False

Con respecto a las operaciones que se pueden realizar con estos tipos de datos, por ejemplo, se pueden realizar operaciones aritméticas con enteros y flotantes, concatenar cadenas, y realizar operaciones lógicas con booleanos.

Los IDEs suelen proporcionar herramientas para trabajar con tipos de datos, como autocompletado y resaltado de sintaxis, lo que facilita la escritura y comprensión del código tal y como se muestra en la siguiente imagen:

![Ejemplo de autocompletado en el IDE según el tipo de dato](images/01-programación-orientada-a-objectos/image-00.png)

### Tipo de dato simple y compuesto
Un *tipo de dato simple* es un tipo de dato que representa un único valor. Los tipos de datos simples son los tipos de datos básicos que se utilizan para representar valores individuales. No tiene sentido práctico separalos en partes más pequeñas.

Un *tipo de dato compuesto* es un tipo de dato que representa una colección de valores. Los tipos de datos compuestos se utilizan para representar estructuras de datos más complejas que contienen múltiples valores de otros tipos de datos. Por ejemplo, un tipo de dato Cliente, puede contener los datos de nombre, edad, dirección, etc. **Los objetos se consideran tipos de datos compuestos**.

### Tipo referencia y tipo valor
Un *tipo de referencia* es un tipo de dato que almacena una referencia a un ubicación en memoria. Los tipos de referencia se utilizan para acceder memoria que puede ser compartida y modificada por múltiples partes de un programa. Por ejemplo, en `Python`, las listas y los diccionarios son tipos de referencia. **Los objetos en la mayoría de lenguajes orientados a objetos también son tipos de referencia**.

Un *tipo valor* es un tipo de dato que almacena un valor directamente en la memoria. Los tipos de valor se utilizan para representar valores que no pueden ser compartidos ni modificados por múltiples partes de un programa. Por ejemplo, en `Python`, los enteros y los flotantes son tipos de valor.

Usualmente los tipos de datos simples son tipos de valor, mientras que los tipos de datos compuestos son tipos de referencia. Puede leer más para el caso de C# [aquí](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types).

### Tipos de Datos Abstractos
Un *tipo de dato abstracto (TDA)* es un modelo conceptual que define un conjunto de valores y un conjunto de operaciones que se pueden realizar con esos valores. Los TDAs son una forma de abstracción que permite a los programadores trabajar con datos de manera más abstracta y genérica.

Un TDA especifica una interfaz que define las operaciones que se pueden realizar con los datos, **pero no especifica cómo se implementan esas operaciones**. Esto permite a los programadores utilizar los TDAs sin tener que preocuparse por los detalles de implementación subyacentes. Por tanto, se puede decir que un TDA tiene una vista lógica y una vista física o de implementación. 

```mermaid
classDiagram
class List {
    AddFirst(element: int)
    AddLast()
    DeleteFirst()
    DeleteLast()
    Find()
    Clear()
}
<<Interface>> List

class ArrayList {
    internalArray: int[];
}

class LinkedList {
    First: Node;
}

ArrayList ..|> List
LinkedList ..|> List
```
En el diagrama anterior, se ilustra como un TDA Lista, puede ser implementado mediante Nodos con memoria dinámica o mediante un arreglo con memoria estática. El API expuesto por el tipo Lista, no debe dar detalles de cómo se implementa internamente.

Una estructura de datos se puede entender como la implementación de TDA. En Programación Orientada a Objetos, **un TDA + implementación forman una clase**. Algunos lenguajes permiten definir *interfaces* que son un TDA puro.

## Conceptos esenciales de programación orientada a objetos (POO)
POO es un paradigma de programación que modela conceptos del mundo real como _objetos_ que tienen atributos y comportamientos. Los objetos son *ciudadanos de primera clase* en la programación orientada a objetos (POO), lo que significa que pueden ser manipulados y pasados como argumentos a funciones. Construir software orientado a objetos implica definir clases que representan tipos de objetos y crear instancias de esas clases (objetos) para interactuar entre sí.

> Puede leer más sobre otros paradigmas de programación [aquí](https://es.wikipedia.org/wiki/Paradigma_de_programaci%C3%B3n).

### Definición de Objeto
Estructura de datos que agrupa atributos (datos) y métodos (funciones) que operan sobre esos datos. Los objetos son instancias de clases, que definen la estructura (definida mediante los *atributos*) y comportamiento de los objetos (definido mediante los *métodos*).

La **interfaz** de un objeto se define por los métodos y atributos **públicos** que son accesibles desde fuera del objeto. Es decir, por otros objetos que usen el objecto en cuestión.

La mayoría de lenguajes de programación orientados a objetos, requieren la definición de clases para crear objetos. 

### Definición de Clase
Las clases son _plantillas que definen la estructura y comportamiento de los objetos_. Por ejemplo, la clase Televisor en C# se puede definir de la siguiente manera:

```csharp
class Televisor
{
    // Atributos
    string marca;
    int pulgadas;
    bool encendido;

    // Métodos
    void Encender()
    {
        encendido = true;
    }

    void Apagar()
    {
        encendido = false;
    }
}
```
Para generar objetos a partir de la clase Televisor, se utilizan las siguientes instrucciones:

```csharp
Televisor samsung = new Televisor();
Televisor lg = new Televisor();
lg.Encender();
Console.WriteLine(samsung.encendido); // Imprime false
```

Un objeto opera sobre sus propios datos y no afecta la memoria de otros objetos diferentes. **Cada objeto es un bloque de memoria independiente que contiene sus propios datos y métodos.**

> *Clase vs Objeto*
>
> La clase define una plantilla, plano o molde para crear objetos basados en estos. Es decir, a partir de una clase se crean o instancian objetos

Definir clases es una forma de extender el lenguaje de programación, definiendo nuevos tipos de datos compuestos.

## Principios de programación orientada a objetos
Son los conceptos fundamentales que rigen la programación orientada a objetos, la base para entender cómo se estructura y cómo se trabaja con este paradigma. Son los elementos distintivos que diferencian la programación orientada a objetos de otros paradigmas.

Los principios de POO son los siguientes:
- Abstracción
- Encapsulamiento
- Herencia
- Polimorfismo

### Abstracción
Es la principal característica de POO. Permite modelar el problema por resolver en términos de objetos de alto nivel que ocultan los detalles de su implementación. La abstracción se logra a través de la creación de clases y objetos que representan entidades del mundo real. Por ejemplo, una clase `Persona` puede representar a una persona en el mundo real, con atributos como nombre, edad, etc., y métodos que permiten interactuar con la persona.

Al interactuar con objetos, pensamos en términos de su comportamiento y atributos en vez de variables y procedimientos.

> Piezas de LEGO vs Plasticina
>
> La abstracción permite que los objetos se comporten como piezas de LEGO que tienen una interfaz específica para interactuar con ellos, pero no necesitamos saber cómo están construidos internamente. En cambio, al trabajar con plasticina, no hay una clara separación, sino que todo forma parte de un todo.

Aunque algunos lenguajes tienen la palabra reservada *Abstract*, esto no tiene relación con la abstracción como principio de POO.

### Encapsulamiento
Los objetos son módulos autocontenidos que asocian código con sus datos. Los datos dentro de los objetos pueden o no exponerse según el programador lo decida. El **encapsulamiento** permite ocultar los detalles de implementación de un objeto y exponer solo la interfaz necesaria para interactuar con él.

Por ejemplo, en el código siguiente, los objetos de tipo *BankAccount*, ocultan los detalles de implementación de los métodos `Deposit` y `Withdraw`, y exponen solo la interfaz necesaria para interactuar con ellos. Ningún objecto externo a *BankAccount* puede acceder directamente a los atributos `accountNumber` y `balance`.

![Ejemplo de encapsulamiento](./images/01-programación-orientada-a-objectos/image-01.png)

Los lenguajes orientados a objetos permiten establecer el nivel de visibilidad que tiene un atributo o método con respeto a otros objetos o clases. Por ejemplo, C# soporta muchos modificadores de acceso, entre los que se incluyen:

- `public`: Accesible desde cualquier parte del código.
- `private`: Accesible solo desde la misma clase.
- `protected`: Accesible desde la misma clase y sus clases derivadas.

Por ejemplo, considere la siguiente clase Persona:

```csharp
public class Persona
{
    private string nombre;

    public string GetNombre()
    {
        return nombre;
    }

    public void SetNombre(string nombre)
    {
        this.nombre = nombre;
    }
}
```

En este ejemplo, el atributo nombre está declarado como private, lo que significa que solo es accesible desde la misma clase. Sin embargo, se proporcionan métodos públicos `GetNombre()` y `SetNombre()` para acceder y modificar el valor de nombre de manera controlada.

> Puede leer sobre los modificadores de acceso en C# [<u>aquí</u>](https://learn.microsoft.com/es-es/dotnet/csharp/language-reference/keywords/access-modifiers). Igualmente puede leer más sobre get y set en C# [<u>aquí</u>](https://learn.microsoft.com/es-es/dotnet/csharp/programming-guide/classes-and-structs/properties).

### Herencia
La herencia permite definir jerarquías de objetos con el objetivo de reutilizar código. Cada clase puede tener máximo una clase padre de la que hereda atributos y métodos. 

La clase padre se llama *superclase* y la clase hija se llama *subclase*. La superclase provee comportamiento general, mientras que las subclases proveen comportamiento especializado. 

La herencia define una relación de tipo "es un/a" entre la superclase y la subclase. Por ejemplo, si tenemos una clase `Vehículo` y una clase `Automóvil`, podemos decir que *un automóvil es un vehículo*.


```csharp
// Definición de la clase base
public class Animal
{
    public string Nombre { get; set; }
    public int Edad { get; set; }

    public void Comer()
    {
        Console.WriteLine("El animal está comiendo");
    }
}

// Definición de una subclase que hereda de Animal
public class Perro : Animal
{
    public void Ladrar()
    {
        Console.WriteLine("El perro está ladrando");
    }
}

// Uso de la herencia en el programa principal
public class Program
{
    public static void Main(string[] args)
    {
        // Creación de una instancia de la clase base
        Animal animal = new Animal();
        animal.Nombre = "Animal";
        animal.Edad = 5;
        animal.Comer();

        // Creación de una instancia de la subclase
        // Nótese que Perro hereda de Animal
        // las propiedas como Nombre y Edad
        Perro perro = new Perro();
        perro.Nombre = "Firulais";
        perro.Edad = 3;
        perro.Comer();
        perro.Ladrar();
    }
}
```

### Polimorfismo
Etimológicamente significa _"muchas formas"_ y se refiere a la capacidad de un objeto de comportarse de diferentes maneras. Hay dos tipos: _run-time_ y _compile time_.

#### Run-time (tiempo de ejecución)
Cuando una clase hija anula (override) un método public/protected de la clase padre. Por ejemplo:

```csharp
public class Shape
{
    public virtual void Draw()
    {
        Console.WriteLine("Drawing a shape");
    }
}

public class Circle : Shape
{
    public override void Draw()
    {
        Console.WriteLine("Drawing a circle");
    }
}

public class Square : Shape
{
    public override void Draw()
    {
        Console.WriteLine("Drawing a square");
    }
}

public class Program
{
    public static void Main(string[] args)
    {
        Shape shape1 = new Circle();
        Shape shape2 = new Square();

        shape1.Draw(); // Output: Drawing a circle
        shape2.Draw(); // Output: Drawing a square
    }
}
```
Cuando el código cliente llama el método, el método se "resuelve" en ese momento invocando el método correcto. Para encontrar el método correcto, el compilador busca en la clase real del objeto en tiempo de ejecución y en caso de no estar, sigue subiendo por la jerarquía de clases.

Polimorfismo permite tratar la clase hija como si fuera la padre. Cualquier atributo o método visible de la clase Padre se puede acceder a traves de la Hija. Cualquier método o atributo que sea específico de la hija, no es accesible a traves de la clase padre.

Algunos lenguajes permiten crear claes abstractas que son útiles para polimorfismo.

```csharp
public abstract class Animal
{ 
    void Respirar()
    {
        Console.Write("Respirando")
    }
    
    abstract PorDefinir(); // no tiene definición y fuerza a las hijas a implementarla
}

public class Perro : Animal 
{
    void Comer()
    { 
        Console.Write("Comiendo") 
    }

    // implementa el método abstracto de la clase padre. 
    // Si no lo hace, el compilador arroja un error.
    void PorDefinir() 
    { 
        Console.Write("Foo...") 
    }
}

```
Algunos lenguajes tambien permiten crear _interfaces_ las cuales proveen polimorfismo sin formar parte de una jerarquía.

```csharp
public interface Alimentable
{
    void alimentar();
}

public class Persona : Alimentable {

    // Implementa el método de la interfaz. Si no 
    // lo hace, el compilador arroja un error.
    void alimentar() 
    { 
        Console.Write("Comiendo") 
    }
}

```

#### Compile-time
La habilidad para sobrecargar (overload) métodos, es decir, crear varios métodos con el mismo nombre pero diferentes parámetros.
 
 ```csharp
 public class TestClass 
 {
    void foo() 
    {
    }
    
    void foo(int x) 
    {
    }

    void foo(string s, int x) 
    {
    }
 }

```