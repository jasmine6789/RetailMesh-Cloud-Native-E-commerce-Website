# Downloads catalog product images into assets/product-images.
# Order: GitHub -> AWS S3 -> category-matched Unsplash (never random picsum) -> labeled PNG.
# Usage:
#   .\scripts\download-product-images.ps1
#   .\scripts\download-product-images.ps1 -Force   # replace existing files
#
# -Force is required after a bad seed (e.g. random picsum placeholders).

param([switch]$Force)

$ErrorActionPreference = 'Stop'
$GitHubBase = 'https://raw.githubusercontent.com/jasmine6789/RetailMesh-Cloud-Native-E-commerce-Website/main/assets/product-images'
$AwsBase = 'https://ecommerce-product-images-083919813794.s3.us-east-1.amazonaws.com/products'
$ImagesDir = Join-Path $PSScriptRoot '..\assets\product-images'
$SeedJson = Join-Path $PSScriptRoot '..\Services\Catalog\Catalog.Infrastructure\Data\SeedData\products-local.json'

New-Item -ItemType Directory -Force -Path $ImagesDir | Out-Null

if (-not (Test-Path $SeedJson)) {
    throw "Seed file not found: $SeedJson"
}

$products = Get-Content $SeedJson -Raw | ConvertFrom-Json

# Category -> curated Unsplash product photos (tech only; no random landscapes)
$CategoryImages = @{
    'Laptops' = @(
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555cd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
    )
    'Monitors' = @(
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1585792187667-8497e38aa8df?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1616763355548-1b57a9758f53?auto=format&fit=crop&w=800&q=80'
    )
    'Keyboards' = @(
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511467687858-23d2842ac24d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80'
    )
    'Mice' = @(
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7cde9d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1629429407756-4a7703614973?auto=format&fit=crop&w=800&q=80'
    )
}

function Get-StableIndex([string]$text, [int]$modulo) {
    if ($modulo -le 0) { return 0 }
    $hash = 0
    foreach ($ch in $text.ToCharArray()) {
        $hash = (($hash * 31) + [int]$ch) -band 0x7fffffff
    }
    return $hash % $modulo
}

function Get-CategoryImageUrl([string]$typeName, [string]$fileName) {
    $list = $CategoryImages[$typeName]
    if (-not $list -or $list.Count -eq 0) {
        $list = $CategoryImages['Laptops']
    }
    return $list[(Get-StableIndex $fileName $list.Count)]
}

function Test-ImageFile([string]$path) {
    return (Test-Path $path) -and ((Get-Item $path).Length -gt 1000)
}

function Try-Download([string]$url, [string]$dest) {
    try {
        $headers = @{ 'User-Agent' = 'RetailMesh-ImageSeed/1.0' }
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -TimeoutSec 90 -Headers $headers
        return (Test-ImageFile $dest)
    } catch {
        if (Test-Path $dest) { Remove-Item $dest -Force -ErrorAction SilentlyContinue }
        return $false
    }
}

function New-PlaceholderPng([string]$dest, [string]$productName, [string]$typeName) {
    Add-Type -AssemblyName System.Drawing
    $width = 800
    $height = 600
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $palette = @{
        'Laptops'   = [System.Drawing.Color]::FromArgb(255, 30, 58, 95)
        'Monitors'  = [System.Drawing.Color]::FromArgb(255, 45, 55, 72)
        'Keyboards' = [System.Drawing.Color]::FromArgb(255, 55, 48, 40)
        'Mice'      = [System.Drawing.Color]::FromArgb(255, 40, 60, 50)
    }
    $bg = if ($palette.ContainsKey($typeName)) { $palette[$typeName] } else { [System.Drawing.Color]::FromArgb(255, 40, 40, 50) }
    $g.Clear($bg)

    $titleFont = New-Object System.Drawing.Font 'Segoe UI', 26, ([System.Drawing.FontStyle]::Bold)
    $subFont = New-Object System.Drawing.Font 'Segoe UI', 16, ([System.Drawing.FontStyle]::Regular)
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $titleRect = New-Object System.Drawing.RectangleF 40, 180, ($width - 80), 160
    $subRect = New-Object System.Drawing.RectangleF 40, 360, ($width - 80), 60
    $g.DrawString($productName, $titleFont, $brush, $titleRect, $sf)
    $g.DrawString($typeName, $subFont, $brush, $subRect, $sf)

    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose(); $titleFont.Dispose(); $subFont.Dispose(); $brush.Dispose()
}

Write-Host "Preparing $($products.Count) product images in $ImagesDir (Force=$Force) ..."

$ok = 0
$failed = @()
foreach ($product in $products) {
    $match = [regex]::Match($product.ImageFile, 'products/([^/?#]+\.(?:png|jpe?g|webp))$')
    if (-not $match.Success) {
        Write-Warning "Skip (no filename): $($product.Name)"
        continue
    }
    $name = $match.Groups[1].Value
    $typeName = [string]$product.Types.Name
    $dest = Join-Path $ImagesDir $name

    if ((-not $Force) -and (Test-ImageFile $dest)) {
        $ok++
        continue
    }
    if ($Force -and (Test-Path $dest)) {
        Remove-Item $dest -Force
    }

    $sources = @(
        "$GitHubBase/$name",
        "$AwsBase/$name",
        (Get-CategoryImageUrl $typeName $name)
    )

    $got = $false
    foreach ($url in $sources) {
        if (Try-Download $url $dest) {
            $ok++
            $got = $true
            Write-Host "  OK $name ($typeName)"
            break
        }
    }

    if (-not $got) {
        try {
            New-PlaceholderPng $dest $product.Name $typeName
            if (Test-ImageFile $dest) {
                $ok++
                Write-Host "  OK $name (labeled placeholder, $typeName)"
            } else {
                $failed += $name
                Write-Warning "  FAIL $name"
            }
        } catch {
            $failed += $name
            Write-Warning "  FAIL $name : $($_.Exception.Message)"
        }
    }
}

Write-Host "Ready: $ok / $($products.Count)"
if ($failed.Count -gt 0) {
    throw "Failed: $($failed -join ', ')"
}
Write-Host "Done. (picsum/random stock photos are intentionally not used)"
