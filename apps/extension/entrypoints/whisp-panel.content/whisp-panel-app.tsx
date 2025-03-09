import '@workspace/ui/globals.css';
import { cn } from '@workspace/ui/lib/utils';
import { CircleStopIcon, MicIcon } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/use-audio-recorder';

export default function WhispPanelApp() {
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [timecode, setTimecode] = useState<number | null>(null);

  const handleDataAvailable = useCallback(
    (data: Float32Array, timecode: number) => {
      setAudioData(data);
      setTimecode(timecode);
    },
    []
  );

  const handleRecordingComplete = useCallback(async (audioBlob: Blob) => {
    console.log('audioBlob', audioBlob);
    setTimecode(null);
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

  return (
    <div className={cn('fixed bottom-[2em] left-[2em]')}>
      <div
        className='flex items-center gap-2  rounded-full w-[16em] h-[3em] bg-background px-[1.5em] py-[.5em] shadow-xl border border-solid border-muted-foreground/20 cursor-pointer'
        onClick={() => {
          if (isRecording) {
            stopRecording();
          } else {
            startRecording();
          }
        }}
      >
        {isRecording ? (
          <>
            <CircleStopIcon className='size-[1em]' />
            <Waveform
              audioData={audioData}
              isRecording={isRecording}
              timecode={timecode}
            />
          </>
        ) : (
          <>
            <MicIcon className='size-[1em]' />
            <span className='text-sm font-medium'>Start Recording</span>
          </>
        )}
      </div>
    </div>
  );
}
