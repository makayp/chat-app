'use server';

import { clientConfig } from './constants.client';
import {
  CheckRoomPrivacyParams,
  CheckRoomPrivacyResponse,
  CreateRoomParams,
  CreateRoomResponse,
} from './types';
// import { generateToken } from './utils.server';

export async function createRoom({
  roomName,
  userToken,
}: CreateRoomParams): Promise<CreateRoomResponse> {
  try {
    const res = await fetch(`${clientConfig.backendUrl}/api/chat/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ roomName }),
    });

    if (!res.ok) {
      return { error: 'An error occurred while creating the room' };
    }

    const { roomId } = (await res.json()) as {
      roomId: string;
    };

    return { data: { roomId } };
  } catch (error) {
    console.error('Error: ', error);
    return { error: 'Server error, try again' };
  }
}

export async function checkRoomPrivacy({
  roomId,
}: CheckRoomPrivacyParams): Promise<CheckRoomPrivacyResponse> {
  try {
    const res = await fetch(
      `${clientConfig.backendUrl}/api/chat/check-privacy?roomId=${roomId}`
    );

    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const { error } = (await res.json()) as { error: string };
        console.error('Error: ', error);
        return { error };
      }
    }

    const { isPrivate } = (await res.json()) as { isPrivate: boolean };

    return { data: { isPrivate } };
  } catch (error) {
    console.error('Error: ', error);
    return { error: 'Server error, try again' };
  }
}

export async function joinRoom({
  roomId,
  userToken,
  password,
}: {
  roomId: string;
  userToken: string;
  password?: string;
}): Promise<{ error?: string; success?: string }> {
  const body = password ? { roomId, password } : { roomId };

  console.log(body);

  try {
    const res = await fetch(`${clientConfig.backendUrl}/api/chat/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const contentType = res.headers.get('content-type');

      let data;
      if (contentType?.includes('application/json')) {
        data = (await res.json()) as { error: string };
        console.log(data);
      }

      if (res.status === 404) {
        return { error: 'Room does not exist' };
      }
      if (res.status === 403) {
        return data?.error
          ? { error: data.error }
          : { error: 'Invalid password' };
      }

      return { error: 'An error occurred while joining the room' };
    }

    return { success: 'Successfully joined room' };
  } catch (error) {
    console.error('Error: ', error);
    return { error: 'Server error, try again' };
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
