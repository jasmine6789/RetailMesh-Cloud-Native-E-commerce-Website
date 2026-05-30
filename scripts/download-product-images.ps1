# Downloads catalog product images into assets/product-images.
# Usage: .\scripts\download-product-images.ps1

$ErrorActionPreference = 'Stop'
$BaseUrl = 'https://raw.githubusercontent.com/jasmine6789/RetailMesh-Cloud-Native-E-commerce-Website/main/assets/product-images'
$ImagesDir = Join-Path $PSScriptRoot '..\assets\product-images'
$SeedJson = Join-Path $PSScriptRoot '..\Services\Catalog\Catalog.Infrastructure\Data\SeedData\products-local.json'

New-Item -ItemType Directory -Force -Path $ImagesDir | Out-Null

$filenames = Select-String -Path $SeedJson -Pattern 'products/([^"]+\.(?:png|jpe?g|webp))' -AllMatches |
    ForEach-Object { $_.Matches } |
    ForEach-Object { $_.Groups[1].Value } |
    Sort-Object -Unique

Write-Host "Downloading $($filenames.Count) product images to $ImagesDir ..."

$ok = 0
$failed = @()
foreach ($name in $filenames) {
    $dest = Join-Path $ImagesDir $name
    if ((Test-Path $dest) -and (Get-Item $dest).Length -gt 1000) {
        $ok++
        continue
    }
    $url = "$BaseUrl/$name"
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -TimeoutSec 120
        $ok++
        Write-Host "  OK $name"
    } catch {
        $failed += $name
        Write-Warning "  FAIL $name"
    }
}

Write-Host "Downloaded/skipped: $ok / $($filenames.Count)"
if ($failed.Count -gt 0) {
    throw "Failed downloads: $($failed -join ', ')"
}

Write-Host "Done."
