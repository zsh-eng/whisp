import '@workspace/ui/globals.css';
import { cn } from '@workspace/ui/lib/utils';
import { MicIcon } from 'lucide-react';

export default function WhispPanelApp() {
  return (
    <div
      className={cn(
        'fixed bottom-[2em] left-[2em]'
      )}
    >
      <div className='flex items-center gap-2  rounded-full w-[16em] h-[3em] bg-background px-[1.5em] py-[.5em] shadow-xl border border-solid border-muted-foreground/20 cursor-pointer'>
        <MicIcon className='size-[1em]' />
        <span className='text-sm font-medium'>Start Recording</span>
      </div>
    </div>
  );
}
