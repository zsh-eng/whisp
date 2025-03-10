export type SubtitleTime = {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

export type Subtitle = {
  startTimecode: SubtitleTime;
  endTimecode: SubtitleTime;
  text: string;
};

function parseTimecode(timecode: string): SubtitleTime {
  const timecodeRegex =
    /^(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2}),(?<millisecond>\d{3})$/;
  const match = timecode.match(timecodeRegex);
  if (!match?.groups) {
    throw new Error('Invalid timecode');
  }

  const { hour, minute, second, millisecond } = match.groups;
  if (
    hour === undefined ||
    minute === undefined ||
    second === undefined ||
    millisecond === undefined
  ) {
    throw new Error('Failed to parse timecode with regex');
  }

  const hourNumber = parseInt(hour, 10);
  const minuteNumber = parseInt(minute, 10);
  const secondNumber = parseInt(second, 10);
  const millisecondNumber = parseInt(millisecond, 10);

  if (
    isNaN(hourNumber) ||
    isNaN(minuteNumber) ||
    isNaN(secondNumber) ||
    isNaN(millisecondNumber)
  ) {
    throw new Error('Invalid number');
  }

  return {
    hour: hourNumber,
    minute: minuteNumber,
    second: secondNumber,
    millisecond: millisecondNumber,
  };
}

function blockToSubtitle(block: string): Subtitle {
  const regex =
    /^(?<index>\d+)\n(?<start>\d{2}:\d{2}:\d{2},\d{3}) --> (?<end>\d{2}:\d{2}:\d{2},\d{3})\n(?<text>[\s\S]+)$/;

  const match = block.match(regex);
  if (!match?.groups) {
    throw new Error('Invalid subtitle block format');
  }

  const { start, end, text } = match.groups;
  if (start === undefined || end === undefined || text === undefined) {
    throw new Error('Invalid subtitle block format');
  }

  return {
    startTimecode: parseTimecode(start),
    endTimecode: parseTimecode(end),
    text: text.trim(),
  };
}

export function parseSubtitles(text: string): Subtitle[] {
  const blocks = text.split('\n\n');

  if (blocks.length === 0) {
    return [];
  }

  return blocks.map(blockToSubtitle);
}
