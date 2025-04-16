import { cn } from '@/lib/utils';

export default function Overlay({
  onClick = () => {},
  className,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/70 animate-in fade-in-0',
        className
      )}
      onClick={onClick}
    />
  );
}
