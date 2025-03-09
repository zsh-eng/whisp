import { cn } from '@workspace/ui/lib/utils';

type KeycapProps = {
  character: string;
  className?: string;
};

export default function Keycap({ character, className }: KeycapProps) {
  return (
    <div
      className={cn(
        'w-[1.5em] h-[1.5em] bg-muted-foreground p-[.1em] pb-[.2em] rounded-[.5em]',
        className
      )}
    >
      <div className='text-[.75em] text-foreground bg-background rounded-sm flex justify-center items-center h-full'>
        {character}
      </div>
    </div>
  );
}
