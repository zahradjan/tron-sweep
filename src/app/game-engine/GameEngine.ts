import { pauseAware } from "../../engine/utils/pause";
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

export interface WinningResult {
  won: boolean;
  winningCells: WinningCell[];
}

interface WinningCell {
  type: CellType;
  count: number;
}

export const DEFAULT_BADGE_COUNTS: Record<HighScoreBadge, number> = {
  [HighScoreBadge.Double]: 0,
  [HighScoreBadge.Triple]: 0,
  [HighScoreBadge.Mega]: 0,
};

export class GameEngine {
  private win: number = 0;
  private balance: number = 2000;
  private readonly SWEEP_COST = 1000;
  private gameOver: boolean = false;
  private grid!: Grid;
  private balanceDisplay!: BalanceDisplay;
  private paused = false;
  private pausePromise: Promise<void> | null = null;
  private pauseResolver: (() => void) | null = null;
  private badgeCounts: Record<HighScoreBadge, number> = DEFAULT_BADGE_COUNTS;

  constructor() {}

  public init(grid: Grid, balanceDisplay: BalanceDisplay) {
    this.grid = grid;
    this.balanceDisplay = balanceDisplay;
    this.balanceDisplay.setBalance(this.balance, false, false);
    this.balanceDisplay.setSweepCost(this.SWEEP_COST);
    this.balanceDisplay.setWinValue(0, false);
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
      if (count >= 5) {
        winningCells.push({ type, count });
      }
    }

    const winningResult: WinningResult = {
      won: winningCells.length > 0,
      winningCells,
    };

    return winningResult;
  }
  public async countTotalReward(winningResult: WinningResult) {
    if (winningResult.won) {
      let totalReward = 0;

      for (const winningCell of winningResult.winningCells) {
        let reward = 0;
        switch (winningCell.type) {
          case CellType.Program:
            reward = 100;
            break;
          case CellType.User:
            reward = 200;
            break;
          case CellType.Clue:
            reward = 500;
            break;
          case CellType.Flynn:
            reward = 1000;
            break;
          default:
            reward = 0;
        }
        const multiplier = this.getHighScoreMultiplier(winningCell.count);
        const finalReward = reward * multiplier;
        totalReward += finalReward;
      }

      this.win += totalReward;
      this.balance += this.win;
      console.log("Win: ", this.win);
      await pauseAware<void>(
        () => this.balanceDisplay.setWinValue(this.win),
        this
      );
      await pauseAware<void>(
        () => this.balanceDisplay.setBalance(this.balance, true, true),
        this
      );
      return totalReward;
    }
  }
  public countHighScoreBadges(winningCells: WinningCell[]) {
    for (const winningCell of winningCells) {
      const highScoreBadge = this.getHighScoreBadge(winningCell.count);
      if (highScoreBadge) {
        this.badgeCounts[highScoreBadge]++;
      }
    }
    return this.badgeCounts;
  }

  public async showHighScoreBadges(
    highScoreBadges: Record<HighScoreBadge, number>
  ) {
    for (const badge of Object.values(HighScoreBadge)) {
      const count = highScoreBadges[badge];
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

    for (const cell of availableCells) {
      await pauseAware(() => cell.reveal(), this);
    }
  }

  public async setWinningCells(winningCellsMap: WinningResult) {
    const winningTypes = winningCellsMap.winningCells.map((win) => win.type);
    const revealedCells = this.grid.getRevealedCells();
    const promises = revealedCells.map((cell) => {
      if (winningTypes.includes(cell.getType())) {
        return pauseAware(() => cell.setIsWinning(true), this);
      } else {
        return pauseAware(() => cell.setIsWinning(false), this);
      }
    });

    await Promise.all(promises);
  }

  public async pause() {
    this.paused = true;
    if (!this.pausePromise) {
      this.pausePromise = new Promise((resolve) => {
        this.pauseResolver = resolve;
      });
    }
  }

  public async resume() {
    this.paused = false;
    if (this.pauseResolver) {
      this.pauseResolver();
      this.pauseResolver = null;
      this.pausePromise = null;
    }
  }

  public nextGame() {
    this.grid.reset();
    this.win = 0;
    this.balanceDisplay.setWinValue(0, false);
    this.balanceDisplay.setBalance(this.balance, false, false);
    this.balanceDisplay.setSweepCost(this.SWEEP_COST);
  }

  public hasEnoughBalance() {
    if (this.balance < this.SWEEP_COST) {
      console.log("Not enough balance!");
      this.gameOver = true;
      return false;
    }
    return true;
  }

  public async subtractSweepCost() {
    this.balance -= this.SWEEP_COST;
    this.balanceDisplay.setBalance(this.balance, true, false);
  }

  private getHighScoreBadge(count: number): HighScoreBadge | null {
    if (count >= 10 && count < 15) {
      return HighScoreBadge.Double;
    } else if (count >= 15 && count < 20) {
      return HighScoreBadge.Triple;
    } else if (count >= 20) {
      return HighScoreBadge.Mega;
    }
    return null;
  }

  private getHighScoreMultiplier(count: number): number {
    if (count >= 10 && count < 15) {
      return 2;
    } else if (count >= 15 && count < 20) {
      return 3;
    } else if (count >= 20) {
      return 4;
    }
    return 1;
  }

  public getIsGameOver() {
    return this.gameOver;
  }

  public getWin() {
    return this.win;
  }

  public getBalance() {
    return this.balance;
  }

  public getPaused() {
    return this.paused;
  }

  public getPausePromise() {
    return this.pausePromise;
  }

  public getBadgeCounts() {
    return this.badgeCounts;
  }

  public getSweepCost() {
    return this.SWEEP_COST;
  }
}
