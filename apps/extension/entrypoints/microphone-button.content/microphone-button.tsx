import '@/assets/main.css';
import '@workspace/ui/globals.css';
import { MicIcon } from 'lucide-react';

export function MicrophoneButton() {
  return (
    <div className='fixed bottom-[1em] right-[1em] z-[9999]'>
      <button
        className='w-[3em] h-[3em] p-[.5em] rounded-[.5em] bg-background/90 cursor-pointer group transition-all flex items-center justify-center hover:scale-110 border border-solid border-[oklch(0.708, 0, 0)] backdrop-blur-2xl duration-200 ease-out'
        onClick={() => {
          browser.runtime.sendMessage({
            action: 'start-recording',
          });
        }}
      >
        <MicIcon className='size-[1.5em] text-muted-foreground group-hover:text-foreground transition-all' />
      </button>
    </div>
  );
}
