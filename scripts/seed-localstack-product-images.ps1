# Seeds LocalStack S3 with product images from assets/product-images (or downloads them first).
# Usage: .\scripts\seed-localstack-product-images.ps1 [-Download]

param([switch]$Download)

$ErrorActionPreference = 'Stop'
$Bucket = 'ecommerce-product-images'
$Endpoint = 'http://127.0.0.1:4566'
$ImagesDir = Join-Path $PSScriptRoot '..\assets\product-images'
$SeedJson = Join-Path $PSScriptRoot '..\Services\Catalog\Catalog.Infrastructure\Data\SeedData\products-local.json'
$DownloadScript = Join-Path $PSScriptRoot 'download-product-images.ps1'

if (-not (Test-Path $SeedJson)) {
    throw "Seed file not found: $SeedJson"
}

$filenames = Select-String -Path $SeedJson -Pattern 'products/([^"]+\.(?:png|jpe?g|webp))' -AllMatches |
    ForEach-Object { $_.Matches } |
    ForEach-Object { $_.Groups[1].Value } |
    Sort-Object -Unique

$missing = @($filenames | Where-Object { -not (Test-Path (Join-Path $ImagesDir $_)) })
if ($Download -or $missing.Count -gt 0) {
    Write-Host "Ensuring local images exist ($($missing.Count) missing)..."
    & $DownloadScript
}

Write-Host "Found $($filenames.Count) catalog image filenames"

Write-Host "Waiting for LocalStack S3..."
$ready = $false
for ($i = 1; $i -le 15; $i++) {
    try {
        $raw = Invoke-WebRequest -Uri "$Endpoint/_localstack/health" -UseBasicParsing -TimeoutSec 5
        if ($raw.Content -match '"s3"\s*:\s*"(running|available)"') {
            $ready = $true
            break
        }
    } catch { }
    Start-Sleep -Seconds 2
}
if (-not $ready) {
    throw "LocalStack S3 is not ready at $Endpoint"
}

Write-Host "Creating bucket and uploading real product images..."
docker exec localstack awslocal s3 mb "s3://$Bucket" 2>$null | Out-Null

$policy = @"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::${Bucket}/*"
  }]
}
"@
$policy | docker exec -i localstack sh -c "cat > /tmp/bucket-policy.json"
docker exec localstack awslocal s3api put-bucket-policy --bucket $Bucket --policy file:///tmp/bucket-policy.json 2>$null | Out-Null

$uploaded = 0
foreach ($name in $filenames) {
    $localPath = Join-Path $ImagesDir $name
    if (-not (Test-Path $localPath)) {
        throw "Missing image file: $localPath (run download-product-images.ps1)"
    }
    docker cp $localPath "localstack:/tmp/$name"
    docker exec localstack awslocal s3 cp "/tmp/$name" "s3://$Bucket/products/$name" --content-type image/png 2>$null | Out-Null
    docker exec localstack rm -f "/tmp/$name" 2>$null | Out-Null
    $uploaded++
    if ($uploaded % 10 -eq 0) {
        Write-Host "  Uploaded $uploaded / $($filenames.Count)..."
    }
}

Write-Host "Uploaded $uploaded distinct product images."
$sample = $filenames[0]
$testUrl = "$Endpoint/$Bucket/products/$sample"
try {
    $r = Invoke-WebRequest -Uri $testUrl -Method Head -UseBasicParsing -TimeoutSec 10
    Write-Host "OK: $testUrl ($($r.StatusCode))"
} catch {
    Write-Warning "Could not HEAD $testUrl - check LocalStack logs."
}

Write-Host "Done. Product images: $Endpoint/$Bucket/products/<filename>"
