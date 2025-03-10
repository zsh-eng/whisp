import { z } from 'zod';

export const WhisperSegmentSchema = z.object({
  id: z.number(),
  seek: z.number(),
  start: z.number(),
  end: z.number(),
  text: z.string(),
  tokens: z.array(z.number()),
  temperature: z.number(),
  avg_logprob: z.number(),
  compression_ratio: z.number(),
  no_speech_prob: z.number(),
});

export const WhisperVerboseJSONSchema = z.object({
  task: z.string(),
  language: z.string(),
  duration: z.number(),
  text: z.string(),
  segments: z.array(WhisperSegmentSchema),
});

export type WhisperSegment = z.infer<typeof WhisperSegmentSchema>;
export type WhisperVerboseJSON = z.infer<typeof WhisperVerboseJSONSchema>;
