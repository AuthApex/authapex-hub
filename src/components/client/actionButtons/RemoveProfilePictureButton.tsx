'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { removeProfileImage } from '@/lib/actions/profileUpdates';
import { Button } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface RemoveProfilePictureButtonProps {
  trans: Translations;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function RemoveProfilePictureButton({ trans, setIsLoading, isLoading }: RemoveProfilePictureButtonProps) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const onClick = async () => {
    setIsLoading(true);
    setIsRemoving(true);
    await removeProfileImage();
    setIsLoading(false);
    setIsRemoving(false);
    router.refresh();
  };

  return (
    <Button
      startIcon={isRemoving ? undefined : XMarkIcon}
      loading={isRemoving ? true : undefined}
      color="error"
      outline
      onClick={onClick}
      disabled={isLoading}
    >
      {isRemoving ? trans.home.removingProfileImage : trans.home.removeProfileImage}
    </Button>
  );
}
