export const DEFAULTS = {
  ACTIVE_INTERVAL_MINUTES: 25,
  IDLE_THRESHOLD_SECONDS: 180,
  ACHIEVEMENT_DISPLAY_DURATION_MS: 10000,
} as const;

export const STORAGE_KEYS = {
  ACTIVE_STATE: "time-awareness-active-state",
  CONFETTI_ENABLED: "time-awareness-confetti-enabled",
} as const;

export const ICONS = {
  IDLE_HEART: "🩶",
} as const;
