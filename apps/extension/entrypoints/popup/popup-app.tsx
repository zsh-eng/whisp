import '@/assets/main.css';
import '@workspace/ui/globals.css';
import { cn } from '@workspace/ui/lib/utils';
import Keycap from '../../components/keycap';

function PopupApp() {
  return (
    <div
      className='bg-muted w-80 h-full p-2 pb-8'
      style={{
        fontFamily: 'Inter',
      }}
    >
      <div
        className={cn(
          'px-2 py-1.5 text-lg font-semibold text-muted-foreground mb-2'
        )}
      >
        Keyboard Shortcuts
      </div>
      <div className='flex flex-col gap-2 px-2 w-full'>
        <section className='flex flex-col gap-2 '>
          <h2 className='text-xs uppercase text-muted-foreground'>Basic Usage</h2>
          <div className='flex items-center justify-between gap-2 w-full'>
            <p className='text-sm text-muted-foreground'>Toggle Whisp</p>
            <div className='flex items-center gap-1'>
              <Keycap character='⌘' />
              <Keycap character='⇧' />
              <Keycap character='X' />
            </div>
          </div>
        </section>

        <hr className='w-full border-muted-foreground/20 my-2' />

        <section className='gap-2 flex flex-col'>
          <h2 className='text-xs uppercase text-muted-foreground'>
            When recording
          </h2>

          <div className='flex items-center justify-between gap-2 w-full'>
            <p className='text-sm text-muted-foreground'>Paste on complete</p>
            <div className='flex items-center gap-1'>
              <Keycap character='⌘' />
              <Keycap character='⇧' />
              <Keycap character='E' />
            </div>
          </div>

          <div className='flex items-center justify-between gap-2 w-full'>
            <p className='text-sm text-muted-foreground'>Stop recording</p>
            <div className='flex items-center gap-1'>
              <Keycap character='⌘' />
              <Keycap character='⇧' />
              <Keycap character='A' />
            </div>
          </div>

          <div className='flex items-center justify-between gap-2 w-full'>
            <p className='text-sm text-muted-foreground'>
              Append to transcription
            </p>
            <div className='flex items-center gap-1'>
              <Keycap character='⌘' />
              <Keycap character='V' />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PopupApp;
