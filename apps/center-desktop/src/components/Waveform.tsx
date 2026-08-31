type WaveformProps = {
  readonly seed: string;
};

function heightFor(seed: string, index: number): number {
  const code = seed.charCodeAt(index % seed.length) || 17;
  return 3 + ((code * (index + 5)) % 14);
}

export function Waveform({ seed }: WaveformProps) {
  return (
    <svg aria-hidden="true" className="waveform" preserveAspectRatio="none" viewBox="0 0 96 20">
      {Array.from({ length: 32 }, (_, index) => {
        const height = heightFor(seed, index);
        return (
          <rect
            height={height}
            key={index}
            shapeRendering="crispEdges"
            width="2"
            x={index * 3}
            y={(20 - height) / 2}
          />
        );
      })}
    </svg>
  );
}
