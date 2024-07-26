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

Los lenguajes orientados a objetos permiten establecer el nivel de visibilidad que tiene un atributo o método con respeto a otros objetos o clases. Por ejemplo, C# soporta muchos modificadores de acceso, entre los que se incluyen:

- `public`: Accesible desde cualquier parte del código.
- `private`: Accesible solo desde la misma clase.
- `protected`: Accesible desde la misma clase y sus clases derivadas.



# Herencia
La herencia permite definir jerarquías de objetos con el objetivo de reutilizar código. Cada clase puede tener máximo una clase padre de la que hereda atributos y métodos. La clase padre se llama superclase y la clase hija se llama subclase. La superclase provee comportamiento general, mientras que las subclases proveen comportamiento especializado. La herencia define una relación de tipo "es un/a" entre la superclase y la subclase. Por ejemplo, si tenemos una clase `Vehículo` y una clase `Automóvil`, podemos decir que un automóvil es un vehículo.


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

* Etimologicamnete muchas formas
* Hay dos tipos: run-tinme y compile time

## Run-time 

* Cuando una clase hija sobrecarga(override)un metodo public/protected der la clase padre.Cuando el codigo cliente llama el metodo en la clase hija, elmetodo  se "resuelve" en ese mmomento invocando el metodo sobre cargo.

``` java
class Padre {
    public voidd foo(){
        sys.out("Algo");
    }
}

class Hija{
    public void foo(){
        super.foo(); //opcional
        sys.out("Algo mas")
    }
}

```
* Polimorfismo permite tratar la clase hija como si fuera la padre.

```java

Padre p = new Hija();
p.foo() -> se resuelve en un run-time e invoca Hija.foo

```

* Cualquier metodo visible de la clase Padre se puede acceder a traves de la Hija.

``` java
Hija h= new Hija;
   _____ 
h.|     | -> Aparece todo lo visible del Padre
  |     |
  |_____|

```

* Al reves no. A traves de la Padre, solo lo que es visible de la hija que es comun con la del Padre se puede acceder.


``` java

Padre p = new Hija;
   _____ 
p.|     | -> Aparece solo lo ccmun delPpadre e Hija
  |     |
  |_____|

```

* Algunos Lenguajes permiten crear claes abstractas que son utles para polimorfismos

``` java
//no se puede instanciar

abstract class Animal{ 
    void respirar(){
        sys.out("Respirando")
    }
    abstract void(); //no tiene cuerpo
}

//Obliga a pverride los metodos abstract

class Perro{
    void comer(){  
    }
}

```

* Las clases tambien permiten crear interfases. Las interfases proveen polimorfismos sin formar parte de una jerarquia.

``` java
interface Alimentable{
    void alimentar();
}

class Persona implements Alimentable{
    void alimentar();
}

```

## Compile-time

* La habilidad para sobre cargar(ovrerride) metodos, esdecir crear varios metodos con el mimismo nombre pero diferentes parametros.
 
 ``` java
 class test{
    void foo(){
    }
    void foo(int x){
    }
    void foo(strin s, int x){
    }
 }

```
 # Abstraccion

 * Algo propio de POO>
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