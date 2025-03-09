import '@workspace/ui/globals.css';
import '~/assets/public.css';

import { cn } from '@workspace/ui/lib/utils';
import { MicIcon } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/use-audio-recorder';

export default function WhispPanelApp() {
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [timecode, setTimecode] = useState<number | null>(null);

  const { transcriptionText, handleTranscription, isTranscribing } =
    useTranscription();

  const handleDataAvailable = useCallback(
    (data: Float32Array, timecode: number) => {
      setAudioData(data);
      setTimecode(timecode);
    },
    []
  );

  const handleRecordingComplete = useCallback(async (audioBlob: Blob) => {
    await handleTranscription(audioBlob);
  }, []);

  const {
    isRecording,
    startRecording,
    stopRecording,
    error: recordingError,
  } = useAudioRecorder({
    onDataAvailable: handleDataAvailable,
    onRecordingComplete: handleRecordingComplete,
  });

  // useEffect(() => {
  //   startRecording();
  // }, []);

  const numMinutes = timecode ? Math.floor(timecode / 60 / 1000) : 0;
  const numSeconds =
    `${timecode ? Math.floor((timecode % 60000) / 1000) : 0}`.padStart(2, '0');

  return (
    <div className={cn('fixed top-[2em] left-[2em]')}>
      <div
        className='slide-in-from-top-bouncy flex items-center gap-[1em] rounded-[.25em] w-[20em] h-[3em] bg-background px-[1em] py-[.5em] shadow-xl border border-solid border-muted-foreground/20 cursor-pointer'
        onClick={() => {
          if (isRecording) {
            stopRecording();
          } else {
            setTimecode(null);
            startRecording();
          }
        }}
      >
        <MicIcon className='size-[1.5em]' />
        <Waveform
          audioData={audioData}
          isRecording={isRecording}
          timecode={timecode}
        />
        <div className='text-[.9em]'>
          {numMinutes}:{numSeconds}
        </div>
      </div>

      {transcriptionText && (
        <div className='animate-in zoom-in mt-[.5em] px-[1em] py-[.5em] rounded-[.25em] w-[20em] h-max bg-background'>
          {<div className='text-[.875em] font-medium'>{transcriptionText}</div>}
        </div>
      )}
    </div>
  );
}
