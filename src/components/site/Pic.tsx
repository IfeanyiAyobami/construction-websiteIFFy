'use client';
import { useState } from 'react';
import { type Photo, photoSrcSet, photoUrl } from '@/lib/media';

/**
 * Responsive photograph with a designed fallback: if the file cannot be loaded the frame keeps
 * its blueprint-grid backdrop instead of showing a broken image.
 */
export default function Pic({ photo, sizes = '100vw', eager = false, className = '', w = 1600, decorative = false }:
  { photo: Photo; sizes?: string; eager?: boolean; className?: string; w?: number; decorative?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      className={`k-pic ${className}`}
      src={photoUrl(photo, w)}
      srcSet={photoSrcSet(photo)}
      sizes={sizes}
      alt={decorative ? '' : photo.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      style={photo.pos ? { objectPosition: photo.pos } : undefined}
      onError={() => setFailed(true)}
    />
  );
}
