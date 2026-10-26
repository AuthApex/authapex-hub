import { NextRequest } from 'next/server';
import { getServerState } from '@/lib/server/serverState';
import { nanoid } from 'nanoid';
import { APP_NAME } from '@/lib/consts';
import { getAuth } from '@/lib/actions/auth';
import { setProfileImageId } from '@/lib/server/mongodb';
import { notifyUserUpdate } from '@/lib/server/websockets';
import { apiError, handleRouteError, jsonNoStore } from '@/lib/server/api';
import { logWarning } from '@/lib/server/logger';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    if (!auth.isAuth) {
      return apiError('Unauthorized', 401);
    }

    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return apiError('No file was provided.', 400);
    }

    const uuid = nanoid();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const cloudflareImage = await getServerState().cloudflareImages.createImageFromBuffer(
      {
        id: uuid,
        fileName: APP_NAME + '_' + uuid,
      },
      buffer
    );
    const previousImageId = auth.user.profileImageId;
    const imageId = cloudflareImage.result.id;
    const result = await setProfileImageId(auth.user.userId, imageId);

    if (!result.success) {
      // The database entry could not be updated, so remove the newly uploaded image again.
      try {
        await getServerState().cloudflareImages.deleteImage(imageId);
      } catch (error) {
        logWarning('The orphaned profile image could not be deleted', { area: 'profile-image' }, error);
      }
      return jsonNoStore({ success: false });
    }

    await notifyUserUpdate(auth.user);

    if (previousImageId != null) {
      try {
        await getServerState().cloudflareImages.deleteImage(previousImageId);
      } catch (error) {
        // The new image is already stored, so failing to delete the old one must not fail the upload.
        logWarning('The previous profile image could not be deleted', { area: 'profile-image' }, error);
      }
    }

    return jsonNoStore({ success: true });
  } catch (error) {
    return handleRouteError(error, '/api/user/profile', 'Something went wrong during the upload.');
  }
}
