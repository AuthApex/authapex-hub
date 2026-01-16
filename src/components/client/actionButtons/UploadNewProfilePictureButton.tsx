'use client';

import { Button } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { ChangeEvent, useRef, useState } from 'react';
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
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setIsLoading(true);
    setIsUploading(true);
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
      setIsUploading(false);
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
      <Button
        color="primary"
        onClick={handleButtonClick}
        loading={isUploading ? true : undefined}
        startIcon={isUploading ? undefined : ArrowUpTrayIcon}
        disabled={isLoading}
      >
        {isUploading ? trans.home.uploadingNewProfileImage : trans.home.uploadNewProfileImage}
      </Button>
    </>
  );
}
