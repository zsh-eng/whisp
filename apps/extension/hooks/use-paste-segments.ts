import { useEffect, useState } from 'react';

export type PasteSegment = {
  timecodeInSeconds: number;
  text: string;
};

type UsePasteSegmentsReturn = {
  pasteSegments: PasteSegment[];
  removePasteSegment: (timecodeInSeconds: number, text: string) => void;
};

type UsePasteSegmentsArgs = {
  /** Set whether the usePasteSegments hook is active */
  active: boolean;
  /** Function provided by the parent to get the current timecode of the paste segment */
  getCurrentTimecode: () => number;
};

/**
 * Detects points where the user is pasting text,
 * and records the timecode of the paste.
 */
export function usePasteSegments({
  active,
  getCurrentTimecode,
}: UsePasteSegmentsArgs): UsePasteSegmentsReturn {
  const [pasteSegments, setPasteSegments] = useState<PasteSegment[]>([]);

  // Reset when the hooks is activated
  useEffect(() => {
    if (active) {
      setPasteSegments([]);
      return;
    }
  }, [active]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const handlePaste = (event: ClipboardEvent) => {
      const timecode = getCurrentTimecode();
      console.log('timecode received is', timecode);
      const text = event.clipboardData?.getData('text');
      if (!text) {
        return;
      }

      const timecodeInSeconds = timecode / 1000;
      setPasteSegments((prev) => [...prev, { timecodeInSeconds, text }]);
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [active]);

  const removePasteSegment = (timecodeInSeconds: number, text: string) => {
    setPasteSegments((prev) =>
      prev.filter(
        (pasteSegment) =>
          pasteSegment.timecodeInSeconds !== timecodeInSeconds ||
          pasteSegment.text !== text
      )
    );
  };

  return { pasteSegments, removePasteSegment };
}
