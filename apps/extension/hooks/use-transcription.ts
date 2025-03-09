import { transcribeAudio } from '../lib/transcription';

type UseTranscriptionReturn = {
  transcriptionText: string | null;
  isTranscribing: boolean;
  error: string | null;
  handleTranscription: (audioBlob: Blob) => Promise<void>;
  resetTranscription: () => void;
};

export function useTranscription(): UseTranscriptionReturn {
  const [transcriptionText, setTranscriptionText] = useState<string | null>(
    null
  );
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscription = useCallback(async (audioBlob: Blob) => {
    try {
      setTranscriptionText(null);
      setError(null);
      setIsTranscribing(true);

      const text = await transcribeAudio(
        audioBlob,
        import.meta.env.VITE_PUBLIC_API_KEY
      );
      setTranscriptionText(text);
    } catch (error) {
      setError(error as string);
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const resetTranscription = useCallback(() => {
    setTranscriptionText(null);
    setError(null);
    setIsTranscribing(false);
  }, []);

  return {
    transcriptionText,
    isTranscribing,
    error,
    handleTranscription,
    resetTranscription,
  };
}
