Add-Type -AssemblyName System.Drawing

function Create-CWSScreenshot {
    $width = 1280
    $height = 800
    
    # 24-bit RGB (no alpha) as required by Google
    $bmp = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # 1. Background gradient (Cyberpunk Dark Navy)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point 0, 0),
        (New-Object System.Drawing.Point $width, $height),
        [System.Drawing.Color]::FromArgb(6, 11, 25),
        [System.Drawing.Color]::FromArgb(12, 22, 45)
    )
    $g.FillRectangle($bgBrush, 0, 0, $width, $height)
    $bgBrush.Dispose()

    # Ambient neon glows
    $glowBrush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 0, 240, 255))
    $g.FillEllipse($glowBrush1, -100, -100, 600, 600)
    $glowBrush1.Dispose()

    $glowBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 255, 0, 229))
    $g.FillEllipse($glowBrush2, 700, 300, 700, 700)
    $glowBrush2.Dispose()

    # 2. Draw Left Showcase Section
    # Load Icon
    $iconPath = Join-Path $PSScriptRoot "icons\icon128_original_1024.png"
    if (-not (Test-Path $iconPath)) {
        $iconPath = Join-Path $PSScriptRoot "icons\icon128.png"
    }
    if (Test-Path $iconPath) {
        $iconImg = [System.Drawing.Image]::FromFile($iconPath)
        $g.DrawImage($iconImg, 80, 100, 96, 96)
        $iconImg.Dispose()
    }

    # Typography
    $titleFont = New-Object System.Drawing.Font("Segoe UI", 36, [System.Drawing.FontStyle]::Bold)
    $titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.DrawString("Moji Typing Sounds", $titleFont, $titleBrush, 80, 215)
    $titleFont.Dispose()
    $titleBrush.Dispose()

    $subFont = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Regular)
    $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 240, 255))
    $g.DrawString("ASMR keystroke audio on every website", $subFont, $accentBrush, 80, 275)
    $subFont.Dispose()
    $accentBrush.Dispose()

    # Feature List
    $features = @(
        "10 Synthesized Packs (Mechanical, Thock, Cute, Laser...)",
        "Zero Latency — Procedural Web Audio API",
        "100% Offline & Lightweight — No audio files downloaded",
        "Built-in Practice Mode with Live WPM & Accuracy",
        "Privacy First — Auto-mutes password & sensitive fields"
    )

    $featureFont = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Regular)
    $checkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 255, 157))
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 230, 245))

    $yOffset = 340
    foreach ($feat in $features) {
        # Checkmark icon
        $g.DrawString("[+]", $featureFont, $checkBrush, 80, $yOffset)
        $g.DrawString($feat, $featureFont, $textBrush, 120, $yOffset)
        $yOffset += 48
    }
    $featureFont.Dispose()
    $checkBrush.Dispose()
    $textBrush.Dispose()

    # Footer note on screenshot
    $badgeFont = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 160, 190))
    $g.DrawString("Built by Edgar • edgarr.dev  |  Manifest V3 Certified", $badgeFont, $badgeBrush, 80, 680)
    $badgeFont.Dispose()
    $badgeBrush.Dispose()

    # 3. Draw Extension Popup Showcase on Right
    $popupPath = "C:\Users\edgar_baobaoen\.gemini\antigravity-ide\brain\70d95b75-2ff9-483e-8c23-8a1d0ff52169\.user_uploaded\media_1793174225095.png"
    if (Test-Path $popupPath) {
        $popupImg = [System.Drawing.Image]::FromFile($popupPath)
        
        $pX = 810
        $pY = 90
        $pW = 390
        $pH = 620

        # Shadow & Glow
        $glowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 0, 240, 255), 6)
        $g.DrawRectangle($glowPen, $pX - 3, $pY - 3, $pW + 6, $pH + 6)
        $glowPen.Dispose()

        $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 0, 240, 255), 2)
        $g.DrawRectangle($borderPen, $pX, $pY, $pW, $pH)
        $borderPen.Dispose()

        # Draw popup image
        $g.DrawImage($popupImg, $pX, $pY, $pW, $pH)
        $popupImg.Dispose()
    }

    # Save 1280x800 24-bit PNG
    $outPng = Join-Path $PSScriptRoot "cws_screenshot_1280x800.png"
    $bmp.Save($outPng, [System.Drawing.Imaging.ImageFormat]::Png)

    # Save 1280x800 JPEG (High Quality)
    $outJpg = Join-Path $PSScriptRoot "cws_screenshot_1280x800.jpg"
    $jpgEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
    $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)
    $bmp.Save($outJpg, $jpgEncoder, $encParams)

    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created 1280x800 Screenshot (PNG and JPG): $outPng" -ForegroundColor Green
}

function Create-CWSPromoTile {
    $width = 440
    $height = 280
    
    # 24-bit RGB (no alpha)
    $bmp = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Background gradient
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point 0, 0),
        (New-Object System.Drawing.Point $width, $height),
        [System.Drawing.Color]::FromArgb(5, 9, 20),
        [System.Drawing.Color]::FromArgb(15, 25, 55)
    )
    $g.FillRectangle($bgBrush, 0, 0, $width, $height)
    $bgBrush.Dispose()

    # Ambient Glow
    $glow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 0, 240, 255))
    $g.FillEllipse($glow, 120, 20, 200, 200)
    $glow.Dispose()

    # Draw Robot Icon in Center
    $iconPath = Join-Path $PSScriptRoot "icons\icon128_original_1024.png"
    if (-not (Test-Path $iconPath)) { $iconPath = Join-Path $PSScriptRoot "icons\icon128.png" }
    if (Test-Path $iconPath) {
        $iconImg = [System.Drawing.Image]::FromFile($iconPath)
        $g.DrawImage($iconImg, 176, 40, 88, 88)
        $iconImg.Dispose()
    }

    # Title
    $titleFont = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
    $titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("Moji Typing Sounds", $titleFont, $titleBrush, 220, 145, $sf)
    $titleFont.Dispose()

    # Subtitle
    $subFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 240, 255))
    $g.DrawString("ASMR Mechanical Audio Everywhere", $subFont, $accentBrush, 220, 180, $sf)
    $subFont.Dispose()
    $accentBrush.Dispose()

    # Feature pill
    $pillFont = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)
    $pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 180, 210))
    $g.DrawString("10 Sound Packs  •  Offline  •  Zero Latency", $pillFont, $pillBrush, 220, 215, $sf)
    $pillFont.Dispose()
    $pillBrush.Dispose()

    # Save Promo Tile
    $outPng = Join-Path $PSScriptRoot "cws_promo_tile_440x280.png"
    $bmp.Save($outPng, [System.Drawing.Imaging.ImageFormat]::Png)

    $outJpg = Join-Path $PSScriptRoot "cws_promo_tile_440x280.jpg"
    $jpgEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
    $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)
    $bmp.Save($outJpg, $jpgEncoder, $encParams)

    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created 440x280 Promo Tile (PNG and JPG): $outPng" -ForegroundColor Green
}

Create-CWSScreenshot
Create-CWSPromoTile
