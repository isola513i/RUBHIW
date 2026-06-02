"use client";

import { useState } from "react";

type ProductImageProps = {
  alt: string;
  className: string;
  fallbackClassName: string;
  packageColor: string;
  src?: string;
};

export function ProductImage({ alt, className, fallbackClassName, packageColor, src }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(src) && !hasError;

  if (showImage) {
    return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setHasError(true)} />;
  }

  return (
    <div
      className={fallbackClassName}
      style={{ "--package": packageColor } as React.CSSProperties}
      role="img"
      aria-label={alt}
    />
  );
}
