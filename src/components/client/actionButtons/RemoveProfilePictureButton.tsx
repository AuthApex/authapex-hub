'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { removeProfileImage } from '@/lib/actions/profileUpdates';
import { Button } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { useRouter } from 'next/navigation';

export interface RemoveProfilePictureButtonProps {
  trans: Translations;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function RemoveProfilePictureButton({ trans, setIsLoading, isLoading }: RemoveProfilePictureButtonProps) {
  const router = useRouter();

  const onClick = async () => {
    setIsLoading(true);
    await removeProfileImage();
    setIsLoading(false);
    router.refresh();
  };

  return (
    <Button startIcon={XMarkIcon} color="error" outline onClick={onClick} disabled={isLoading}>
      {trans.home.removeProfileImage}
    </Button>
  );
}
