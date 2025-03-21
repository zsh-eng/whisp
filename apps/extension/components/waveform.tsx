import { useEffect, useRef } from 'react';

interface WaveformProps {
  audioData: Float32Array | null;
  isRecording: boolean;
  /**
   * The timecode of the audio data that's coming in.
   */
  timecode: number | null;
}

type Amplitude = {
  value: number;
  timecode: number;
};

export function Waveform({ audioData, isRecording, timecode }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWidth = 800;
  const canvasHeight = 80;

  // Store amplitude values with their timecodes
  const amplitudesRef = useRef<Amplitude[]>([]);
  // Add animation frame reference
  const animationFrameRef = useRef<number | null>(null);

  const firstTimestampRef = useRef<number | null>(null);

  /**
   * The size of each time slice in milliseconds.
   * This number is separate from the speed at which the waveform is moving to the left.
   */
  const speedPixelsPerMs = 0.3;

  useEffect(() => {
    if (!isRecording) {
      amplitudesRef.current = [];
      firstTimestampRef.current = null;
      return;
    }

    if (!canvasRef.current || !audioData) return;

    // Process new audio data
    if (isRecording && audioData && timecode !== null) {
      // Calculate amplitude for this audio data snapshot
      const amplitude =
        audioData.reduce((sum, val) => sum + Math.abs(val), 0) /
        audioData.length;

      // Add to our amplitudes array with its timecode
      amplitudesRef.current.push({ value: amplitude, timecode });
    }

    // Create a render function that will be called by requestAnimationFrame
    const renderWaveform = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (amplitudesRef.current.length === 0) {
        return;
      }

      // We don't know what the first timestamp number is, because
      // it depends on the page load and not the audio recording starting.
      // As such, we store the first timestamp when audio comes in and use that to calculate
      // the relative timestamp for our animation frame.
      if (firstTimestampRef.current === null) {
        firstTimestampRef.current = timestamp;
      }
      const firstAmplitudeTimestamp = amplitudesRef.current[0]?.timecode ?? 0;

      // In addition, we want to align the vertical line based on the first amplitude timestamp
      // this is because there is some delay between the audio timecode and the render
      // so there will be a gap between the vertical line and the waveform
      // By accounting for the first amplitude timestamp, we can align the vertical line
      // to the waveform.
      const relativeTimestamp =
        timestamp - (firstTimestampRef.current ?? 0) + firstAmplitudeTimestamp;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background grid
      const mutedColor = 'oklch(0.97 0 0)';
      ctx.strokeStyle = mutedColor;
      ctx.lineWidth = 1;

      const centerY = canvas.height / 2;

      // Draw the waveform
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      // Have a redline at the end of the waveform
      const currentEndOfWaveform = Math.round(
        Math.min(relativeTimestamp * speedPixelsPerMs, canvas.width - 10)
      );

      ctx.beginPath();
      ctx.strokeStyle = 'oklch(0.715 0.143 215.221)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      const redLineX = currentEndOfWaveform + 6;
      ctx.moveTo(redLineX, 4);
      ctx.lineTo(redLineX, canvas.height - 4);
      ctx.stroke();

      ctx.beginPath();
      // Draw with different colors based on recording state
      ctx.strokeStyle = isRecording ? 'black' : mutedColor;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      for (let i = amplitudesRef.current.length - 1; i >= 0; i--) {
        const amplitude = amplitudesRef.current[i];
        if (!amplitude) continue;

        const roundedTimecode = Math.round(amplitude.timecode / 10) * 10;

        const x = Math.round(
          currentEndOfWaveform -
            (relativeTimestamp - roundedTimecode) * speedPixelsPerMs
        );

        if (x < 6) {
          break; // terminate early if we've moved too far left
        }

        // Have a minimum height of the rectangle to look nicer
        // Recall that the "top" of the line is < centerY and closer to 0
        // The "bottom" of the line is > centerY and closer to canvas.height
        const clampedTopOfLine = Math.max(
          8,
          Math.min(centerY - 4, centerY - amplitude.value * canvas.height * 5)
        );
        const clampedBottomOfLine = Math.min(
          Math.max(centerY + 4, centerY + amplitude.value * canvas.height * 5),
          canvas.height - 8
        );
        ctx.moveTo(x, clampedTopOfLine);
        ctx.lineTo(x, clampedBottomOfLine);
      }

      ctx.stroke();

      // Request the next frame
      animationFrameRef.current = requestAnimationFrame(renderWaveform);
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(renderWaveform);

    // Clean up function to cancel animation frame when component unmounts or dependencies change
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioData, isRecording, timecode]);

  return (
    <div className='w-full h-full'>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className='w-full'
      />
    </div>
  );
}
