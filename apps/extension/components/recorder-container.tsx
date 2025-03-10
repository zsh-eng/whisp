import { CircleCheck, Loader2, MicIcon } from 'lucide-react';

type RecorderContainerProps = {
  isRecording: boolean;
  stopRecording: () => void;
  audioData: Float32Array | null;
  timecode: number | null;
  state: 'recording' | 'transcribing' | 'transcribed';
};

/**
 * The container for the recorder.
 */
export function RecorderContainer({
  isRecording,
  stopRecording,
  audioData,
  timecode,
  state,
}: RecorderContainerProps) {
  const numMinutes = timecode ? Math.floor(timecode / 60 / 1000) : 0;
  const numSeconds =
    `${timecode ? Math.floor((timecode % 60000) / 1000) : 0}`.padStart(2, '0');

  const RecorderIcon = () => {
    if (state === 'transcribing') {
      return <Loader2 className='size-[1.5em] animate-spin text-cyan-500' />;
    }

    if (state === 'transcribed') {
      return (
        <CircleCheck className='size-[1.5em] text-cyan-500 zoom-in-bouncy' />
      );
    }

    return (
      <MicIcon
        className='size-[1.5em]'
        onClick={() => {
          if (isRecording) {
            stopRecording();
          }
        }}
      />
    );
  };

  return (
    <div className='flex items-center gap-[.5em] flex-0'>
      <RecorderIcon />

      <Waveform
        audioData={audioData}
        isRecording={isRecording}
        timecode={timecode}
      />

      <div className='text-[.8em] w-max text-center'>
        {numMinutes}:{numSeconds}
      </div>
    </div>
  );
}
