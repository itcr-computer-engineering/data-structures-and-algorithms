# Introducción
Prinicipios de POO se refiere a los conceptos fundamentales que rigen la programación orientada a objetos. Estos conceptos son la base para entender cómo se estructura y cómo se trabaja con la programación orientada a objetos. Son los elementos distintivos que diferencian la programación orientada a objetos de otros paradigmas de programación.

Los principios de POO son los siguientes:
- Abstracción
- Encapsulamiento
- Herencia
- Polimorfismo

# Abstracción
Es la principal característica de POO. Permite modelar el problema por resolver en términos de objetos de alto nivel que ocultan los detalles de su implementación. La abstracción se logra a través de la creación de clases y objetos que representan entidades del mundo real. Por ejemplo, una clase `Persona` puede representar a una persona en el mundo real, con atributos como nombre, edad, etc., y métodos que permiten interactuar con la persona.

Al interactuar con objetos, pensamos en términos de su comportamiento y atributos en vez de variables y procedimientos.

> La abstracción permite que los objetos se comporten como piezas de LEGO que tienen una interfaz específica para interactuar con ellos, pero no necesitamos saber cómo están construidos internamente. En cambio, al trabajar con plasticina, no hay una clara separación, sino que todo forma part de un todo.

# Encapsulamiento
Los objetos son módulos autocontenidos que asocian código con sus datos. Los datos dentro de los objetos pueden o no exponerse según el programador lo decida. El **encapsulamiento** permite ocultar los detalles de implementación de un objeto y exponer solo la interfaz necesaria para interactuar con él.

```csharp
// Example of encapsulation in C#

public class BankAccount
{
    private string accountNumber;
    private decimal balance;

    public BankAccount(string accountNumber)
    {
        this.accountNumber = accountNumber;
        this.balance = 0;
    }

    public decimal GetBalance()
    {
        return balance;
    }

    public void Deposit(decimal amount)
    {
        balance += amount;
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= balance)
        {
            balance -= amount;
        }
        else
        {
            Console.WriteLine("Insufficient funds");
        }
    }
}

public class Program
{
    public static void Main(string[] args)
    {
        BankAccount account = new BankAccount("1234567890");
        account.Deposit(1000);
        account.Withdraw(500);
        decimal balance = account.GetBalance();
        Console.WriteLine("Account balance: " + balance);
    }
}
```

Los lenguajes orientados a objetos permiten establecer el nivel de visibilidad que tiene un atributo o método con respeto a otros objetos o clases. Por ejemplo, C# soporta muchos modificadores de acceso, entre los que se incluyen:

- `public`: Accesible desde cualquier parte del código.
- `private`: Accesible solo desde la misma clase.
- `protected`: Accesible desde la misma clase y sus clases derivadas.

Por ejemplo, considera la siguiente clase Persona:

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

# Herencia
- La herencia permite definir jerarquías de objetos con el objetivo de reutilizar código. 
- Cada clase puede tener máximo una clase padre de la que hereda atributos y métodos. 
- La clase padre se llama superclase y la clase hija se llama subclase. La superclase provee comportamiento general, mientras que las subclases proveen comportamiento especializado. 
- La herencia define una relación de tipo "es un/a" entre la superclase y la subclase. Por ejemplo, si tenemos una clase `Vehículo` y una clase `Automóvil`, podemos decir que un automóvil es un vehículo.


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
        Perro perro = new Perro();
        perro.Nombre = "Firulais";
        perro.Edad = 3;
        perro.Comer();
        perro.Ladrar();
    }
}
```

# Polimorfismo
Etimológicamente significa _"muchas formas"_ y se refiere a la capacidad de un objeto de comportarse de diferentes maneras. Hay dos tipos: _run-time_ y _compile time_.

## Run-time (tiempo de ejecución)

* Cuando una clase hija anula (override) un método public/protected de la clase padre. Por ejemplo:

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
* Cuando el código cliente llama el método, el método se "resuelve" en ese mmomento invocando el método correcto. Para encontrar el método correcto, el compilador busca en la clase real del objeto en tiempo de ejecución y en caso de no estar, sigue subiendo por la jerarquía de clases.

* Polimorfismo permite tratar la clase hija como si fuera la padre.

* Cualquier metodo visible de la clase Padre se puede acceder a traves de la Hija.

``` java
Hija h= new Hija;
   _____ 
h.|     | -> Aparece todo lo visible del Padre
  |     |
  |_____|

```

* Al revés no. A través de la Padre, sólo lo que es visible de la hija que es común con la del Padre se puede acceder.


``` java

Padre p = new Hija;
   _____ 
p.|     | -> Aparece solo lo común del padre e hija
  |     |
  |_____|

```

* Algunos lenguajes permiten crear claes abstractas que son útiles para polimorfismo.

```csharp
abstract class Animal{ 
    void respirar(){
        Console.Write("Respirando")
    }
    abstract void(); //no tiene definición
}

class Perro : Animal {
    void comer(){  
    }
}

```
* Algunos lenguajes tambien permiten crear _interfaces_ las cuales proveen polimorfismo sin formar parte de una jerarquía.

``` java
interface Alimentable{
    void alimentar();
}

class Persona : Alimentable {
    void alimentar();
}

```

## Compile-time

* La habilidad para sobrecargar (overload) métodos, es decir, crear varios métodos con el mismo nombre pero diferentes parámetros.
 
 ``` java
 class TestClass {
    void foo() {
    }
    
    void foo(int x) {
    }

    void foo(string s, int x) {
    }
 }

```
 # Abstraccion

 * Algo propio de POO.
 * Permite modelar el problema em terminos de odjetos(odjetos de alto nivel que ocultan detalles de su implementacion).
 * Uno no interactua  con variables, procedimientos o instrcciones.

 # Punteros

 * Un puntero es una variable que almacena la direccion de memoria

 1. int()
 2. clear()
 3. long()
 + -> Estos son algunos ejemplos de "value type", son copias

 * Sin embargo los String() no son value type, es un reference type.

![Definicion de un puntero con una imagen de  referencia haciendo ilusion a la memoria](https://image.slidesharecdn.com/punteros-120105064722-phpapp01/95/punteros-2-1024.jpg?cb=1325746331)

* Ejemplo de puntero en Java

``` java

public class Persona {
    private String nombre;
    public Persona(String nombre) {
        this.nombre = nombre;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public static void main(String[] args) {
        // Creamos una instancia de Persona
        Persona persona1 = new Persona("Juan");
        // Creamos otra referencia a la misma instancia
        Persona persona2 = persona1;
        // Modificamos el nombre a través de la referencia persona2
        persona2.setNombre("Pedro");
        // Imprimimos el nombre desde ambas referencias
        System.out.println("Nombre de persona1: " + persona1.getNombre());
        System.out.println("Nombre de persona2: " + persona2.getNombre());
    }
}
```

* En este ejemplo:

1. Creamos una instancia de Persona llamada persona1.
2. Luego, creamos otra referencia llamada persona2 que apunta a la misma instancia.
3. Al modificar el nombre a través de persona2, también afectamos a persona1.
4. Ambas referencias apuntan al mismo objeto en memoria.