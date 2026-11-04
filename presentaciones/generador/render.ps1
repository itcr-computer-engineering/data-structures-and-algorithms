# Exporta cada diapositiva de un .pptx a PNG usando PowerPoint (COM) para la revisión visual,
# avisa de formas que se salen de la diapositiva y, opcionalmente, genera el PDF.
# Uso: powershell -File render.ps1 -Pptx "..\ce-2103\Lección 08 - Bases de Datos.pptx" [-Out .\render\bd] [-Width 1280] [-Pdf]
# Es seguro ejecutarlo desde varios procesos a la vez: un mutex global serializa el uso de PowerPoint,
# y PowerPoint solo se cierra si este script lo abrió (no cierra la sesión de otro usuario o proceso).
param(
  [Parameter(Mandatory = $true)][string]$Pptx,
  [string]$Out = '',
  [int]$Width = 1280,
  [switch]$Pdf
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = (Resolve-Path -LiteralPath $Pptx).Path
if (-not $Out) { $Out = Join-Path $here ('render\' + [System.IO.Path]::GetFileNameWithoutExtension($src)) }
New-Item -ItemType Directory -Force $Out | Out-Null
Get-ChildItem $Out -Filter *.png -ErrorAction SilentlyContinue | Remove-Item -Force

$mutex = New-Object System.Threading.Mutex($false, 'Global\generar-presentacion-powerpoint')
$locked = $false
try {
  try { $locked = $mutex.WaitOne([TimeSpan]::FromMinutes(30)) } catch [System.Threading.AbandonedMutexException] { $locked = $true }
  if (-not $locked) { throw 'No se pudo obtener el bloqueo de PowerPoint en 30 minutos.' }

  $app = New-Object -ComObject PowerPoint.Application
  $openedBefore = $app.Presentations.Count
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
    if ($openedBefore -eq 0) { $app.Quit() }
  }
}
finally {
  if ($locked) { $mutex.ReleaseMutex() }
  $mutex.Dispose()
}
