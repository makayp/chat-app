import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { File } from 'lucide-react';
import { type File as FileType } from '@/types';

interface FilePreviewProps {
  files: FileType[];
}

export default function FilePreview({ files }: FilePreviewProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className='grid gap-2 overflow-hidden'>
      {files.map((file, index) => {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          return (
            <Dialog
              key={index}
              open={openIndex === index}
              onOpenChange={(open) => setOpenIndex(open ? index : null)}
            >
              <DialogTrigger asChild>
                <div className='cursor-pointer overflow-hidden rounded-md max-w-xs'>
                  {file.type.startsWith('image/') && (
                    <Image
                      src={file.url}
                      alt={file.name}
                      width={300}
                      height={200}
                      className='rounded-md'
                    />
                  )}
                  {file.type.startsWith('video/') && (
                    <video
                      className='rounded-md w-full max-h-52 '
                      src={file.url}
                      muted
                      playsInline
                      preload='metadata'
                    />
                  )}
                </div>
              </DialogTrigger>
              <DialogContent className='p-0  overflow-hidden border-none'>
                <DialogHeader hidden>Image preview</DialogHeader>
                {file.type.startsWith('image/') && (
                  <Image
                    src={file.url}
                    alt={file.name}
                    width={300}
                    height={200}
                    className='rounded-md w-full object-cover aspect-square'
                  />
                )}
                {file.type.startsWith('video/') && (
                  <video
                    controls
                    autoPlay
                    className='w-full h-auto rounded-md'
                    src={file.url}
                  />
                )}
              </DialogContent>
            </Dialog>
          );
        }

        if (file.type.startsWith('audio/')) {
          return (
            <div key={index} className='rounded-md bg-secondary p-2'>
              <p className='text-xs font-medium mb-1'>{file.name}</p>
              <audio controls className='w-full rounded-md'>
                <source src={file.url} type={file.type} />
                Your browser does not support the audio element.
              </audio>
            </div>
          );
        }

        return (
          <a
            key={index}
            href={file.url}
            target='_blank'
            rel='noopener noreferrer'
            className='block bg-background text-foreground/90 p-2 text-xs font-medium rounded-md hover:underline  overflow-hidden break-words'
          >
            <File className='inline mr-1' />
            {file.name}
          </a>
        );
      })}
    </div>
  );
}
