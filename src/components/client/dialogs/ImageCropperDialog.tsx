'use client';

import { BaseDialog, BaseDialogProps, Button, ErrorState, Typography } from 'gtomy-lib';
import { useState } from 'react';
import { Translations } from '@/locales/translation';
import Cropper, { Area } from 'react-easy-crop';
import { ScissorsIcon } from '@heroicons/react/24/outline';

export interface ImageCropperDialogProps extends BaseDialogProps {
  imageUrl: string | undefined;
  imageName: string | undefined;
  trans: Translations;
  onComplete: () => void;
}

export function ImageCropperDialog({
  imageUrl,
  imageName,
  trans,
  onOpenChange,
  onComplete,
  ...props
}: ImageCropperDialogProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  const createImage = (url: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
      image.src = url;
    });
  };

  const uploadCroppedImage: BlobCallback = (blob) => {
    if (blob == null) {
      setIsUploading(false);
      return;
    }
    const formData = new FormData();
    formData.append('file', blob, imageName);

    fetch('/api/user/profile', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          setError(null);
          setIsUploading(false);
          onComplete();
        } else {
          setError(response.status);
          setIsUploading(false);
        }
      })
      .catch((error) => {
        setError(error);
        setIsUploading(false);
      });
  };

  const cropAndUploadImage = async (imageSrc: string, pixelCrop: Area) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (ctx == null) {
      throw new Error('Failed to create canvas context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5);
    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return canvas.toBlob(uploadCroppedImage, 'image/jpeg');
  };

  const onFinish = () => {
    if (croppedAreaPixels == null || imageUrl == null || isUploading) {
      return;
    }
    setError(null);
    setIsUploading(true);
    cropAndUploadImage(imageUrl, croppedAreaPixels).catch((error) => {
      setError(error);
      setIsUploading(false);
    });
  };

  const internalOnOpenChange = (open: boolean) => {
    if (isUploading) {
      return;
    }
    onOpenChange?.(open);
  };

  return (
    <BaseDialog title={trans.home.cropProfileImage} maxWidth="sm" onOpenChange={internalOnOpenChange} {...props}>
      <Typography size="2xl" weight="semibold">
        {trans.home.cropProfileImage}
      </Typography>

      <div className="h-96 w-full relative">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onCropComplete={(_, croppedAreaPixels) => {
            setCroppedAreaPixels(croppedAreaPixels);
          }}
          onZoomChange={setZoom}
        />
      </div>

      {error != null && <ErrorState translation={trans.error} error={error} />}

      <Button
        loading={isUploading ? true : undefined}
        startIcon={isUploading ? undefined : ScissorsIcon}
        color="primary"
        onClick={onFinish}
        disabled={croppedAreaPixels == null}
      >
        {isUploading ? trans.home.uploadingNewProfileImage : trans.home.crop}
      </Button>
    </BaseDialog>
  );
}
