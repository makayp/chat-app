'use server';

import { SERVER_URL } from './constants.server';
import {
  CheckRoomPrivacyParams,
  CheckRoomPrivacyResponse,
  CreateRoomParams,
  CreateRoomResponse,
} from './types';

export async function createRoom({
  roomName,
}: CreateRoomParams): Promise<CreateRoomResponse> {
  try {
    const res = await fetch(`${SERVER_URL}/api/chat/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomName }),
    });

    if (!res.ok) {
      return { error: 'An error occurred while creating the room' };
    }

    const { roomId, token } = (await res.json()) as {
      roomId: string;
      token: string;
    };

    return { data: { roomId, token } };
  } catch (error) {
    console.error(error);
    return { error: 'An error occurred while creating the room' };
  }
}

export async function checkRoomPrivacy({
  roomId,
}: CheckRoomPrivacyParams): Promise<CheckRoomPrivacyResponse> {
  try {
    const res = await fetch(
      `${SERVER_URL}/api/chat/check-privacy?roomId=${roomId}`
    );

    if (!res.ok) {
      if (res.status === 404) {
        return { error: 'Room does not exist' };
      }
      return { error: 'An error occurred, please try again.' };
    }

    const { isPrivate } = (await res.json()) as { isPrivate: boolean };

    console.log({ isPrivate });

    return { data: { isPrivate } };
  } catch (error) {
    console.error(error);
    return { error: 'An error occurred, please try again' };
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
