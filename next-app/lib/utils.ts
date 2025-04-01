import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - timestamp) / 1000);

  if (diffInSeconds < 60) return `now`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  const formattedMinutes = minutes.toString().padStart(2, '0');

  const isToday = now.toDateString() === date.toDateString();
  const isYesterday =
    new Date(now.setDate(now.getDate() - 1)).toDateString() ===
    date.toDateString();

  if (isToday) return `${formattedHours}:${formattedMinutes} ${ampm}`;
  if (isYesterday)
    return `Yesterday at ${formattedHours}:${formattedMinutes} ${ampm}`;

  return `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()} at ${formattedHours}:${formattedMinutes} ${ampm}`;
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateMessageId() {
  return 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

export function createUser(username: string) {
  return {
    userId: generateUUID(),
    username,
  };
}
