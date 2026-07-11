import React, { useEffect, useState } from 'react';
import { Button, Flex } from 'antd';
import { ShoppingOutlined, EyeOutlined } from '@ant-design/icons';
import ProductBadge from './ProductBadge';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/productImages';
import { getFallbackImageByCategory } from '../../helpers/productImageResolver';
import {
  PRODUCT_CARD,
  PRODUCT_CARD_COLORS,
} from '../../constants/layoutConstants';

type ProductCardCoverProps = {
  imageUrl?: string;
  imageAlt?: string;
  typeName?: string;
  productName?: string;
  isHovered: boolean;
  onViewDetails: () => void;
  badge?: {
    text: string;
    type: 'new' | 'discount' | 'hot';
  };
};

function ProductCardCover(props: ProductCardCoverProps) {
  const {
    imageUrl,
    imageAlt,
    typeName,
    productName,
    isHovered,
    onViewDetails,
    badge,
  } = props;
  const categoryFallback = getFallbackImageByCategory(typeName, productName);
  const [displayUrl, setDisplayUrl] = useState(
    imageUrl || categoryFallback || DEFAULT_PRODUCT_IMAGE
  );
  const [retriedLocalhost, setRetriedLocalhost] = useState(false);

  useEffect(() => {
    setDisplayUrl(imageUrl || categoryFallback || DEFAULT_PRODUCT_IMAGE);
    setRetriedLocalhost(false);
  }, [imageUrl, categoryFallback]);

  function handleImageError() {
    const current = displayUrl;
    if (!retriedLocalhost && current.includes('localhost:4566')) {
      setRetriedLocalhost(true);
      setDisplayUrl(current.replace(/localhost:4566/gi, '127.0.0.1:4566'));
      return;
    }
    // Prefer category-aware fallback so every failed load is not the same headphones image
    if (current !== categoryFallback) {
      setDisplayUrl(categoryFallback);
      return;
    }
    if (current !== DEFAULT_PRODUCT_IMAGE) {
      setDisplayUrl(DEFAULT_PRODUCT_IMAGE);
    }
  }

  function handleViewDetailsClick(e: React.MouseEvent) {
    e.stopPropagation();
    onViewDetails();
  }

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: '100%',
        height: PRODUCT_CARD.COVER_HEIGHT,
        background: PRODUCT_CARD_COLORS.COVER_BACKGROUND,
        position: 'relative',
        overflow: 'hidden',
      }}
      data-testid="product-cover"
    >
      {badge && <ProductBadge text={badge.text} type={badge.type} />}

      {displayUrl ? (
        <img
          src={displayUrl}
          alt={imageAlt || 'Product image'}
          onError={handleImageError}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Flex
          align="center"
          justify="center"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <ShoppingOutlined
            style={{
              fontSize: 80,
              color: PRODUCT_CARD_COLORS.ICON_PLACEHOLDER,
            }}
          />
        </Flex>
      )}

      {isHovered && (
        <Flex
          align="center"
          justify="center"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: PRODUCT_CARD_COLORS.HOVER_OVERLAY,
            backdropFilter: 'blur(4px)',
            zIndex: 2,
          }}
        >
          <Button
            variant="filled"
            type="primary"
            size="large"
            color="primary"
            icon={<EyeOutlined />}
            onClick={handleViewDetailsClick}
            aria-label="View product details"
            data-testid="view-detail-button"
            style={{
              fontWeight: 600,
              fontSize: '16px',
            }}
          >
            View Details
          </Button>
        </Flex>
      )}
    </Flex>
  );
}

export default ProductCardCover;
