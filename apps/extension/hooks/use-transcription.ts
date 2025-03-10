import { useCallback, useState } from 'react';
import { WhisperVerboseJSON } from '../lib/transcribe-verbose-json';
import { transcribeAudio } from '../lib/transcription';

type UseTranscriptionReturn = {
  transcription: WhisperVerboseJSON | null;
  isTranscribing: boolean;
  error: string | null;
  handleTranscription: (audioBlob: Blob) => Promise<void>;
  resetTranscription: () => void;
};

/**
 * Handles the transcription of audio with OpenAI's Whisper API.
 */
export function useTranscription(): UseTranscriptionReturn {
  const [transcriptionVerboseJson, setTranscriptionVerboseJson] =
    useState<WhisperVerboseJSON | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscription = useCallback(async (audioBlob: Blob) => {
    try {
      setTranscriptionVerboseJson(null);
      setError(null);
      setIsTranscribing(true);

      const data = await transcribeAudio(
        audioBlob,
        import.meta.env.VITE_PUBLIC_API_KEY
      );
      setTranscriptionVerboseJson(data);
    } catch (error) {
      setError(error as string);
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const resetTranscription = useCallback(() => {
    setTranscriptionVerboseJson(null);
    setError(null);
    setIsTranscribing(false);
  }, []);

  return {
    transcription: transcriptionVerboseJson,
    isTranscribing,
    error,
    handleTranscription,
    resetTranscription,
  };
}
