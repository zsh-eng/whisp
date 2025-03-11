import { useEffect, useRef, useState } from 'react';

/**
 * Handles the visibilty of the recorder UI.
 */
export function useToggleRecorderUi() {
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(isOpen);

  // Keep the ref in sync with the state
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const listener = (message: { action: string }) => {
      if (message.action === 'start-recording') {
        setIsOpen((open) => !open);
      }
    };

    browser.runtime.onMessage.addListener(listener);
    return () => {
      browser.runtime.onMessage.removeListener(listener);
    };
  }, []);

  return { isOpen, setIsOpen, isOpenRef };
}

/**
 * Handles the stopping of the recording.
 * Default shortcut is `Cmd + Shift + S`.
 */
export function useStopRecordingShortcut({
  onStopRecording,
}: {
  onStopRecording: () => void;
}) {
  useEffect(() => {
    const listener = (ev: KeyboardEvent) => {
      if (ev.key === 'a' && ev.metaKey && ev.shiftKey) {
        onStopRecording();
      }
    };

    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [onStopRecording]);
}
