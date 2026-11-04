# Regenera todas las presentaciones desde sus specs (la unica fuente de verdad).
# Uso:  powershell -NoProfile -File build-all.ps1        -> solo .pptx
#       powershell -NoProfile -File build-all.ps1 -Pdf   -> .pptx y .pdf (requiere PowerPoint)
param([switch]$Pdf)

Set-Location $PSScriptRoot
$failed = @()

foreach ($spec in Get-ChildItem specs -Recurse -Filter *.json | Sort-Object FullName) {
    $line = node build.js $spec.FullName 2>&1 | Select-Object -Last 1
    if ($LASTEXITCODE -ne 0) {
        $failed += $spec.Name
        Write-Host "FALLO $($spec.Name): $line" -ForegroundColor Red
        continue
    }
    Write-Host $line

    if ($Pdf) {
        $pptx = $line -replace '^OK \d+ diapositivas -> ', ''
        powershell -NoProfile -File .\render.ps1 -Pptx $pptx -Pdf | Select-Object -Last 1
        if ($LASTEXITCODE -ne 0) { $failed += "$($spec.Name) (pdf)" }
    }
}

if ($failed.Count -gt 0) {
    Write-Host "Con errores: $($failed -join ', ')" -ForegroundColor Red
    exit 1
}
Write-Host "Listo: $((Get-ChildItem specs -Recurse -Filter *.json).Count) presentaciones regeneradas."
