import { CellType } from "../model/CellType";
import { HighScoreBadge } from "../model/HighScoreBadge";

export const config = {
  grid: {
    rows: 4,
    cols: 4,
    cellSize: 125,
  },
  sweepCost: 1000,
  defaultBalance: 2000,
  highScores: [
    {
      badge: HighScoreBadge.Double,
      multiplier: 2,
      range: { min: 10, max: 15 },
    },
    {
      badge: HighScoreBadge.Triple,
      multiplier: 3,
      range: { min: 15, max: 20 },
    },
    {
      badge: HighScoreBadge.Mega,
      multiplier: 4,
      range: { min: 20, max: Infinity },
    },
  ],
  cellRewards: {
    [CellType.Program]: 100,
    [CellType.User]: 200,
    [CellType.Clue]: 500,
    [CellType.Flynn]: 1000,
  },
};
