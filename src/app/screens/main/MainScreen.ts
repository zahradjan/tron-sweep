import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { Container, Sprite, Texture } from "pixi.js";

import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { Button } from "../../ui/Button";

import { Grid } from "./Grid";
import { StartGamePopup } from "../../popups/StartGamePopup";
import { BalanceDisplay } from "./BalanceDisplay";
import { GameEngine } from "../../game-engine/GameEngine";

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

  private gameEngine: GameEngine;

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

    this.addChild(this.balanceDisplay);

    this.grid = new Grid({
      rows: 5,
      cols: 4,
      cellSize: 125,
    });
    this.grid.pivot.set(this.grid.width / 2, this.grid.height / 2);
    this.addChild(this.grid);

    this.gameEngine = new GameEngine(this.grid, this.balanceDisplay);

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
    this.pauseButton.onPress.connect(() =>
      engine().navigation.presentPopup(PausePopup)
    );
    this.addChild(this.pauseButton);

    this.settingsButton = new FancyButton({
      defaultView: "icon-settings.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.settingsButton.onPress.connect(() =>
      engine().navigation.presentPopup(SettingsPopup)
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
      if (this.gameEngine.getIsGameOver()) return;
      if (!this.gameEngine.hasEnoughBalance()) return;

      this.sweepButton.disable();

      this.gameEngine.subtractSweepCost();

      await this.gameEngine.revealCells();

      const winningResult = this.gameEngine.checkWinningCells();

      this.gameEngine.setWinningCells(winningResult);
      this.gameEngine.countWinScore(winningResult);

      this.sweepButton.enable();
    });
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
  }

  /** Resume gameplay */
  public async resume() {
    this.mainContainer.interactiveChildren = true;
    this.paused = false;
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

    this.sweepButton.x = width / 2;
    //This is because on mobile balance display would be underneath sweep button
    this.sweepButton.y = width < 800 ? height - 250 : height - 100;
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    engine().navigation.presentPopup(StartGamePopup);
    engine().audio.bgm.play("main/sounds/tron-legacy-end-of-line.mp3", {
      volume: 0.8,
    });

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
    if (!engine().navigation.currentPopup) {
      engine().navigation.presentPopup(PausePopup);
    }
  }
}
