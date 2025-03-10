import { PasteSegment } from '../hooks/use-paste-segments';
import { WhisperVerboseJSON } from './transcribe-verbose-json';

export function formatTimecode(timeInSeconds: number) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.round(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatPasteSegment(pasteSegment: PasteSegment) {
  const [firstWord, ...rest] = pasteSegment.text.split(' ');
  if (!firstWord) {
    throw new Error('should have at least 1 word');
  }

  if (firstWord.length > 10) {
    return firstWord.slice(0, 10) + '...';
  }

  if (rest.length === 0) {
    return firstWord;
  }

  return `${firstWord}...`;
}

export type Segment =
  | {
      type: 'transcription';
      text: string;
    }
  | {
      type: 'paste';
      text: string;
      timecodeInSeconds: number;
    };

export function mergeTranscriptionAndPasteSegments(
  transcription: WhisperVerboseJSON,
  pasteSegments: PasteSegment[]
): Segment[] {
  const result: Segment[] = [];

  let transcriptionIndex = 0;
  let pasteIndex = 0;

  while (
    transcriptionIndex < transcription.segments.length &&
    pasteIndex < pasteSegments.length
  ) {
    const transcriptionSegment = transcription.segments[transcriptionIndex]!;
    const pasteSegment = pasteSegments[pasteIndex]!;

    if (
      transcriptionSegment.start < Math.floor(pasteSegment.timecodeInSeconds)
    ) {
      const hasPrevious = result.length > 0;
      const previousIsTranscription =
        result[result.length - 1]?.type === 'transcription';

      if (hasPrevious && previousIsTranscription) {
        result[result.length - 1]!.text += ` ${transcriptionSegment.text}`;
      } else {
        result.push({
          type: 'transcription',
          text: transcriptionSegment.text,
        });
      }
      transcriptionIndex++;
    } else {
      result.push({
        type: 'paste',
        text: pasteSegment.text,
        timecodeInSeconds: pasteSegment.timecodeInSeconds,
      });
      pasteIndex++;
    }
  }

  while (transcriptionIndex < transcription.segments.length) {
    const hasPrevious = result.length > 0;
    const previousIsTranscription =
      result[result.length - 1]?.type === 'transcription';

    if (hasPrevious && previousIsTranscription) {
      result[result.length - 1]!.text +=
        ` ${transcription.segments[transcriptionIndex]!.text}`;
    } else {
      result.push({
        type: 'transcription',
        text: transcription.segments[transcriptionIndex]!.text,
      });
    }
    transcriptionIndex++;
  }

  while (pasteIndex < pasteSegments.length) {
    result.push({
      type: 'paste',
      text: pasteSegments[pasteIndex]!.text,
      timecodeInSeconds: pasteSegments[pasteIndex]!.timecodeInSeconds,
    });
    pasteIndex++;
  }

  return result;
}

export function formatTranscriptionWithPasteSegments(
  transcription: WhisperVerboseJSON,
  pasteSegments: PasteSegment[]
) {
  if (pasteSegments.length === 0) {
    return [
      {
        type: 'transcription',
        text: transcription.text,
      },
    ];
  }

  return mergeTranscriptionAndPasteSegments(transcription, pasteSegments);
}
