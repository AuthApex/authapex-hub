'use client';

import { Translations } from '@/locales/translation';
import { UploadNewProfilePictureButton } from '@/components/client/actionButtons/UploadNewProfilePictureButton';
import { RemoveProfilePictureButton } from '@/components/client/actionButtons/RemoveProfilePictureButton';
import { useState } from 'react';

export interface EditProfilePictureButtonsProps {
  trans: Translations;
}

export function EditProfilePictureButtons({ trans }: EditProfilePictureButtonsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <>
      <UploadNewProfilePictureButton trans={trans} setIsLoading={setIsLoading} isLoading={isLoading} />
      <RemoveProfilePictureButton trans={trans} setIsLoading={setIsLoading} isLoading={isLoading} />
    </>
  );
}
