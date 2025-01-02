$pandocFolderAndExe = "Pandoc\pandoc.exe" 
$basePath = ${env:LOCALAPPDATA}
$alternativeBasePath = "C:\Program Files"
$pandoc = "$basePath\$pandocFolderAndExe"

if ((Test-Path -Path $pandoc) -eq $false) 
{
    $pandoc = "$alternativeBasePath\$pandocFolderAndExe"
    if ((Test-Path -Path $pandoc) -eq $false) 
    {
        Write-Host "Pandoc not found"
        return;
    }
}

& $pandoc -o ./DSA-1.pdf `
    --toc --number-sections `
    --top-level-division=chapter `
    ./metadata.yaml `
    ./ce-1103/01-Programacion-orientada-a-objetos.md `
    ./ce-1103/02-estructuras-de-datos-lineales.md `
    ./ce-1103/03-estructuras-de-datos-jerarquicas.md `
    ./ce-1103/04-ordenamiento-y-busqueda.md `
    ./ce-1103/05-grafos.md

& $pandoc -o ./DSA-2.pdf `
    --toc --number-sections `
    --top-level-division=chapter `
    ./metadata-2.yaml `
    ./ce-2103/01-administracion-de-memoria.md `
    ./ce-2103/02-analisis-de-algoritmos.md `
    ./ce-2103/03-diseño-de-algoritmos.md `
    ./ce-2103/04-algoritmos-de-busqueda.md `
    ./ce-2103/05-estructuras-de-almacenamiento-externo.md `
    ./ce-2103/08-bases-de-datos.md