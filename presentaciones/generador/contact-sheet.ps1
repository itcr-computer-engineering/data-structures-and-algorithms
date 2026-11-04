# Genera hojas de contacto (2 columnas x 3 filas) a partir de los PNG renderizados.
param(
  [string]$Dir = (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'render'),
  [int]$Cols = 2,
  [int]$Rows = 3,
  [int]$CellW = 800
)
Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem $Dir -Filter 'slide-*.png' | Sort-Object Name
$first = [System.Drawing.Image]::FromFile($files[0].FullName)
$cellH = [int]($CellW * $first.Height / $first.Width)
$first.Dispose()
$per = $Cols * $Rows
$pad = 8
for ($s = 0; $s * $per -lt $files.Count; $s++) {
  $bmp = New-Object System.Drawing.Bitmap ($Cols * ($CellW + $pad) + $pad), ($Rows * ($cellH + $pad) + $pad)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(90, 90, 90))
  $g.InterpolationMode = 'HighQualityBicubic'
  for ($i = 0; $i -lt $per; $i++) {
    $idx = $s * $per + $i
    if ($idx -ge $files.Count) { break }
    $img = [System.Drawing.Image]::FromFile($files[$idx].FullName)
    $x = $pad + ($i % $Cols) * ($CellW + $pad)
    $y = $pad + [math]::Floor($i / $Cols) * ($cellH + $pad)
    $g.DrawImage($img, $x, $y, $CellW, $cellH)
    $img.Dispose()
  }
  $g.Dispose()
  $bmp.Save((Join-Path $Dir ('sheet-{0:D2}.png' -f ($s + 1))), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}
"Hojas generadas en $Dir"
