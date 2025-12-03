import { WinningCell } from "./WinningCell";

export interface WinningResult {
  won: boolean;
  winningCells: WinningCell[];
}
