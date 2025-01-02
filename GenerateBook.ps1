$basePath = ${env:LOCALAPPDATA}
$pandoc = "$basePath\Pandoc\pandoc.exe"
& $pandoc -o ./DSA-1.pdf `
    --toc --number-sections `
    --top-level-division=chapter `
    ./metadata.yaml `
    ./ce-1103/01-Programacion-orientada-a-objetos.md `
    ./ce-1103/02-estructuras-de-datos-lineales.md `
    ./ce-1103/03-estructuras-de-datos-jerarquicas.md