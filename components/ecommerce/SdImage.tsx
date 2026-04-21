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

  // Use the existing placeholder
  const fallbackImage = '/images/placeholder-product.jpg'; 

  const absoluteUrl = toAbsoluteAssetUrl(src);
  const finalSrc = hasError || !absoluteUrl
    ? fallbackImage
    : (useProxy && absoluteUrl.startsWith('http') && !absoluteUrl.includes('localhost') && !absoluteUrl.includes('127.0.0.1'))
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
    <div className={`relative overflow-hidden bg-sd-ivory-dark/10 ${className}`}>
      {/* Skeleton Shimmer */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-10 bg-sd-ivory-dark/30 animate-pulse" />
      )}

      {/* Branded Placeholder (CSS Fallback) */}
      {hasError && (
        <div className="absolute inset-0 z-10 bg-sd-ivory-dark/50 flex items-center justify-center">
           <div className="w-12 h-12 border-2 border-sd-gold/40 rounded-full animate-bounce" />
        </div>
      )}

      {/* Regular img tag for local assets to ensure maximum visibility and bypass Next.js image optimization pitfalls */}
      {finalSrc.startsWith('/') && !finalSrc.startsWith('//') ? (
        <img 
          src={finalSrc}
          alt={alt || 'Sareng Digital Product'}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`w-full h-full object-cover transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'} ${props.className || ''}`}
        />
      ) : (
        <Image
          src={finalSrc}
          alt={alt || 'Sareng Digital Product'}
          sizes={props.sizes || getSizes()}
          onLoad={() => {
            setIsLoading(false);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          {...props}
          className={`transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'} ${props.className || ''}`}
        />
      )}
    </div>
  );
};

export default SdImage;
