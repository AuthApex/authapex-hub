'use client';

import { Button, DialogElement, useDialog } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageCropperDialog } from '@/components/client/dialogs/ImageCropperDialog';
import ImageUploading from 'react-images-uploading';
import { ImageListType } from 'react-images-uploading/dist/typings';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export interface UploadNewProfilePictureButtonProps {
  trans: Translations;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function UploadNewProfilePictureButton({ trans, setIsLoading, isLoading }: UploadNewProfilePictureButtonProps) {
  const router = useRouter();

  const [image, setImage] = useState<ImageListType>([]);

  const { openDialog, dialogElementProps } = useDialog(({ onOpenChange, ...props }) => (
    <ImageCropperDialog
      imageUrl={image.length > 0 ? image[0].dataURL : undefined}
      trans={trans}
      onComplete={() => {
        setIsLoading(false);
        router.refresh();
        onOpenChange?.(false);
      }}
      onOpenChange={(open) => {
        if (!open) {
          setIsLoading(false);
        }
        onOpenChange?.(open);
      }}
      {...props}
    />
  ));

  const handleOnImageChange = (value: ImageListType) => {
    setImage(value);
    setIsLoading(true);
    openDialog();
  };

  return (
    <>
      <DialogElement {...dialogElementProps} />
      <ImageUploading value={image} onChange={handleOnImageChange}>
        {({ onImageUpload, onImageUpdate }) => (
          <Button
            color="primary"
            startIcon={ArrowUpTrayIcon}
            onClick={image ? onImageUpload : () => onImageUpdate(0)}
            disabled={isLoading}
          >
            {trans.home.uploadNewProfileImage}
          </Button>
        )}
      </ImageUploading>
    </>
  );
}
