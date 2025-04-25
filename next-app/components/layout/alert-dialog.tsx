import {
  AlertDialog as AlertDialogWrapper,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AlertDialogProps {
  isOpen: boolean;
  variant: 'default' | 'leave-room' | 'delete-room';
  children?: React.ReactNode;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
}

export function AlertDialog({
  isOpen,
  variant = 'default',
  children,
  setIsOpen,
  onConfirm = () => {},
}: AlertDialogProps) {
  const variants = {
    default: {
      title: 'Are you absolutely sure',
      description: 'This action cannot be undone.',
      action: 'Continue',
    },
    'leave-room': {
      title: 'Leave Room',
      description:
        'Are you sure you want to leave this room? You may be required to enter a password to rejoin.',
      action: 'Leave',
    },
    'delete-room': {
      title: 'Delete Room',
      description:
        'Are you sure you want to delete this room? This action cannot be undone. All users and messages will be removed from the room.',
      action: 'Delete',
    },
  };

  const { title, description, action } = variants[variant];
  return (
    <AlertDialogWrapper open={isOpen}>
      <AlertDialogTrigger
        asChild
        onClick={() => {
          setIsOpen(true);
        }}
      >
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{action}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogWrapper>
  );
}
