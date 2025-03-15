'use server';

import { SERVER_URL } from './constants.server';
import {
  CheckRoomPrivacyParams,
  CheckRoomPrivacyResponse,
  CreateRoomParams,
  CreateRoomResponse,
} from './types';
import { generateToken } from './utils.server';

export async function createRoom({
  roomName,
}: CreateRoomParams): Promise<CreateRoomResponse> {
  try {
    const authToken = generateToken();

    const res = await fetch(`${SERVER_URL}/api/chat/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ roomName }),
    });

    if (!res.ok) {
      return { error: 'An error occurred while creating the room' };
    }

    const { roomId, accessToken } = (await res.json()) as {
      roomId: string;
      accessToken: string;
    };

    return { data: { roomId, accessToken } };
  } catch (error) {
    console.error('Error: ', error);
    return { error: 'Server error, try again' };
  }
}

export async function checkRoomPrivacy({
  roomId,
}: CheckRoomPrivacyParams): Promise<CheckRoomPrivacyResponse> {
  try {
    const authToken = generateToken();

    const res = await fetch(
      `${SERVER_URL}/api/chat/check-privacy?roomId=${roomId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
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

    console.log({ isPrivate });

    return { data: { isPrivate } };
  } catch (error) {
    console.error('Error: ', error);
    return { error: 'Server error, try again' };
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
