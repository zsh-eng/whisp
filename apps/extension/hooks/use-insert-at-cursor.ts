import { useCallback, useEffect } from 'react';

export function useCopyToClipboard() {
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  return { copyToClipboard };
}

export function useCopyToClipboardShortcut({
  onCopyToClipboard: onCopyToClipboard,
}: {
  onCopyToClipboard: () => void;
}) {
  useEffect(() => {
    const listener = (ev: KeyboardEvent) => {
      if (ev.key === 'c' && ev.metaKey && ev.shiftKey) {
        onCopyToClipboard();
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [onCopyToClipboard]);
}
