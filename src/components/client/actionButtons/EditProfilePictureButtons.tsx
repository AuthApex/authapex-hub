'use client';

import { Translations } from '@/locales/translation';
import { UploadNewProfilePictureButton } from '@/components/client/actionButtons/UploadNewProfilePictureButton';
import { RemoveProfilePictureButton } from '@/components/client/actionButtons/RemoveProfilePictureButton';
import { useState } from 'react';
import { User } from '@authapex/core';

export interface EditProfilePictureButtonsProps {
  trans: Translations;
  user: User;
}

export function EditProfilePictureButtons({ trans, user }: EditProfilePictureButtonsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <>
      <UploadNewProfilePictureButton trans={trans} setIsLoading={setIsLoading} isLoading={isLoading} />
      {user.profileImageId != null && (
        <RemoveProfilePictureButton trans={trans} setIsLoading={setIsLoading} isLoading={isLoading} />
      )}
    </>
  );
}
