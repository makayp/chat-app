import Image from 'next/image';
import grain from '@/public/images/grain.jpg';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

type CardProps = {
  showRadialGradient?: boolean;
  maskBorder?: boolean;
  borderClassName?: string;
  radialGradientClassName?: string;
  className?: string;
  children: React.ReactNode;
};

export default function Card({
  showRadialGradient = true,
  maskBorder = false,
  borderClassName,
  radialGradientClassName,
  className,
  children,
}: CardProps) {
  return (
    <div
      className={clsx(
        'relative flex flex-col p-8 backdrop-blur-lg text-card-foreground z-10 rounded-lg overflow-hidden',
        className
      )}
    >
      {showRadialGradient && (
        <div
          className={twMerge(
            'bg-[radial-gradient(circle,rgba(255,255,255,0.4)_0%,rgba(0,0,0,0)_70%)] size-[20rem] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 blur-3xl',
            radialGradientClassName
          )}
        />
      )}
      <div
        className={twMerge(
          clsx('border border-border -z-10 absolute inset-0 m-0 rounded-lg', {
            '[mask-image:linear-gradient(to_top_right,transparent,black_20%,black_80%,transparent)]':
              maskBorder,
          }),
          borderClassName
        )}
      />
      <Image
        src={grain}
        alt='grain'
        priority
        fill
        className='object-cover opacity-[0.02] -z-10 absolute inset-0 rounded-lg'
      />
      {children}
    </div>
  );
}
