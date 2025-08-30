docker run --rm --volume "${PWD}:/data" pandoc/extra `
-o "./Algoritmos y estructuras de datos - v1.1.pdf" `
-f markdown+superscript  `
--resource-path=ce-1103:ce-2103 `
--metadata-file=./metadata.yaml `
--defaults=./defaults.yaml `
--top-level-division=section `
--include-in-header=./custom.tex `
./ce-1103/01-Programacion-orientada-a-objetos.md `
./ce-1103/02-estructuras-de-datos-lineales.md `
./ce-1103/03-estructuras-de-datos-jerarquicas.md `
./ce-1103/04-ordenamiento-y-busqueda.md `
./ce-1103/05-grafos.md `
./ce-2103/01-administracion-de-memoria.md `
./ce-2103/02-analisis-de-algoritmos.md `
./ce-2103/03-diseño-de-algoritmos.md `
./ce-2103/04-algoritmos-de-busqueda.md `
./ce-2103/05-estructuras-de-almacenamiento-externo.md `
./ce-2103/06-algoritmos-de-compresion.md `
./ce-2103/08-bases-de-datos.md
