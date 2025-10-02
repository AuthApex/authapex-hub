export type CloudflareImageType = 'original' | 'fullhd' | 'miniature' | 'profile' | 'blur';

export interface CloudflareImageProps {
  imageId: string;
  srcType?: CloudflareImageType;
  alt?: string;
  className?: string;
}

export function CloudflareImage({ imageId, srcType = 'original', alt, ...otherProps }: CloudflareImageProps) {
  const src = `https://id.authapex.net/images/${imageId}/${srcType}`;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...otherProps} />;
}
