import { Badge } from '@workspace/ui/components/badge';
import { ClipboardPaste, XIcon } from 'lucide-react';
import { PasteSegment } from '../hooks/use-paste-segments';
import { formatPasteSegment, formatTimecode } from '../lib/format';

type PasteSegmentBadgesProps = {
  pasteSegments: PasteSegment[];
  onRemovePasteSegment: (timecodeInSeconds: number, text: string) => void;
  pasteOnCompleteBadge: boolean;
};

export function PasteSegmentBadges({
  pasteSegments,
  onRemovePasteSegment: removePasteSegment,
  pasteOnCompleteBadge,
}: PasteSegmentBadgesProps) {
  if (!pasteOnCompleteBadge && pasteSegments.length === 0) {
    return null;
  }

  return (
    <div className='w-full flex gap-[.25em] flex-wrap h-full'>
      {pasteOnCompleteBadge && (
        <Badge variant='outline' className='zoom-in-bouncy'>
          <ClipboardPaste className='' />
          <span>Paste on complete</span>
        </Badge>
      )}

      {pasteSegments.map((pasteSegment) => (
        <Badge
          variant='outline'
          className='zoom-in-bouncy'
          key={pasteSegment.timecodeInSeconds + pasteSegment.text}
        >
          <span className='text-muted-foreground'>
            {`${formatTimecode(pasteSegment.timecodeInSeconds)}`}
          </span>
          {formatPasteSegment(pasteSegment)}
          <span
            className='text-muted-foreground px-[.25em] cursor-pointer'
            onClick={() =>
              removePasteSegment(
                pasteSegment.timecodeInSeconds,
                pasteSegment.text
              )
            }
          >
            <XIcon className='size-[.8em]' />
          </span>
        </Badge>
      ))}
    </div>
  );
}
