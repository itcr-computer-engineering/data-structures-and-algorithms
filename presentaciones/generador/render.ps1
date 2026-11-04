# Exporta cada diapositiva de un .pptx a PNG usando PowerPoint (COM) para la revisión visual,
# avisa de formas que se salen de la diapositiva y, opcionalmente, genera el PDF.
# Uso: powershell -File render.ps1 -Pptx "..\ce-2103\Lección 08 - Bases de Datos.pptx" [-Out .\render] [-Width 1280] [-Pdf]
param(
  [Parameter(Mandatory = $true)][string]$Pptx,
  [string]$Out = '',
  [int]$Width = 1280,
  [switch]$Pdf
)

$ErrorActionPreference = 'Stop'
if (-not $Out) { $Out = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'render' }
$src = (Resolve-Path -LiteralPath $Pptx).Path
New-Item -ItemType Directory -Force $Out | Out-Null
Get-ChildItem $Out -Filter *.png -ErrorAction SilentlyContinue | Remove-Item -Force

$app = New-Object -ComObject PowerPoint.Application
try {
  $pres = $app.Presentations.Open($src, $true, $false, $false)
  $sw = $pres.PageSetup.SlideWidth
  $sh = $pres.PageSetup.SlideHeight
  $height = [int]($Width * $sh / $sw)
  $outside = 0
  foreach ($slide in $pres.Slides) {
    $file = Join-Path $Out ('slide-{0:D2}.png' -f $slide.SlideIndex)
    $slide.Export($file, 'PNG', $Width, $height)
    foreach ($shape in $slide.Shapes) {
      if ($shape.Left -lt -1 -or $shape.Top -lt -1 -or ($shape.Left + $shape.Width) -gt ($sw + 1) -or ($shape.Top + $shape.Height) -gt ($sh + 1)) {
        $outside++
        "Fuera de la diapositiva {0}: {1}" -f $slide.SlideIndex, $shape.Name
      }
    }
  }
  "Exportadas $($pres.Slides.Count) diapositivas a $Out ($outside formas fuera de límites)"
  if ($Pdf) {
    $pdfPath = [System.IO.Path]::ChangeExtension($src, '.pdf')
    $pres.SaveAs($pdfPath, 32)
    "PDF: $pdfPath"
  }
  $pres.Close()
}
finally {
  $app.Quit()
}
