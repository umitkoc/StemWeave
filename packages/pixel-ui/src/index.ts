export const pixelTheme = {
  borderWidthPx: 2,
  colors: {
    canvas: "#f4f0df",
    focus: "#ffe66d",
    ink: "#171717",
    panel: "#fffdf5",
    panelMuted: "#d9d4c2",
    shadow: "#171717",
  },
  fontFamily: 'Consolas, "Courier New", monospace',
  name: "colorful-pixel",
  radiusPx: 0,
  unitPx: 4,
} as const;

export type PixelTheme = typeof pixelTheme;

export function pixelCssVariables(
  theme: PixelTheme = pixelTheme,
): Readonly<Record<string, string>> {
  return {
    "--sw-border": `${theme.borderWidthPx}px`,
    "--sw-canvas": theme.colors.canvas,
    "--sw-focus": theme.colors.focus,
    "--sw-font": theme.fontFamily,
    "--sw-ink": theme.colors.ink,
    "--sw-panel": theme.colors.panel,
    "--sw-panel-muted": theme.colors.panelMuted,
    "--sw-shadow": theme.colors.shadow,
    "--sw-unit": `${theme.unitPx}px`,
  };
}

export const pixelUiWorkspace = {
  fontFamily: pixelTheme.fontFamily,
  theme: pixelTheme.name,
  phase: "design-tokens",
} as const;
