import '@workspace/ui/globals.css';
import '~/assets/public.css';

import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import { CircleCheck, Loader2, MicIcon } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/use-audio-recorder';
import {
  useCopyToClipboard,
  useCopyToClipboardShortcut,
} from '../../hooks/use-insert-at-cursor';
import { useToggleRecorder } from '../../hooks/use-toggle-recorder';

function formatTimecode(timeInSeconds: number) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.round(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function WhispPanelApp() {
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [timecode, setTimecode] = useState<number | null>(null);
  const timecodeRef = useRef<number | null>(null);

  const { isOpen, isOpenRef } = useToggleRecorder();
  const {
    transcription,
    handleTranscription,
    isTranscribing,
    resetTranscription,
  } = useTranscription();

  const handleDataAvailable = useCallback(
    (data: Float32Array, timecode: number) => {
      setAudioData(data);
      setTimecode(timecode);
      timecodeRef.current = timecode;
    },
    []
  );

  const handleRecordingComplete = useCallback(
    async (audioBlob: Blob) => {
      if (!isOpenRef.current) {
        return;
      }

      await handleTranscription(audioBlob);
    },
    [isOpenRef]
  );

  const {
    isRecording,
    startRecording,
    stopRecording,
    error: recordingError,
  } = useAudioRecorder({
    onDataAvailable: handleDataAvailable,
    onRecordingComplete: handleRecordingComplete,
  });

  const stopRecordingAndReset = useCallback(() => {
    stopRecording();
    resetTranscription();
    setAudioData(null);
    setTimecode(null);
    timecodeRef.current = null;
  }, []);

  useStopRecordingShortcut({
    onStopRecording: () => {
      stopRecording();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setTimecode(null);
      timecodeRef.current = null;
      startRecording();
    } else {
      stopRecordingAndReset();
    }
  }, [isOpen]);

  const { copyToClipboard } = useCopyToClipboard();
  const handleCopyToClipboard = useCallback(() => {
    if (transcription?.text) {
      copyToClipboard(transcription.text);
    }
  }, [copyToClipboard, transcription]);
  useCopyToClipboardShortcut({
    onCopyToClipboard: handleCopyToClipboard,
  });

  const numMinutes = timecode ? Math.floor(timecode / 60 / 1000) : 0;
  const numSeconds =
    `${timecode ? Math.floor((timecode % 60000) / 1000) : 0}`.padStart(2, '0');

  const { pasteSegments } = usePasteSegments({
    active: isRecording,
    getCurrentTimecode: () => timecodeRef.current ?? 0,
  });

  return (
    <div
      className={cn(
        'fixed bottom-[2em] left-1/2 -translate-x-1/2 translate-y-0 flex flex-col items-center gap-[.75em]',
        isOpen ? '' : 'hidden'
      )}
    >
      {/* <div className='w-full flex items-center gap-[.5em]'>
        <div className='flex items-center gap-[.5em] bg-background rounded-[.5em] px-[.5em] py-[.5em] shadow-xl border border-solid border-muted-foreground/20'>
          <div className='flex items-center w-max gap-[.25em]'>
            <Keycap character='⇧' />
            <Keycap character='⌘' />
            <Keycap character='S' />
          </div>
          <div className='text-[.75em]'>Stop recording</div>
        </div>
      </div> */}

      {transcription?.text && (
        <div className='animate-in zoom-in px-[1em] py-[.5em] rounded-[1em] w-[24em] h-max bg-background border border-solid border-muted-foreground/20'>
          {
            <div className='text-[.875em] font-medium'>
              {transcription.text}
            </div>
          }
        </div>
      )}
      <div className='zoom-in-bouncy flex flex-col justify-center items-center gap-[.5em] rounded-[1em] w-[24em] h-max bg-background px-[1em] py-[.5em] shadow-xl border border-solid border-muted-foreground/20 cursor-pointer'>
        <div className='w-full flex gap-[.25em] overflow-x-auto'>
          {pasteSegments.length === 0 && (
            <Badge variant='secondary' className=''>
              Paste text
            </Badge>
          )}

          {pasteSegments.map((pasteSegment) => (
            <Badge
              variant='outline'
              className='zoom-in-bouncy'
              key={pasteSegment.timecodeInSeconds + pasteSegment.text}
            >
              <span className='text-muted-foreground'>
                {`${formatTimecode(pasteSegment.timecodeInSeconds)}`}
              </span>
              {pasteSegment.text.slice(0, 10).trim()}...
            </Badge>
          ))}
        </div>
        <div className='flex items-center gap-[.5em] flex-0'>
          {isTranscribing ? (
            <Loader2 className='size-[1.5em] animate-spin text-cyan-500' />
          ) : transcription?.text ? (
            <CircleCheck className='size-[1.5em] text-cyan-500 zoom-in-bouncy' />
          ) : (
            <MicIcon className='size-[1.5em]' />
          )}
          <Waveform
            audioData={audioData}
            isRecording={isRecording}
            timecode={timecode}
          />

          <div className='text-[.8em] w-max text-center'>
            {numMinutes}:{numSeconds}
          </div>
        </div>
      </div>
    </div>
  );
}
