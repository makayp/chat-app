'use client';

export default function FormError({ error }: { error: string }) {
  return <p className='text-red-500 text-[0.85rem]'>{error}</p>;
}
