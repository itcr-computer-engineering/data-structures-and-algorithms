# GenerateSite.ps1
# Builds the documentation site using DocFX and optionally generates a PDF.
# Usage:
#   .\GenerateSite.ps1           - Build the site
#   .\GenerateSite.ps1 -Serve    - Build and serve locally (http://localhost:8080)
#   .\GenerateSite.ps1 -Pdf      - Build + generate PDF via wkhtmltopdf

param(
    [switch]$Serve,
    [switch]$Pdf
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Write-Host "Building documentation site..." -ForegroundColor Cyan
docfx build "$Root/docfx.json"

if ($LASTEXITCODE -ne 0) {
    Write-Error "docfx build failed."
    exit 1
}

if ($Pdf) {
    $wk = "C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
    if (-not (Test-Path $wk)) {
        Write-Error "wkhtmltopdf not found at $wk. Install it from https://wkhtmltopdf.org/downloads.html"
        exit 1
    }

    $site     = "$Root\_site"
    $printDir = "$Root\_print"
    $output   = "$Root\Algoritmos y Estructuras de Datos.pdf"
    $coverUrl = "file:///$($Root -replace '\\','/')/cover.html"
    $tocXsl   = "$Root\toc.xsl"

    # Pages defined by (course, number prefix) to avoid filename encoding issues (e.g. ñ)
    $pageSpecs = @(
        @{ Course = 'ce-1103'; Prefix = '01-' },
        @{ Course = 'ce-1103'; Prefix = '02-' },
        @{ Course = 'ce-1103'; Prefix = '03-' },
        @{ Course = 'ce-1103'; Prefix = '04-' },
        @{ Course = 'ce-1103'; Prefix = '05-' },
        @{ Course = 'ce-2103'; Prefix = '01-' },
        @{ Course = 'ce-2103'; Prefix = '02-' },
        @{ Course = 'ce-2103'; Prefix = '03-' },
        @{ Course = 'ce-2103'; Prefix = '04-' },
        @{ Course = 'ce-2103'; Prefix = '05-' },
        @{ Course = 'ce-2103'; Prefix = '06-' },
        @{ Course = 'ce-2103'; Prefix = '08-' }
    )

    # --- Extract <article> content and apply elegant print template --------
    Write-Host "Preparing print-ready HTML..." -ForegroundColor Cyan

    $tmpl = [IO.File]::ReadAllText("$Root\template.html", [Text.Encoding]::UTF8)

    foreach ($spec in $pageSpecs) {
        $srcFile = Get-ChildItem "$site\$($spec.Course)" -Filter "$($spec.Prefix)*.html" |
                   Where-Object { $_.Name -notmatch 'toc' } |
                   Select-Object -First 1
        if (-not $srcFile) { Write-Warning "File not found: $($spec.Course) $($spec.Prefix)*.html"; continue }

        $html    = [IO.File]::ReadAllText($srcFile.FullName, [Text.Encoding]::UTF8)
        $m       = [regex]::Match($html, '(?s)<article[^>]*>(.*?)</article>')
        if (-not $m.Success) { Write-Warning "No <article> in $($srcFile.Name)"; continue }

        $baseUrl = 'file:///' + ($srcFile.DirectoryName -replace '\\', '/') + '/'
        $out     = $tmpl.Replace('{BASE}', $baseUrl).Replace('{CONTENT}', $m.Groups[1].Value)

        $outDir  = "$printDir\$($spec.Course)"
        if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
        [IO.File]::WriteAllText("$outDir\$($srcFile.Name)", $out, [Text.Encoding]::UTF8)
    }

    # --- Run wkhtmltopdf --------------------------------------------------
    Write-Host "Generating PDF..." -ForegroundColor Cyan

    $wkArgs = @(
        "--enable-local-file-access",
        "--print-media-type",
        "--outline",
        "--outline-depth", "3",
        "--margin-top",    "22mm",
        "--margin-bottom", "20mm",
        "--margin-left",   "25mm",
        "--margin-right",  "22mm",
        "--footer-left",   "Algoritmos y Estructuras de Datos",
        "--footer-right",  "[page]/[topage]",
        "--footer-font-size", "8",
        "--footer-font-name", "Segoe UI",
        "--footer-spacing", "5",
        "--encoding", "utf-8",
        "cover", $coverUrl,
        "toc", "--xsl-style-sheet", $tocXsl
    )

    foreach ($spec in $pageSpecs) {
        $f = Get-ChildItem "$printDir\$($spec.Course)" -Filter "$($spec.Prefix)*.html" |
             Where-Object { $_.Name -notmatch 'toc' } |
             Select-Object -First 1
        if (-not $f) { Write-Warning "Missing print file: $($spec.Course) $($spec.Prefix)"; continue }
        $wkArgs += "page", ('file:///' + ($f.FullName -replace '\\', '/'))
    }

    $wkArgs += $output

    & $wk @wkArgs

    if ($LASTEXITCODE -eq 0) {
        Write-Host "PDF generated: $output" -ForegroundColor Green
    } else {
        Write-Error "wkhtmltopdf failed with exit code $LASTEXITCODE"
    }
}

if ($Serve) {
    Write-Host "Serving site at http://localhost:8080 ..." -ForegroundColor Green
    docfx serve "$Root\_site"
} elseif (-not $Pdf) {
    Write-Host "Site built successfully in ./_site/" -ForegroundColor Green
    Write-Host "Run '.\GenerateSite.ps1 -Serve' to preview locally." -ForegroundColor Gray
    Write-Host "Run '.\GenerateSite.ps1 -Pdf' to generate a PDF." -ForegroundColor Gray
}
