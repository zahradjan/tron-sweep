import { pauseAware } from "../../engine/utils/pause";
import { config } from "../config/config";
import { creationEngine } from "../getCreationEngine";
import { CellType } from "../model/CellType";
import { HighScore } from "../model/HighScore";
import { HighScoreBadge } from "../model/HighScoreBadge";
import { WinningCell } from "../model/WinningCell";
import { WinningResult } from "../model/WinningResult";
import { ScorePopup } from "../popups/ScorePopup";
import { BadgesDisplay } from "../screens/main/BadgesDisplay";
import { BalanceDisplay } from "../screens/main/BalanceDisplay";
import { Grid } from "../screens/main/Grid";

const HIGH_SCORES: HighScore[] = config.highScores;

const CELL_REWARDS: Record<CellType, number> = config.cellRewards;

export const DEFAULT_BADGE_COUNTS: Record<HighScoreBadge, number> = {
  [HighScoreBadge.Double]: 0,
  [HighScoreBadge.Triple]: 0,
  [HighScoreBadge.Mega]: 0,
};

export class GameEngine {
  private win: number = 0;
  private balance: number = config.defaultBalance;
  private readonly SWEEP_COST = config.sweepCost;
  private gameOver: boolean = false;
  private grid!: Grid;
  private balanceDisplay!: BalanceDisplay;
  private paused = false;
  private pausePromise: Promise<void> | null = null;
  private pauseResolver: (() => void) | null = null;
  private badgeCounts: Record<HighScoreBadge, number> = {
    ...DEFAULT_BADGE_COUNTS,
  };
  private badgesDisplay!: BadgesDisplay;

  constructor() {}

  public init(
    grid: Grid,
    balanceDisplay: BalanceDisplay,
    badgesDisplay: BadgesDisplay
  ) {
    this.grid = grid;
    this.balanceDisplay = balanceDisplay;
    this.badgesDisplay = badgesDisplay;
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
  public async countTotalReward(winningResult: WinningResult): Promise<number> {
    if (winningResult.won) {
      let totalReward = 0;
      for (const winningCell of winningResult.winningCells) {
        const reward = CELL_REWARDS[winningCell.type];
        const highScore = this.getHighScore(winningCell.count);
        const finalReward = reward * (highScore?.multiplier ?? 1);
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
    console.log("badge count", this.badgeCounts);
    const counts = { ...DEFAULT_BADGE_COUNTS };
    for (const winningCell of winningCells) {
      const highScore = this.getHighScore(winningCell.count);
      if (highScore) {
        counts[highScore.badge]++;
        this.badgeCounts[highScore.badge]++;
      }
    }
    return counts;
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

  public async setBadgesInBadgesDisplay() {
    await this.badgesDisplay.setBadges(this.badgeCounts);
  }

  public async revealCells(shouldRevealAll?: () => boolean) {
    const availableCells = this.grid
      .getCells()
      .filter((cell) => !cell.getIsRevealed());

    if (!availableCells.length) {
      console.log("All cells already revealed!");
      return [];
    }

    for (const cell of availableCells) {
      if (shouldRevealAll()) {
        cell.reveal();
      } else {
        await pauseAware(() => cell.reveal(), this);
      }
    }
  }

  public async setWinningCells(winningResult: WinningResult) {
    const winningTypes = winningResult.winningCells.map((win) => win.type);
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
    await this.balanceDisplay.setBalance(this.balance, true, false);
  }

  private getHighScore(count: number): HighScore | null {
    return (
      HIGH_SCORES.find(
        (highScore) =>
          count >= highScore.range.min && count < highScore.range.max
      ) || null
    );
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
