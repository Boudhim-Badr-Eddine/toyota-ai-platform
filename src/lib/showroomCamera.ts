/** Showroom camera & panel layout for the configurator. */

export const CONFIG_PANEL = {
  maxWidthPx: 420,
  minWidthPx: 340,
  vwFraction: 0.36,
  marginPx: 16,
  gapPx: 24,
  desktopBreakpoint: 1024,
} as const;

/** Tailwind / CSS — width reserved on the right by the floating panel + margins. */
export const CONFIG_PANEL_INSET_CSS = `calc(max(${CONFIG_PANEL.minWidthPx}px, min(${CONFIG_PANEL.maxWidthPx}px, ${CONFIG_PANEL.vwFraction * 100}vw)) + ${CONFIG_PANEL.marginPx * 2 + CONFIG_PANEL.gapPx}px)`;

export const SHOWROOM = {
  lookAtY: 0.82,
  defaultAzimuth: Math.PI * 0.22,
  defaultPolar: Math.PI * 0.38,
  exterior: {
    minDistance: 1.6,
    maxDistance: 12,
    minPolar: 0.22,
    maxPolar: Math.PI / 2.05,
    fov: 34,
  },
  interior: {
    minDistance: 0.2,
    maxDistance: 2.8,
    fov: 68,
    cameraPos: [0, 0.92, 0.38] as const,
  },
  boundsMargin: 1.12,
  autoRotateSpeed: 0.35,
  dampingFactor: 0.055,
  rotateSpeed: 0.75,
  panSpeed: 0.55,
} as const;

/** CSS `right` inset so UI stays left of the floating panel (desktop). */
export function getPanelRightInsetCss(): string {
  return CONFIG_PANEL_INSET_CSS;
}
