# Extracts <article> content from DocFX HTML and wraps in print template.
# Uses Get-ChildItem with prefix patterns to avoid filename encoding issues.

$site     = 'C:\source\data-structures-and-algorithms\_site'
$printDir = 'C:\source\data-structures-and-algorithms\_print'
$tmpl     = [IO.File]::ReadAllText('C:\source\data-structures-and-algorithms\template.html', [Text.Encoding]::UTF8)

# Pages defined as (course, file-number-prefix) in book order
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

foreach ($spec in $pageSpecs) {
    $srcFile = Get-ChildItem "$site\$($spec.Course)" -Filter "$($spec.Prefix)*.html" |
               Where-Object { $_.Name -notmatch 'toc' } |
               Select-Object -First 1

    if (-not $srcFile) {
        Write-Warning "File not found: $($spec.Course) $($spec.Prefix)*.html"
        continue
    }

    $html = [IO.File]::ReadAllText($srcFile.FullName, [Text.Encoding]::UTF8)
    $m    = [regex]::Match($html, '(?s)<article[^>]*>(.*?)</article>')
    if (-not $m.Success) { Write-Warning "No <article> in $($srcFile.Name)"; continue }

    $baseUrl = 'file:///' + ($srcFile.DirectoryName -replace '\\', '/') + '/'
    $out     = $tmpl.Replace('{BASE}', $baseUrl).Replace('{CONTENT}', $m.Groups[1].Value)

    $outDir = "$printDir\$($spec.Course)"
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

    $outPath = "$outDir\$($srcFile.Name)"
    [IO.File]::WriteAllText($outPath, $out, [Text.Encoding]::UTF8)
    Write-Host "OK: $($spec.Course)\$($srcFile.Name)"
}
