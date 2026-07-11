import React, { useState } from 'react';
import { Card, Image } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { getFallbackImageByCategory } from '../../helpers/productImageResolver';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/productImages';
import styles from './ProductImageGallery.module.less';

type ProductImageGalleryProps = {
  images: string[];
  productName: string;
  typeName?: string;
};

function ProductImageGallery(props: ProductImageGalleryProps) {
  const { images, productName, typeName } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [brokenUrls, setBrokenUrls] = useState<Record<string, string>>({});

  const categoryFallback = getFallbackImageByCategory(typeName, productName);
  const rawImage = images[currentIndex] || images[0] || '';
  const currentImage =
    brokenUrls[rawImage] ||
    rawImage ||
    categoryFallback ||
    DEFAULT_PRODUCT_IMAGE;

  function handlePrevious() {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  function handleThumbnailClick(index: number) {
    setCurrentIndex(index);
  }

  function handleImageError(failedUrl: string) {
    if (!failedUrl || brokenUrls[failedUrl]) {
      return;
    }
    let next = categoryFallback;
    if (failedUrl.includes('localhost:4566')) {
      next = failedUrl.replace(/localhost:4566/gi, '127.0.0.1:4566');
    } else if (failedUrl === categoryFallback) {
      next = DEFAULT_PRODUCT_IMAGE;
    }
    setBrokenUrls((prev) => ({ ...prev, [failedUrl]: next }));
  }

  if (images.length === 0) {
    return (
      <Card>
        <div className={styles.placeholder}>
          <span>No image available</span>
        </div>
      </Card>
    );
  }

  return (
    <div className={styles.gallery}>
      <Card className={styles.mainImageCard}>
        <div className={styles.mainImageContainer}>
          {images.length > 1 && (
            <button
              className={styles.navButton}
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <LeftOutlined />
            </button>
          )}
          <Image
            src={currentImage}
            alt={productName}
            className={styles.mainImage}
            preview={{
              mask: 'Preview',
            }}
            onError={() => handleImageError(rawImage || currentImage)}
          />
          {images.length > 1 && (
            <button
              className={styles.navButton}
              onClick={handleNext}
              aria-label="Next image"
            >
              <RightOutlined />
            </button>
          )}
        </div>
      </Card>

      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image, index) => {
            const thumbSrc = brokenUrls[image] || image;
            return (
              <button
                key={index}
                type="button"
                className={`${styles.thumbnail} ${
                  index === currentIndex ? styles.active : ''
                }`}
                onClick={() => handleThumbnailClick(index)}
                aria-label={`View image ${index + 1}`}
                aria-pressed={index === currentIndex}
              >
                <Image
                  src={thumbSrc}
                  alt={`${productName} - Image ${index + 1}`}
                  preview={false}
                  className={styles.thumbnailImage}
                  onError={() => handleImageError(image)}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductImageGallery;
