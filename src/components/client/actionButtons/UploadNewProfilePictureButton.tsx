'use client';

import { Button } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { ChangeEvent, useRef } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export interface UploadNewProfilePictureButtonProps {
  trans: Translations;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function UploadNewProfilePictureButton({ trans, setIsLoading, isLoading }: UploadNewProfilePictureButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Upload failed with status:', response.status);
      }
    } catch (error) {
      console.error('An error occurred during the upload:', error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsLoading(false);
      router.refresh();
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={isLoading}
      />
      <Button startIcon={ArrowUpTrayIcon} color="primary" onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? trans.home.uploadingNewProfileImage : trans.home.uploadNewProfileImage}
      </Button>
    </>
  );
}
