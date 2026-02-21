$root     = 'C:\source\data-structures-and-algorithms'
$printDir = "$root\_print"
$wk       = 'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
$output   = "$root\Algoritmos y Estructuras de Datos.pdf"
$cover    = "file:///$($root -replace '\\','/')/cover.html"
$tocXsl   = "$root\toc.xsl"

# Collect print-ready pages in book order using Get-ChildItem
$prefixes = @(
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

$wkArgs = @(
    '--enable-local-file-access',
    '--print-media-type',
    '--outline',
    '--outline-depth', '3',
    '--margin-top',    '22mm',
    '--margin-bottom', '20mm',
    '--margin-left',   '25mm',
    '--margin-right',  '22mm',
    '--footer-left',   'Algoritmos y Estructuras de Datos',
    '--footer-right',  '[page]/[topage]',
    '--footer-font-size', '8',
    '--footer-font-name', 'Segoe UI',
    '--footer-spacing', '5',
    '--encoding', 'utf-8',
    'cover', $cover,
    'toc', '--xsl-style-sheet', $tocXsl
)

foreach ($spec in $prefixes) {
    $f = Get-ChildItem "$printDir\$($spec.Course)" -Filter "$($spec.Prefix)*.html" |
         Where-Object { $_.Name -notmatch 'toc' } |
         Select-Object -First 1
    if (-not $f) { Write-Warning "Missing: $($spec.Course) $($spec.Prefix)"; continue }
    $url = 'file:///' + ($f.FullName -replace '\\', '/')
    $wkArgs += 'page', $url
    Write-Host "  + $($f.Name)"
}

$wkArgs += $output

Write-Host "`nRunning wkhtmltopdf..." -ForegroundColor Cyan
& $wk @wkArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "Done: $output" -ForegroundColor Green
} else {
    Write-Error "wkhtmltopdf exited with code $LASTEXITCODE"
}
