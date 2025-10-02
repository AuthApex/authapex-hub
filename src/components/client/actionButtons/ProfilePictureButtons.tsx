'use client';

import { Translations } from '@/locales/translation';
import { UploadNewProfilePictureButton } from '@/components/client/actionButtons/UploadNewProfilePictureButton';
import { RemoveProfilePictureButton } from '@/components/client/actionButtons/RemoveProfilePictureButton';
import { useState } from 'react';

export interface ProfilePictureButtonsProps {
  trans: Translations;
}

export function ProfilePictureButtons({ trans }: ProfilePictureButtonsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <>
      <UploadNewProfilePictureButton trans={trans} setIsLoading={setIsLoading} isLoading={isLoading} />
      <RemoveProfilePictureButton trans={trans} setIsLoading={setIsLoading} isLoading={isLoading} />
    </>
  );
}
