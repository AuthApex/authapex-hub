import { NextRequest, NextResponse } from 'next/server';
import { getServerState } from '@/lib/server/serverState';
import { nanoid } from 'nanoid';
import { APP_NAME } from '@/lib/consts';
import { getAuth } from '@/lib/actions/auth';
import { setProfileImageId } from '@/lib/server/mongodb';
import { notifyUserUpdate } from '@/lib/server/websockets';

export async function POST(request: NextRequest) {
  const auth = await getAuth();
  if (!auth.isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
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
    await notifyUserUpdate(auth.user);

    if (previousImageId != null) {
      try {
        await getServerState().cloudflareImages.deleteImage(previousImageId);
      } catch {}
    }

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      await getServerState().cloudflareImages.deleteImage(imageId);
      return NextResponse.json({ success: false });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Something went wrong during the upload.' }, { status: 500 });
  }
}
