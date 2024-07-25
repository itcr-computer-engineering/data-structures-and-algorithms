# Programación Orientada a Objetos
Paradigma de programación que modela conceptos del mundo real como _objetos_ que tienen atributos y comportamientos. Los objetos son ciudadanos de primera clase en la programación orientada a objetos (POO), lo que significa que pueden ser manipulados y pasados como argumentos a funciones.

Construir software orientado a objetos implica definir clases que representan tipos de objetos y crear instancias de esas clases (objetos) para interactuar entre sí.

## Definición de Objeto
Estructura de datos que agrupa atributos (datos) y métodos (funciones) que operan sobre esos datos. Los objetos son instancias de clases, que definen la estructura y comportamiento de los objetos.
- La estructura o características de un objeto se define mediante sus **atributos**.
- El comportamiento de un objeto se define mediante sus **métodos**.

La **interfaz** de un objeto se define por los métodos y atributos públicos (considerado como una mala practica) que son accesibles desde fuera del objeto.

La mayoría de lenguajes de programación orientados a objetos, requieren la definición de clases para crear objetos. 

## Definición de Clase
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