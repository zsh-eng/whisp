import '@workspace/ui/globals.css';
import '~/assets/public.css';

import { cn } from '@workspace/ui/lib/utils';
import { CircleCheck, Loader2, MicIcon } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/use-audio-recorder';
import {
  useCopyToClipboard,
  useCopyToClipboardShortcut,
} from '../../hooks/use-insert-at-cursor';
import { useToggleRecorder } from '../../hooks/use-toggle-recorder';

export default function WhispPanelApp() {
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [timecode, setTimecode] = useState<number | null>(null);

  const { isOpen, isOpenRef } = useToggleRecorder();
  const {
    transcriptionText,
    handleTranscription,
    isTranscribing,
    resetTranscription,
  } = useTranscription();

  const handleDataAvailable = useCallback(
    (data: Float32Array, timecode: number) => {
      setAudioData(data);
      setTimecode(timecode);
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

  useStopRecordingShortcut({
    onStopRecording: () => {
      stopRecording();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setTimecode(null);
      startRecording();
    } else {
      resetTranscription();
      setAudioData(null);
      setTimecode(null);
      stopRecording();
    }
  }, [isOpen]);

  const { copyToClipboard } = useCopyToClipboard();
  const handleCopyToClipboard = useCallback(() => {
    if (transcriptionText) {
      copyToClipboard(transcriptionText);
    }
  }, [copyToClipboard, transcriptionText]);
  useCopyToClipboardShortcut({
    onCopyToClipboard: handleCopyToClipboard,
  });

  const numMinutes = timecode ? Math.floor(timecode / 60 / 1000) : 0;
  const numSeconds =
    `${timecode ? Math.floor((timecode % 60000) / 1000) : 0}`.padStart(2, '0');
  const numHundredthsOfSeconds =
    `${timecode ? Math.floor((timecode % 1000) / 10) : 0}`.padStart(2, '0');

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

      {transcriptionText && (
        <div className='animate-in zoom-in px-[1em] py-[.5em] rounded-[1em] w-[24em] h-max bg-background border border-solid border-muted-foreground/20'>
          {<div className='text-[.875em] font-medium'>{transcriptionText}</div>}
        </div>
      )}

      <div
        className='zoom-in-bouncy flex items-center gap-[1em] rounded-full w-[20em] h-[3em] bg-background px-[1em] py-[.5em] shadow-xl border border-solid border-muted-foreground/20 cursor-pointer'
        onClick={() => {
          if (isRecording) {
            stopRecording();
          } else {
            setTimecode(null);
            startRecording();
          }
        }}
      >
        {isTranscribing ? (
          <Loader2 className='size-[2em] animate-spin text-[#6a41b4]' />
        ) : transcriptionText ? (
          <CircleCheck className='size-[2em] text-[#6a41b4]' />
        ) : (
          <MicIcon className='size-[1.5em]' />
        )}
        <Waveform
          audioData={audioData}
          isRecording={isRecording}
          timecode={timecode}
        />

        <div className='text-[.8em] w-[6em]'>
          {numMinutes}:{numSeconds},{numHundredthsOfSeconds}
        </div>
      </div>
    </div>
  );
}
