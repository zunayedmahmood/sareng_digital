'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { toAbsoluteAssetUrl } from '@/lib/assetUrl';

interface SdImageProps extends Omit<ImageProps, 'src' | 'onError' | 'onLoad'> {
  src?: string | null;
  context?: 'card' | 'gallery' | 'thumbnail' | 'hero';
  useProxy?: boolean;
}

const SdImage: React.FC<SdImageProps> = ({
  src,
  alt,
  context = 'card',
  useProxy = true,
  className = '',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Branded fallback
  const fallbackImage = '/images/brand-placeholder.jpg'; // We'll need to ensure this exists or use a CSS fallback

  const absoluteUrl = toAbsoluteAssetUrl(src);
  const finalSrc = hasError || !absoluteUrl
    ? fallbackImage
    : useProxy && absoluteUrl.startsWith('http')
      ? `/api/proxy-image?url=${encodeURIComponent(absoluteUrl)}`
      : absoluteUrl;

  const getSizes = () => {
    switch (context) {
      case 'hero':
        return '100vw';
      case 'gallery':
        return '(max-width: 768px) 100vw, 50vw';
      case 'thumbnail':
        return '80px';
      case 'card':
      default:
        return '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton Shimmer */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-10 sd-skeleton" />
      )}

      {/* Branded Placeholder (CSS Fallback) */}
      {hasError && (
        <div className="absolute inset-0 z-10 bg-sd-onyx flex items-center justify-center">
           {/* Gold logomark shimmer would go here as a CSS icon or SVG */}
           <div className="w-12 h-12 border border-sd-gold/20 rounded-full animate-pulse" />
        </div>
      )}

      <Image
        src={finalSrc}
        alt={alt || 'Sareng Digital Product'}
        sizes={props.sizes || getSizes()}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...props}
        className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} ${props.className || ''}`}
      />
    </div>
  );
};

export default SdImage;
