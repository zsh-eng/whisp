import { useCallback, useRef, useState } from 'react';

interface UseAudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onDataAvailable?: (audioData: Float32Array, timecode: number) => void;
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  audioData: Float32Array | null;
  recordingTime: number;
  error: string | null;
}

/**
 * Handles the recording of audio from the microphone.
 */
export function useAudioRecorder({
  onRecordingComplete,
  onDataAvailable,
}: UseAudioRecorderProps = {}): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const firstChunkTimecodeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      audioChunksRef.current = [];
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up AudioContext and Analyser for waveform data
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Set up MediaRecorder for recording
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);

          // https://developer.mozilla.org/en-US/docs/Web/API/BlobEvent/timecode
          // First timecode need not be zero, so we must capture it.
          if (firstChunkTimecodeRef.current === null) {
            firstChunkTimecodeRef.current = event.timecode;
          }

          if (analyserRef.current && onDataAvailable) {
            const relativeTimecode =
              event.timecode - firstChunkTimecodeRef.current;

            setRecordingTime(relativeTimecode);
            const dataArray = new Float32Array(
              analyserRef.current.frequencyBinCount
            );
            analyserRef.current.getFloatTimeDomainData(dataArray);
            setAudioData(dataArray);
            onDataAvailable(dataArray, relativeTimecode);
          }
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        });

        firstChunkTimecodeRef.current = null;
        setRecordingTime(0);
        setIsRecording(false);

        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }

        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      const timeBetweenCallbacksMs = 10;
      // Start recording
      mediaRecorderRef.current.start(timeBetweenCallbacksMs);
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(
        'Failed to start recording. Please check microphone permissions.'
      );
    }
  }, [onRecordingComplete, onDataAvailable]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
      // Stop all tracks on the stream
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (
        audioContextRef.current &&
        audioContextRef.current.state === 'running'
      ) {
        audioContextRef.current.close();
      }
    }
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioData,
    recordingTime,
    error,
  };
}
