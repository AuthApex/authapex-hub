import { NextRequest, NextResponse } from 'next/server';
import { getServerState } from '@/lib/server/serverState';
import { nanoid } from 'nanoid';
import { APP_NAME } from '@/lib/consts';
import { getAuth } from '@/lib/actions/auth';
import { setProfileImageId } from '@/lib/server/mongodb';

export async function POST(request: NextRequest) {
  const auth = await getAuth();
  if (!auth.isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!auth.canChangeProfileImage) {
    return NextResponse.json({ error: 'Cannot set profile image to google account user' }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
    }

    const uuid = nanoid(32);
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
  } catch {
    return NextResponse.json({ error: 'Something went wrong during the upload.' }, { status: 500 });
  }
}
