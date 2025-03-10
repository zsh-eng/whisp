import '@workspace/ui/globals.css';
import '~/assets/public.css';

import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import {
  CircleCheck,
  ClipboardList,
  Loader2,
  MicIcon,
  XIcon,
} from 'lucide-react';
import { useAudioRecorder } from '../../hooks/use-audio-recorder';
import {
  useCopyToClipboard,
  useCopyToClipboardShortcut,
} from '../../hooks/use-insert-at-cursor';
import { usePasteSegments } from '../../hooks/use-paste-segments';
import {
  useStopRecordingShortcut,
  useToggleRecorderUi,
} from '../../hooks/use-toggle-recorder';
import { useTranscription } from '../../hooks/use-transcription';
import {
  formatPasteSegment,
  formatTimecode,
  formatTranscriptionWithPasteSegments,
} from '../../lib/format';

export default function WhispPanelApp() {
  const {
    isOpen: isRecorderUiOpen,
    isOpenRef: isRecorderUiOpenRef,
    setIsOpen: setIsRecorderUiOpen,
  } = useToggleRecorderUi();

  const {
    transcription,
    handleTranscription,
    isTranscribing,
    resetTranscription,
  } = useTranscription();

  // AUDIO RECORDING
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [timecode, setTimecode] = useState<number | null>(null);
  /**
   * Reference to the current timecode - used for the paste segments hook to
   * get the latest timecode.
   */
  const timecodeRef = useRef<number | null>(null);
  /** Receives the audio data from the audio recorder. */
  const handleAudioDataAvailable = useCallback(
    (data: Float32Array, timecode: number) => {
      setAudioData(data);
      setTimecode(timecode);
      timecodeRef.current = timecode;
    },
    []
  );
  /** Handles the completion of a recording. */
  const handleAudioRecordingComplete = useCallback(
    async (audioBlob: Blob) => {
      if (!isRecorderUiOpenRef.current) {
        return;
      }

      await handleTranscription(audioBlob);
    },
    [isRecorderUiOpenRef]
  );
  const {
    isRecording,
    startRecording,
    stopRecording,
    error: recordingError,
  } = useAudioRecorder({
    onDataAvailable: handleAudioDataAvailable,
    onRecordingComplete: handleAudioRecordingComplete,
  });

  // Cleanup function when we want to completely reset the audio recording state
  // for example, when the UI is closed and re-opened
  const stopRecordingAndReset = useCallback(() => {
    stopRecording();
    resetTranscription();
    setAudioData(null);
    setTimecode(null);
    timecodeRef.current = null;
  }, []);
  // Keyboard shortcut to stop the recording
  useStopRecordingShortcut({
    onStopRecording: () => {
      stopRecording();
    },
  });

  // Automatically start recording when the UI is opened
  // and reset the state completely when the UI is closed.
  useEffect(() => {
    if (isRecorderUiOpen) {
      startRecording();
    } else {
      stopRecordingAndReset();
    }
  }, [isRecorderUiOpen]);

  const numMinutes = timecode ? Math.floor(timecode / 60 / 1000) : 0;
  const numSeconds =
    `${timecode ? Math.floor((timecode % 60000) / 1000) : 0}`.padStart(2, '0');

  const { copyToClipboard } = useCopyToClipboard();
  const { pasteSegments, removePasteSegment } = usePasteSegments({
    active: isRecording,
    getCurrentTimecode: () => timecodeRef.current ?? 0,
  });

  const transcribedText = transcription
    ? formatTranscriptionWithPasteSegments(transcription, pasteSegments)
    : null;
  const handleCopyToClipboard = useCallback(() => {
    if (!transcribedText) {
      return;
    }

    copyToClipboard(
      transcribedText
        .map((segment) =>
          segment.type === 'paste'
            ? `<pasted-text>${segment.text}</pasted-text>`
            : segment.text
        )
        .join('\n\n')
    );

    // Close after copying to clipboard
    setIsRecorderUiOpen(false);
  }, [copyToClipboard, transcribedText, setIsRecorderUiOpen]);
  useCopyToClipboardShortcut({
    onCopyToClipboard: handleCopyToClipboard,
  });

  return (
    <div
      className={cn(
        'fixed bottom-[2em] left-1/2 -translate-x-1/2 translate-y-0 flex flex-col items-center gap-[.75em]',
        isRecorderUiOpen ? '' : 'hidden'
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
        <div className='animate-in zoom-in px-[1em] py-[1em] rounded-[1em] w-[32em] h-max bg-background border border-solid border-muted-foreground/20 text-[.875em] font-medium text-muted-foreground'>
          {transcribedText?.map((segment, i) => {
            if (segment.type === 'transcription') {
              return <div key={`transcription-${i}`}>{segment.text}</div>;
            }

            return (
              <div
                key={`paste-${i}`}
                className='bg-muted rounded-[.5em] px-[.5em] py-[.5em] my-[.5em]'
              >
                <Badge variant='outline' className='text-[.875em] mb-[.25em]'>
                  <span>Pasted</span>
                </Badge>
                <span className='line-clamp-2 px-[.5em]'>{segment.text}</span>
              </div>
            );
          })}
        </div>
      )}
      <div className='zoom-in-bouncy flex flex-col justify-center items-center gap-[.75em] rounded-[1em] w-[24em] h-max bg-background px-[1em] py-[.75em] shadow-xl border border-solid border-muted-foreground/20'>
        <div className='w-full flex gap-[.25em] flex-wrap h-full'>
          {pasteSegments.length === 0 && (
            <Badge variant='secondary' className=''>
              <ClipboardList className='' />
              <span>Paste text</span>
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
              {formatPasteSegment(pasteSegment)}
              <span
                className='text-muted-foreground px-[.25em]'
                onClick={() =>
                  removePasteSegment(
                    pasteSegment.timecodeInSeconds,
                    pasteSegment.text
                  )
                }
              >
                <XIcon className='size-[.8em]' />
              </span>
            </Badge>
          ))}
        </div>
        <div className='flex items-center gap-[.5em] flex-0'>
          {isTranscribing ? (
            <Loader2 className='size-[1.5em] animate-spin text-cyan-500' />
          ) : transcription?.text ? (
            <CircleCheck className='size-[1.5em] text-cyan-500 zoom-in-bouncy' />
          ) : (
            <MicIcon
              className='size-[1.5em]'
              onClick={() => {
                if (isRecording) {
                  stopRecording();
                }
              }}
            />
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
