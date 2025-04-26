import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RoomNotFound() {
  return (
    <div className='h-dvh flex items-center justify-center p-10'>
      <div className='text-center'>
        <h1 className='font-medium text-2xl text-muted-foreground'>404</h1>
        <h1 className='text-2xl font-medium'>Page not found</h1>
        <p>The room you are trying to access does not exist</p>
        <Link href='/'>
          <Button className='mt-4 bg-primary hover:bg-primary/90'>Home</Button>
        </Link>
      </div>
    </div>
  );
}
