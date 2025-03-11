import '@workspace/ui/globals.css';
import '@/assets/main.css';

import { cn } from '@workspace/ui/lib/utils';
import { PasteSegmentBadges } from '../../components/paste-segment-badges';
import { RecorderContainer } from '../../components/recorder-container';
import { TranscribedTextCard } from '../../components/transcribed-text-card';
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
import { fillTextareaAndSendMessage } from '../../lib/autofill';
import {
  formatTranscriptionWithPasteSegments,
  transcriptionToInputPrompt,
} from '../../lib/format';

export default function WhispPanelApp() {
  const {
    isOpen: isRecorderUiOpen,
    isOpenRef: isRecorderUiOpenRef,
    setIsOpen: setIsRecorderUiOpen,
  } = useToggleRecorderUi();

  const [
    isCopyToClipboardPressedBeforehand,
    setIsCopyToClipboardPressedBeforehand,
  ] = useState(false);
  const {
    transcription,
    handleTranscription,
    isTranscribing,
    resetTranscription,
  } = useTranscription({});

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
    [isRecorderUiOpenRef, handleTranscription]
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
    setIsCopyToClipboardPressedBeforehand(false);
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
      setTimecode(null);
      timecodeRef.current = null;
      startRecording();
    } else {
      stopRecordingAndReset();
    }
  }, [isRecorderUiOpen]);

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
      setIsCopyToClipboardPressedBeforehand((prev) => !prev);
      return;
    }

    copyToClipboard(
      transcribedText
        .map((segment) =>
          segment.type === 'paste'
            ? `<pasted-text>\n${segment.text}\n</pasted-text>`
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

  useEffect(() => {
    if (transcription && isCopyToClipboardPressedBeforehand) {
      const prompt = transcriptionToInputPrompt(transcription, pasteSegments);
      fillTextareaAndSendMessage(prompt).then((result) => {
        if (result.success) {
          setIsRecorderUiOpen(false);
        } else {
          console.error(result.error);
        }
      });
    }
  }, [
    isCopyToClipboardPressedBeforehand,
    handleCopyToClipboard,
    transcription,
    pasteSegments,
  ]);

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

      {transcribedText && (
        <TranscribedTextCard transcribedText={transcribedText} />
      )}

      <div
        className='zoom-in-bouncy flex flex-col justify-center items-center gap-[.75em] rounded-[1em] w-[24em] h-max bg-background px-[1em] py-[.75em] border border-solid border-muted-foreground/20'
        // for some reason tailwind's shadow class just doesn't work
        // I have no clue why
        // so we're just applying the shadow-2xl styling directly
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        <PasteSegmentBadges
          pasteOnCompleteBadge={isCopyToClipboardPressedBeforehand}
          pasteSegments={pasteSegments}
          onRemovePasteSegment={removePasteSegment}
        />

        <RecorderContainer
          state={
            isTranscribing
              ? 'transcribing'
              : transcription?.text
                ? 'transcribed'
                : 'recording'
          }
          isRecording={isRecording}
          stopRecording={stopRecording}
          audioData={audioData}
          timecode={timecode}
        />
      </div>
    </div>
  );
}
