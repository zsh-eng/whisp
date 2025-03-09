export async function transcribeAudio(
  audioBlob: Blob,
  apiKey: string
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');

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
    console.log('transcription data', data.text);
    return data.text || 'No speech detected';
  } catch (error) {
    console.error('Error transcribing audio', error);
    throw error;
  }
}
