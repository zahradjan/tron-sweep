import { creationEngine } from "../getCreationEngine";
import { ScorePopup } from "../popups/ScorePopup";
import { BalanceDisplay } from "../screens/main/BalanceDisplay";
import { CellType } from "../screens/main/Cell";
import { Grid } from "../screens/main/Grid";

export enum HighScoreBadge {
  Double = "double",
  Triple = "triple",
  Mega = "mega",
}

interface WinningResult {
  won: boolean;
  winningCells: WinningCell[];
}

interface WinningCell {
  type: CellType;
  count: number;
}

export class GameEngine {
  private win: number = 0;
  private balance: number = 800;
  private readonly SWEEP_COST = 100;
  private gameOver: boolean = false;
  private grid!: Grid;
  private balanceDisplay!: BalanceDisplay;

  constructor() {}

  public init(grid: Grid, balanceDisplay: BalanceDisplay) {
    this.grid = grid;
    this.balanceDisplay = balanceDisplay;
    this.balanceDisplay.setBalance(this.balance);
    this.balanceDisplay.setSweepCost(this.SWEEP_COST);
    this.balanceDisplay.setWinValue(0);
  }

  public checkWinningCells(): WinningResult {
    const revealedCells = this.grid
      .getCells()
      .filter((cell) => cell.getIsRevealed());

    const typeCounts = new Map<CellType, number>();

    for (const cell of revealedCells) {
      const type = cell.getType();
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    }
    const winningCells: WinningCell[] = [];
    for (const [type, count] of typeCounts.entries()) {
      if (count >= 3) {
        winningCells.push({ type, count });
      }
    }

    return { won: winningCells.length > 0, winningCells };
  }
  public async countWinScore(winningResult: WinningResult) {
    if (winningResult.won) {
      let totalPrize = 0;
      const badgeCounts: Record<HighScoreBadge, number> = {
        [HighScoreBadge.Double]: 2,
        [HighScoreBadge.Triple]: 3,
        [HighScoreBadge.Mega]: 1,
      };
      for (const win of winningResult.winningCells) {
        let basePrize = 0;
        switch (win.type) {
          case CellType.Program:
            basePrize = 200;
            break;
          case CellType.User:
            basePrize = 500;
            break;
          case CellType.Clue:
            basePrize = 1000;
            break;
          case CellType.Flynn:
            basePrize = 1500;
            break;
          default:
            basePrize = 0;
        }
        const multiplier = win.count - 2;
        const highScoreBadge = this.getHighScoreBadge(win.count);
        if (highScoreBadge) {
          badgeCounts[highScoreBadge]++;
        }

        const prize = basePrize * multiplier;
        totalPrize += prize;
      }

      await this.showHighScoreBadge(badgeCounts);
      this.win += totalPrize;
      console.log("Win: ", this.win);
      this.balanceDisplay.setWinValue(this.win);
    }
  }

  public async showHighScoreBadge(
    highScoreBadge: Record<HighScoreBadge, number>
  ) {
    for (const badge of Object.values(HighScoreBadge)) {
      const count = highScoreBadge[badge];
      if (count > 0) {
        await creationEngine().navigation.presentPopup(ScorePopup, {
          badge,
          count,
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await creationEngine().navigation.dismissPopup();
        console.log(`${badge}! x${count}`);
      }
    }
  }

  public async revealCells() {
    const availableCells = this.grid
      .getCells()
      .filter((cell) => !cell.getIsRevealed());

    if (!availableCells.length) {
      console.log("All cells already revealed!");
      return [];
    }
    // const numToReveal = randomInt(1, availableCells.length);
    // const cellsToReveal = availableCells.slice(
    //   0,
    //   Math.min(numToReveal, availableCells.length)
    // );

    for (const cell of availableCells) {
      await cell.reveal();
    }
  }

  public setWinningCells(winningCellsMap: WinningResult) {
    const winningTypes = winningCellsMap.winningCells.map((win) => win.type);
    const revealedCells = this.grid.getRevealedCells();
    for (const cell of revealedCells) {
      if (winningTypes.includes(cell.getType())) {
        cell.setIsWinning(true);
      } else {
        cell.setIsWinning(false);
      }
    }
  }

  public hasEnoughBalance() {
    if (this.balance < this.SWEEP_COST) {
      console.log("Not enough balance!");
      this.gameOver = true;
      return false;
    }
    return true;
  }

  public subtractSweepCost() {
    this.balance -= this.SWEEP_COST;
    this.balanceDisplay.setBalance(this.balance);
  }

  public getIsGameOver() {
    return this.gameOver;
  }

  private getHighScoreBadge(count: number): HighScoreBadge | null {
    if (count >= 6 && count < 9) {
      return HighScoreBadge.Double;
    } else if (count >= 9 && count < 12) {
      return HighScoreBadge.Triple;
    } else if (count >= 12) {
      return HighScoreBadge.Mega;
    }
    return null;
  }
}
