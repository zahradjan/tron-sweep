import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { Container, Sprite, Texture } from "pixi.js";

import { creationEngine } from "../../getCreationEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { Button } from "../../ui/Button";

import { Grid } from "./Grid";
import { BalanceDisplay } from "./BalanceDisplay";
import { gameEngine } from "../../getGameEngine";
import { GameOverPopup } from "../../popups/GameOverPopup";
import { Label } from "../../ui/Label";
import { Colors } from "../../utils/colors";
import { pauseAwareSync } from "../../../engine/utils/pause";
import { WinningResult } from "../../game-engine/GameEngine";
import { BadgesDisplay } from "./BadgesDisplay";
import { DisclaimerPopup } from "../../popups/DisclaimerPopup";
import { TutorialPopup } from "../../popups/TutorialPopup";

/** The screen that holds the app */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  public mainContainer: Container;
  private pauseButton: FancyButton;
  private settingsButton: FancyButton;
  private sweepButton: Button;
  private paused = false;
  private background: Sprite;
  private logo: Sprite;
  private grid: Grid;
  private balanceDisplay: BalanceDisplay;
  private badgesDisplay: BadgesDisplay;
  private currentMusicLabel: Label | null = null;

  private isRevealingCells = false;
  private revealAllCells = false;

  constructor() {
    super();
    this.background = Sprite.from("tron-arena.png");
    this.background.anchor.set(0.5);
    this.addChild(this.background);
    this.mainContainer = new Container();
    this.addChild(this.mainContainer);
    this.logo = new Sprite({
      texture: Texture.from("tron-sweep-logo-main.png"),
      anchor: 0.5,
      scale: 0.2,
    });

    this.addChild(this.logo);

    this.balanceDisplay = new BalanceDisplay();
    this.badgesDisplay = new BadgesDisplay();
    this.addChild(this.badgesDisplay);
    this.addChild(this.balanceDisplay);

    this.grid = new Grid({
      rows: 5,
      cols: 5,
      cellSize: 125,
    });
    this.grid.pivot.set(this.grid.width / 2, this.grid.height / 2);
    this.addChild(this.grid);

    gameEngine().init(this.grid, this.balanceDisplay, this.badgesDisplay);

    this.currentMusicLabel = new Label({
      style: { fill: Colors.Cyan, fontSize: 22 },
    });

    this.addChild(this.currentMusicLabel);

    const buttonAnimations = {
      hover: {
        props: {
          scale: { x: 1.1, y: 1.1 },
        },
        duration: 100,
      },
      pressed: {
        props: {
          scale: { x: 0.9, y: 0.9 },
        },
        duration: 100,
      },
    };

    this.pauseButton = new FancyButton({
      defaultView: "icon-pause.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.pauseButton.onPress.connect(() => {
      creationEngine().navigation.presentPopup(PausePopup);
      gameEngine().pause();
    });
    this.addChild(this.pauseButton);

    this.settingsButton = new FancyButton({
      defaultView: "icon-settings.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.settingsButton.onPress.connect(() =>
      creationEngine().navigation.presentPopup(SettingsPopup)
    );
    this.addChild(this.settingsButton);

    this.sweepButton = new Button({
      text: "Sweep",
      width: 300,
      height: 115,
    });
    this.addChild(this.sweepButton);
    this.sweepButton.onPress.connect(async () => {
      console.log("Clicked");
      if (gameEngine().getIsGameOver()) return;
      if (!gameEngine().hasEnoughBalance()) return;

      if (this.isRevealingCells) {
        this.revealAllCells = true;
        return;
      }

      this.isRevealingCells = true;
      this.revealAllCells = false;
      this.sweepButton.text = "Sweep All";

      try {
        // this should be awaited as async function but i dont wanna wait for it to finish
        gameEngine().subtractSweepCost();

        await gameEngine().revealCells(() => this.revealAllCells);
        this.sweepButton.disable();

        const winningResult = await pauseAwareSync<WinningResult>(
          () => gameEngine().checkWinningCells(),
          gameEngine()
        );
        if (winningResult.won) {
          creationEngine().audio.sfx.play("main/sounds/game-bonus.mp3");
        }
        console.log("result", winningResult);

        await gameEngine().setWinningCells(winningResult);
        const highScoreBadges = gameEngine().countHighScoreBadges(
          winningResult.winningCells
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await gameEngine().showHighScoreBadges(highScoreBadges);
        await gameEngine().setBadgesInBadgesDisplay();

        await gameEngine().countTotalReward(winningResult);
      } catch (error) {
        console.error("Sweep operation failed:", error);
      } finally {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        creationEngine().navigation.presentPopup(GameOverPopup);
        this.sweepButton.text = "Sweep";
        this.sweepButton.enable();
        this.isRevealingCells = false;
        this.revealAllCells = false;
      }
    });

    creationEngine().audio.bgm.onSongChange = (_, title) => {
      this.currentMusicLabel.text = title;
    };
  }

  /** Prepare the screen just before showing */
  public prepare() {}

  /** Update the screen */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_time: Ticker) {
    if (this.paused) return;
    // this.bouncer.update();
  }

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause() {
    this.mainContainer.interactiveChildren = false;
    this.paused = true;
    gameEngine().pause();
  }

  /** Resume gameplay */
  public async resume() {
    this.mainContainer.interactiveChildren = true;
    this.paused = false;
    gameEngine().resume();
  }

  /** Fully reset */
  public reset() {}

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number) {
    this.background.x = width * 0.5;
    this.background.y = height * 0.5;
    const scale = Math.max(
      width / this.background.texture.width,
      height / this.background.texture.height
    );
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    this.background.scale.set(scale);
    this.mainContainer.x = centerX;
    this.mainContainer.y = centerY;
    this.pauseButton.x = 30;
    this.pauseButton.y = 30;
    this.settingsButton.x = width - 30;
    this.settingsButton.y = 30;
    this.logo.x = width / 2;
    this.logo.y = 100;
    this.grid.x = width / 2;
    this.grid.y = height / 2;

    this.balanceDisplay.x = width - 375;
    this.balanceDisplay.y = height - 100;

    this.badgesDisplay.x = width - 200;
    this.badgesDisplay.y = height - 300;

    this.currentMusicLabel.anchor.set(0, 1);
    this.currentMusicLabel.x = 50;
    this.currentMusicLabel.y = height - 100;

    this.sweepButton.x = width / 2;
    this.sweepButton.y = height - 100;

    if (width < 900) {
      this.currentMusicLabel.x = 50;
      this.currentMusicLabel.y = this.logo.height;
      this.balanceDisplay.y = height - 150;
      this.balanceDisplay.x = width / 2;
      this.badgesDisplay.y = this.logo.height;
      this.sweepButton.y = height - 300;
    }
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    await creationEngine().navigation.presentPopup(DisclaimerPopup);
    creationEngine().navigation.presentPopup(TutorialPopup);
    creationEngine().audio.bgm.playRandomBgm();

    const elementsToAnimate = [
      this.pauseButton,
      this.settingsButton,
      this.sweepButton,
    ];

    let finalPromise!: AnimationPlaybackControls;
    for (const element of elementsToAnimate) {
      element.alpha = 0;
      finalPromise = animate(
        element,
        { alpha: 1 },
        { duration: 0.3, delay: 0.75, ease: "backOut" }
      );
    }

    await finalPromise;
  }

  /** Hide screen with animations */
  public async hide() {}

  /** Auto pause the app when window go out of focus */
  public blur() {
    if (!creationEngine().navigation.currentPopup) {
      creationEngine().navigation.presentPopup(PausePopup);
    }
  }
}
