# Moji Typing Sounds — Chrome Web Store Package Script
# Run from the moji-typing-sounds-extension directory
# Creates a clean ZIP excluding dev/test files

$extensionDir = $PSScriptRoot
if (-not $extensionDir) { $extensionDir = Get-Location }

$manifest = Get-Content (Join-Path $extensionDir "manifest.json") | ConvertFrom-Json
$version = $manifest.version
$outputName = "moji-typing-sounds-v$version.zip"
$outputPath = Join-Path $extensionDir $outputName

# Remove old package if exists
if (Test-Path $outputPath) { Remove-Item $outputPath }

# Files to include (only what Chrome needs)
$includeFiles = @(
    "manifest.json",
    "background.js",
    "content.js",
    "audio-main.js",
    "audio-engine.js",

    "popup.html",
    "popup.css",
    "popup.js",
    "practice.js",
    "icons/icon16.png",
    "icons/icon48.png",
    "icons/icon128.png"
)

# Create a temp directory for clean packaging
$tempDir = Join-Path $env:TEMP "moji-ext-package"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempDir "icons") | Out-Null

# Copy only the files we need
foreach ($file in $includeFiles) {
    $source = Join-Path $extensionDir $file
    $dest = Join-Path $tempDir $file
    if (Test-Path $source) {
        Copy-Item $source $dest
        Write-Host "  + $file" -ForegroundColor Green
    } else {
        Write-Host "  ! MISSING: $file" -ForegroundColor Red
    }
}

# Create ZIP
Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $outputPath -Force

# Cleanup
Remove-Item $tempDir -Recurse -Force

$size = (Get-Item $outputPath).Length / 1KB
Write-Host ""
Write-Host "Packaged: $outputName ($([math]::Round($size, 1)) KB)" -ForegroundColor Cyan
Write-Host "Ready to upload to Chrome Developer Dashboard" -ForegroundColor Cyan
