import { useEffect, useState } from 'react';

export type PasteSegment = {
  timecodeInSeconds: number;
  text: string;
};

type UsePasteSegmentsReturn = {
  pasteSegments: PasteSegment[];
};

type UsePasteSegmentsArgs = {
  /** Set whether the usePasteSegments hook is active */
  active: boolean;
  /** Function provided by the parent to get the current timecode of the paste segment */
  getCurrentTimecode: () => number;
};

// We want to detect points where the user is pasting text,
// and record the timecode of the paste.
export function usePasteSegments({
  active,
  getCurrentTimecode,
}: UsePasteSegmentsArgs): UsePasteSegmentsReturn {
  const [pasteSegments, setPasteSegments] = useState<PasteSegment[]>([]);

  // Reset when the hook is deactivated
  useEffect(() => {
    if (!active) {
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

  return { pasteSegments };
}
