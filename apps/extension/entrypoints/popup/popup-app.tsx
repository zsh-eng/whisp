import '@/assets/main.css';
import { Input } from '@workspace/ui/components/input';
import '@workspace/ui/globals.css';
import { cn } from '@workspace/ui/lib/utils';
import { CheckCircleIcon, Loader2, XCircleIcon } from 'lucide-react';
import { storage } from 'wxt/storage';
import Keycap from '../../components/keycap';
import { isValidApiKey } from '../../lib/transcription';

function PopupApp() {
  const [apiKey, setApiKey] = useState('');
  const [savingState, setSavingState] = useState<
    'saved' | 'idle' | 'saving' | 'error'
  >('idle');

  useEffect(() => {
    storage.getItem('local:apiKey').then((key) => {
      if (key) {
        setApiKey(key as string);
      }
    });
  }, []);

  useEffect(() => {
    if (apiKey.length === 0) return;

    let cancelled = false;
    const debouncedSetApiKey = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (cancelled) return;

      setSavingState('saving');
      const isValid = await isValidApiKey(apiKey);
      if (isValid) {
        storage.setItem('local:apiKey', apiKey);
        setSavingState('saved');
      } else {
        setSavingState('error');
      }
    };

    debouncedSetApiKey();
    return () => {
      cancelled = true;
      setSavingState('idle');
    };
  }, [apiKey]);

  return (
    <div
      className='bg-transparent w-80 h-full p-2 pb-8'
      style={{
        fontFamily: 'Inter',
      }}
    >
      <section className='flex flex-col gap-0 px-1 mb-2'>
        <div
          className={cn(
            'px-1 py-1.5 text-base font-semibold text-muted-foreground'
          )}
        >
          API Key
        </div>

        <div className='relative'>
          <Input
            className='w-full text-sm focus-visible:ring-0 pr-8'
            placeholder='Enter your API key: sk-...'
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />

          {apiKey.length > 0 && savingState === 'saving' && (
            <Loader2 className='w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin' />
          )}

          {apiKey.length > 0 && savingState === 'saved' && (
            <CheckCircleIcon className='w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500 zoom-in-bouncy' />
          )}

          {apiKey.length > 0 && savingState === 'error' && (
            <XCircleIcon className='w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-red-500 zoom-in-bouncy' />
          )}
        </div>
      </section>

      <div
        className={cn(
          'px-2 py-1.5 text-base font-semibold text-muted-foreground mb-2'
        )}
      >
        Shortcuts
      </div>
      <div className='flex flex-col gap-2 px-2 w-full'>
        <section className='flex flex-col gap-2 '>
          <h2 className='text-xs uppercase text-muted-foreground'>
            Basic Usage
          </h2>
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
