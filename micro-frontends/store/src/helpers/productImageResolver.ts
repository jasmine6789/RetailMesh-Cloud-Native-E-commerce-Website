import {
  DEFAULT_PRODUCT_IMAGE,
  PRODUCT_IMAGE_BY_CATEGORY,
} from '../constants/productImages';

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/-/g, ' ').trim();
}

/** Use 127.0.0.1 — on Windows, localhost:4566 often fails (IPv6) while 127.0.0.1 works. */
const LOCALSTACK_BROWSER_BASE = 'http://127.0.0.1:4566';

function isResolvableRemoteUrl(imageFile: string): boolean {
  if (!imageFile.startsWith('http://') && !imageFile.startsWith('https://')) {
    return false;
  }

  const lower = imageFile.toLowerCase();
  if (lower.includes('localhost:4566') || lower.includes('127.0.0.1:4566')) {
    return true;
  }

  return (
    !lower.includes('amazonaws.com') &&
    !lower.includes('localstack') &&
    !lower.includes('.s3.') &&
    !lower.includes('s3.us-')
  );
}

/** Maps seed S3 / LocalStack URLs to browser-reachable LocalStack paths. */
function toLocalStackBrowserUrl(imageFile: string): string | null {
  const trimmed = imageFile.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes('127.0.0.1:4566')) {
    return trimmed;
  }

  if (lower.includes('localhost:4566')) {
    return trimmed.replace(/localhost:4566/gi, '127.0.0.1:4566');
  }

  if (lower.includes('localstack:4566')) {
    return trimmed.replace(/localstack:4566/gi, '127.0.0.1:4566');
  }

  const productsMatch = trimmed.match(/\/products\/([^/?#]+\.(?:png|jpe?g|webp))(?:\?|$|#)/i);
  if (
    productsMatch &&
    (lower.includes('amazonaws.com') ||
      lower.includes('.s3.') ||
      lower.includes('s3.us-'))
  ) {
    return `${LOCALSTACK_BROWSER_BASE}/ecommerce-product-images/products/${productsMatch[1]}`;
  }

  return null;
}

export function getFallbackImageByCategory(
  typeName?: string,
  productName?: string
): string {
  const keys = [typeName, productName].filter(Boolean) as string[];

  for (const key of keys) {
    const normalized = normalizeKey(key);
    if (PRODUCT_IMAGE_BY_CATEGORY[normalized]) {
      return PRODUCT_IMAGE_BY_CATEGORY[normalized];
    }

    for (const [category, url] of Object.entries(PRODUCT_IMAGE_BY_CATEGORY)) {
      if (normalized.includes(category)) {
        return url;
      }
    }
  }

  return DEFAULT_PRODUCT_IMAGE;
}

/**
 * Returns a browser-loadable image URL for catalog products.
 * Replaces broken S3/LocalStack seed URLs with public fallbacks.
 */
export function resolveProductImageUrl(
  imageFile?: string | null,
  typeName?: string,
  productName?: string
): string {
  if (!imageFile || imageFile.trim() === '') {
    return getFallbackImageByCategory(typeName, productName);
  }

  const trimmed = imageFile.trim();
  const localStackUrl = toLocalStackBrowserUrl(trimmed);

  if (localStackUrl) {
    return localStackUrl;
  }

  if (isResolvableRemoteUrl(trimmed)) {
    return trimmed;
  }

  return getFallbackImageByCategory(typeName, productName);
}
