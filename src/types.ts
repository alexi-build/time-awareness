export interface ActiveState {
  accumulatedActiveSeconds: number;
  lastCheckTime: number;
  sessionCount: number;
  isIdle: boolean;
  shouldNotify: boolean;
  achievementTimestamp?: number;
}
