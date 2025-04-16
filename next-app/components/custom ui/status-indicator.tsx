import clsx from 'clsx';

export default function StatusIndicator({ isOnline }: { isOnline: boolean }) {
  return (
    <div
      className={clsx('inline-flex h-2 w-2 rounded-full', {
        'bg-green-500': isOnline,
        'bg-gray-400': !isOnline,
      })}
    />
  );
}
