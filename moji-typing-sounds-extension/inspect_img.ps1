Add-Type -AssemblyName System.Drawing
$imgPath = "C:\Users\edgar_baobaoen\.gemini\antigravity-ide\brain\70d95b75-2ff9-483e-8c23-8a1d0ff52169\.user_uploaded\media_1793174225095.png"
if (Test-Path $imgPath) {
    $img = [System.Drawing.Image]::FromFile($imgPath)
    Write-Host "Image size: $($img.Width) x $($img.Height)"
    $img.Dispose()
} else {
    Write-Host "Image not found at path"
}
