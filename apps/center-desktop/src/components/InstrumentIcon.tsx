type InstrumentIconProps = {
  readonly iconKey: string;
  readonly size?: number;
};

const glyphs: Readonly<Record<string, readonly string[]>> = {
  brass: [
    "00111000",
    "01111100",
    "11000110",
    "00001100",
    "00111000",
    "01100000",
    "11000000",
    "00000000",
  ],
  cello: [
    "00011000",
    "00111100",
    "00111100",
    "00011000",
    "00111100",
    "01111110",
    "00111100",
    "00011000",
  ],
  drums: [
    "00000000",
    "01111110",
    "11000011",
    "11111111",
    "11000011",
    "01111110",
    "00100100",
    "01000010",
  ],
  flute: [
    "00000000",
    "11111110",
    "10010010",
    "11111110",
    "00000000",
    "00000000",
    "00000000",
    "00000000",
  ],
  guitar: [
    "00011000",
    "00111100",
    "00111100",
    "00011000",
    "00011000",
    "00011000",
    "00011000",
    "00011000",
  ],
  piano: [
    "11111111",
    "10101011",
    "10101011",
    "10101011",
    "11111111",
    "11011011",
    "11011011",
    "11111111",
  ],
  violin: [
    "00011000",
    "00111100",
    "01111110",
    "00111100",
    "00011000",
    "00111100",
    "00011000",
    "00011000",
  ],
};

const fallbackGlyph = [
  "00011000",
  "00111100",
  "01111110",
  "11011011",
  "00011000",
  "00011000",
  "00000000",
  "00011000",
];

export function InstrumentIcon({ iconKey, size = 20 }: InstrumentIconProps) {
  const glyph = glyphs[iconKey] ?? fallbackGlyph;
  const pixels = glyph.flatMap((row, y) =>
    [...row].flatMap((cell, x) =>
      cell === "1" ? [<rect height="1" key={`${x}-${y}`} width="1" x={x} y={y} />] : [],
    ),
  );

  return (
    <svg
      aria-hidden="true"
      className="instrument-icon"
      height={size}
      shapeRendering="crispEdges"
      viewBox="0 0 8 8"
      width={size}
    >
      {pixels}
    </svg>
  );
}
