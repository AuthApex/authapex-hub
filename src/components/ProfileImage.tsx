import { twMerge } from 'tailwind-merge';
import { User } from '@authapex/core';
import { CloudflareImage } from '@/components/CloudflareImage';

export interface ProfileImageProps {
  user: User;
  className?: string;
}

export function ProfileImage({ user, className, ...props }: ProfileImageProps) {
  if (user.profileImageUrl != null) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.profileImageUrl}
        alt={user.displayName.substring(0, 1)}
        className={twMerge('mask mask-squircle object-cover', className)}
        {...props}
      />
    );
  }
  return (
    <CloudflareImage
      imageId={user.profileImageId ?? '5b46b9fd-8d41-4fbc-987f-3e7fd0e99600'}
      alt={user.displayName.substring(0, 1)}
      srcType="profile"
      className={twMerge('mask mask-squircle object-cover', className)}
      {...props}
    />
  );
}
