import { describe, expect, it } from 'vitest';
import { parseSubtitles } from './subtitle';

const testSubtitles = `1
00:00:20,000 --> 00:00:24,400
In this scene, the protagonist 
enters the abandoned building.

2
00:00:24,600 --> 00:00:27,800
[Door creaking]

3
00:00:30,000 --> 00:00:34,000
Hello? Is anybody here?`;

describe('parseSubtitles', () => {
  it('should parse subtitles', () => {
    const subtitles = parseSubtitles(testSubtitles);

    expect(subtitles).toEqual([
      {
        startTimecode: { hour: 0, minute: 0, second: 20, millisecond: 0 },
        endTimecode: { hour: 0, minute: 0, second: 24, millisecond: 400 },
        text: 'In this scene, the protagonist \nenters the abandoned building.',
      },
      {
        startTimecode: { hour: 0, minute: 0, second: 24, millisecond: 600 },
        endTimecode: { hour: 0, minute: 0, second: 27, millisecond: 800 },
        text: '[Door creaking]',
      },
      {
        startTimecode: { hour: 0, minute: 0, second: 30, millisecond: 0 },
        endTimecode: { hour: 0, minute: 0, second: 34, millisecond: 0 },
        text: 'Hello? Is anybody here?',
      },
    ]);
  });

  it('should throw an error if the subtitle block is invalid', () => {
    expect(() => parseSubtitles('')).toThrow();
  });

  it('should throw an error if the timecode is invalid', () => {
    expect(() =>
         
      parseSubtitles(
        '1\n00:00:20,000 -> 00:00:24,400\nIn this scene, the protagonist \nenters the abandoned building.'
      )
    ).toThrow();
  });
});
