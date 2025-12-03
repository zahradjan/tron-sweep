import { HighScoreBadge } from "./HighScoreBadge";

export interface HighScore {
  badge: HighScoreBadge;
  multiplier: number;
  range: { min: number; max: number };
}
