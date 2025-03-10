import {
  WhisperVerboseJSON,
  WhisperVerboseJSONSchema,
} from './transcribe-verbose-json';

const WHISPER_LANGUAGE = 'en';
const WHISPER_MODEL = 'whisper-1';

export async function transcribeAudio(
  audioBlob: Blob,
  apiKey: string
): Promise<WhisperVerboseJSON> {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', WHISPER_MODEL);
    formData.append('language', WHISPER_LANGUAGE);
    formData.append('response_format', 'verbose_json');

    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData?.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const parsedData = WhisperVerboseJSONSchema.safeParse(data);
    if (!parsedData.success) {
      throw new Error('Failed to parse transcription data');
    }

    console.log('transcription object', parsedData.data);
    return parsedData.data;
  } catch (error) {
    console.error('Error transcribing audio', error);
    throw error;
  }
}
