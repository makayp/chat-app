'use client';

import { ArrowLeftCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import Card from './card';
import CreateRoomForm from './create-room-form';
import JoinRoomForm from './join-room-form';

export default function JoinCreateRoom() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const roomId = searchParams.get('roomId');

  const isCreateMode = mode === 'create';

  function handleChangeMode() {
    if (isCreateMode) {
      window.history.pushState({}, '', '/');
    } else {
      window.history.pushState({}, '', '/?mode=create');
    }
  }

  return (
    <div>
      <Card className='w-[calc(100dvw-32px)] max-w-[25rem] text-center py-12 '>
        {!isCreateMode && (
          <div className='space-y-8'>
            <h2 className='font-medium text-2xl text-center capitalize'>
              Join a chat room
            </h2>
            <JoinRoomForm roomId={roomId} />
            <p>Or</p>
            <Button onClick={handleChangeMode} className='w-fit mx-auto'>
              Create room
            </Button>
          </div>
        )}

        {isCreateMode && (
          <div className='space-y-8'>
            <h2 className='font-medium text-2xl text-center capitalize'>
              Create a chat room
            </h2>
            <CreateRoomForm />

            <Button
              asChild
              variant='link'
              onClick={handleChangeMode}
              className='w-fit mx-auto hover:no-underline hover:text-foreground/90'
            >
              <span>
                <ArrowLeftCircle size={24} /> Join room
              </span>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
