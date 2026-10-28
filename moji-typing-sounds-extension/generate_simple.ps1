Add-Type -AssemblyName System.Drawing

$width = 1280
$height = 800

$bmp = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Background
$rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(6, 11, 25),
    [System.Drawing.Color]::FromArgb(12, 22, 45),
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
)
$g.FillRectangle($bgBrush, $rect)

# Draw Left Texts
$titleFont = New-Object System.Drawing.Font("Segoe UI", 36, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.DrawString("Moji Typing Sounds", $titleFont, $titleBrush, 80, 160)

$subFont = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Regular)
$cyanBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 240, 255))
$g.DrawString("ASMR keystroke audio on every website", $subFont, $cyanBrush, 80, 230)

$featureFont = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Regular)
$greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 255, 157))
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 230, 245))

$g.DrawString("[+]", $featureFont, $greenBrush, 80, 310)
$g.DrawString("10 Synthesized Packs (Mechanical, Thock, Cute, Laser...)", $featureFont, $textBrush, 120, 310)

$g.DrawString("[+]", $featureFont, $greenBrush, 80, 360)
$g.DrawString("Zero Latency - Procedural Web Audio API", $featureFont, $textBrush, 120, 360)

$g.DrawString("[+]", $featureFont, $greenBrush, 80, 410)
$g.DrawString("100% Offline & Lightweight - No audio files downloaded", $featureFont, $textBrush, 120, 410)

$g.DrawString("[+]", $featureFont, $greenBrush, 80, 460)
$g.DrawString("Built-in Practice Mode with Live WPM & Accuracy", $featureFont, $textBrush, 120, 460)

$g.DrawString("[+]", $featureFont, $greenBrush, 80, 510)
$g.DrawString("Privacy First - Auto-mutes password & sensitive fields", $featureFont, $textBrush, 120, 510)

$badgeFont = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 160, 190))
$g.DrawString("Built by Edgar - edgarr.dev  |  Manifest V3 Certified", $badgeFont, $badgeBrush, 80, 680)

# Load popup image
$popupPath = "C:\Users\edgar_baobaoen\.gemini\antigravity-ide\brain\70d95b75-2ff9-483e-8c23-8a1d0ff52169\.user_uploaded\media_1793174225095.png"
if (Test-Path $popupPath) {
    $popupImg = [System.Drawing.Image]::FromFile($popupPath)
    $pX = 810
    $pY = 90
    $pW = 390
    $pH = 620
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(0, 240, 255), 2)
    $g.DrawRectangle($borderPen, $pX - 1, $pY - 1, $pW + 2, $pH + 2)
    $g.DrawImage($popupImg, $pX, $pY, $pW, $pH)
    $popupImg.Dispose()
    $borderPen.Dispose()
}

$outPath = Join-Path $PSScriptRoot "cws_screenshot_1280x800.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$outJpg = Join-Path $PSScriptRoot "cws_screenshot_1280x800.jpg"
$bmp.Save($outJpg, [System.Drawing.Imaging.ImageFormat]::Jpeg)

$g.Dispose()
$bmp.Dispose()
Write-Host "Success: $outPath"
