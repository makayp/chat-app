import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RoomNotFound() {
  return (
    <div className='h-dvh flex items-center justify-center p-10'>
      <div className='text-center'>
        <h1 className='text-2xl font-medium'>Room not found</h1>
        <p>The room you are trying to access does not exist</p>
        <Link href='/'>
          <Button className='mt-4 bg-blue-600 hover:bg-blue-600/90 text-white'>
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
