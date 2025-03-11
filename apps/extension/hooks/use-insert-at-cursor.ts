import { useCallback, useEffect } from 'react';

/**
 * Handles the copying of text to the clipboard.
 */
export function useCopyToClipboard() {
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  return { copyToClipboard };
}

/**
 * Handles the shortcut to copy text to the clipboard.
 * Default shortcut is `Cmd + Shift + C`.
 */
export function useCopyToClipboardShortcut({
  onCopyToClipboard: onCopyToClipboard,
}: {
  onCopyToClipboard: () => void;
}) {
  useEffect(() => {
    const listener = (ev: KeyboardEvent) => {
      if (ev.key === 'e' && ev.metaKey && ev.shiftKey) {
        onCopyToClipboard();
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [onCopyToClipboard]);
}
