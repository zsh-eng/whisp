import { Badge } from '@workspace/ui/components/badge';
import { Segment } from '../lib/format';

type TranscribedTextCardProps = {
  transcribedText: Segment[];
};

export function TranscribedTextCard({
  transcribedText,
}: TranscribedTextCardProps) {
  return (
    <div
      className='animate-in zoom-in px-[1em] py-[1em] rounded-[1em] w-[36em] h-max bg-background border border-solid border-muted-foreground/20 text-[.875em] font-medium text-muted-foreground max-h-[16em] overflow-y-auto'
      style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
    >
      {transcribedText?.map((segment, i) => {
        if (segment.type === 'transcription') {
          return <div key={`transcription-${i}`}>{segment.text}</div>;
        }

        return (
          <div
            key={`paste-${i}`}
            className='bg-muted rounded-[.5em] px-[.5em] py-[.5em] my-[.5em]'
          >
            <Badge variant='outline' className='text-[.875em] mb-[.25em]'>
              <span>Pasted</span>
            </Badge>
            <span className='line-clamp-2 px-[.5em]'>{segment.text}</span>
          </div>
        );
      })}
    </div>
  );
}
