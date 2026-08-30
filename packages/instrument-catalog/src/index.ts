export type InstrumentFamily = "BRASS" | "KEYS" | "PERCUSSION" | "STRINGS" | "WIND";

export type InstrumentDefinition = {
  readonly colorHex: `#${string}`;
  readonly displayName: string;
  readonly family: InstrumentFamily;
  readonly iconKey: string;
  readonly id: string;
};

export const instrumentCatalog = [
  { id: "piano", displayName: "Piyano", family: "KEYS", colorHex: "#38A9FF", iconKey: "piano" },
  { id: "cello", displayName: "Cello", family: "STRINGS", colorHex: "#9B6537", iconKey: "cello" },
  {
    id: "violin",
    displayName: "Violin",
    family: "STRINGS",
    colorHex: "#E58A3A",
    iconKey: "violin",
  },
  { id: "guitar", displayName: "Gitar", family: "STRINGS", colorHex: "#52BD66", iconKey: "guitar" },
  {
    id: "drums",
    displayName: "Bateri",
    family: "PERCUSSION",
    colorHex: "#E6534A",
    iconKey: "drums",
  },
  { id: "brass", displayName: "Brass", family: "BRASS", colorHex: "#F3C84B", iconKey: "brass" },
  { id: "flute", displayName: "Flute", family: "WIND", colorHex: "#6FDDD3", iconKey: "flute" },
] as const satisfies readonly InstrumentDefinition[];
