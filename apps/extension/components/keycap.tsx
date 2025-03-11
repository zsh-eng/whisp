import { cn } from '@workspace/ui/lib/utils';

type KeycapProps = {
  character: string;
  className?: string;
};

export default function Keycap({ character, className }: KeycapProps) {
  return (
    <div
      className={cn(
        'w-7 h-7 bg-muted-foreground p-0.5 pb-1 rounded-md',
        className
      )}
    >
      <div className='text-xs text-foreground bg-background rounded-sm flex justify-center items-center h-full'>
        {character}
      </div>
    </div>
  );
}
