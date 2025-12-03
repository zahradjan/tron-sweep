import { animate } from "motion";
import { BlurFilter, Container, Sprite, Texture } from "pixi.js";

import { creationEngine } from "../getCreationEngine";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";
import { gameEngine } from "../getGameEngine";

/** Popup that shows up when gameplay is paused */
export class GameOverPopup extends Container {
  /** The dark semi-transparent background covering current screen */
  private bg: Sprite;
  private logo: Sprite;
  /** Container for the popup UI components */
  private panel: Container;
  /** The popup title label */
  private youWinTitle: Label;
  private winValueLabel: Label;
  private balanceLabel: Label;
  private balanceValueLabel: Label;
  /** Button that closes the popup */
  private nextGameButton: Button;
  private exitGameButton: Button;

  /** The panel background */
  private panelBase: RoundedBox;

  constructor() {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({ height: 700 });
    this.panel.addChild(this.panelBase);

    this.panel.addChild(this.panelBase);
    this.logo = new Sprite({
      texture: Texture.from("tron-sweep-logo-main.png"),
      anchor: 0.5,
      scale: 0.2,
    });
    this.logo.y = -250;
    this.panel.addChild(this.logo);

    this.youWinTitle = new Label({
      text: "Win:",
      style: { fontSize: 50 },
    });
    this.youWinTitle.y = -125;
    this.panel.addChild(this.youWinTitle);

    const win = gameEngine().getWin();
    this.winValueLabel = new Label({
      text: `${win}`,
      style: { fontSize: 50 },
    });
    this.winValueLabel.y = -65;
    this.panel.addChild(this.winValueLabel);

    this.balanceLabel = new Label({
      text: "Balance:",
      style: { fontSize: 50 },
    });
    this.balanceLabel.y = -5;
    this.panel.addChild(this.balanceLabel);

    const balance = gameEngine().getBalance();

    this.balanceValueLabel = new Label({
      text: `${balance}`,
      style: { fontSize: 50 },
    });
    this.balanceValueLabel.y = 55;
    this.panel.addChild(this.balanceValueLabel);

    const sweepCost = gameEngine().getSweepCost();

    if (balance >= sweepCost) {
      this.nextGameButton = new Button({ text: "Next Game" });
      this.nextGameButton.y = 150;
      this.nextGameButton.onPress.connect(() => {
        creationEngine().navigation.dismissPopup();
        gameEngine().nextGame();
      });
      this.panel.addChild(this.nextGameButton);
    }

    this.exitGameButton = new Button({ text: "Exit" });
    this.exitGameButton.y = 275;
    this.exitGameButton.onPress.connect(() => {
      window.location.reload();
    });
    this.panel.addChild(this.exitGameButton);
  }

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  /** Present the popup, animated */
  public async show() {
    const currentEngine = creationEngine();

    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 5 }),
      ];
    }
    this.bg.alpha = 0;
    this.panel.pivot.y = -400;
    animate(this.bg, { alpha: 0.8 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: 0 },
      { duration: 0.3, ease: "backOut" }
    );
  }

  /** Dismiss the popup, animated */
  public async hide() {
    const currentEngine = creationEngine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [];
    }
    animate(this.bg, { alpha: 0 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: -500 },
      { duration: 0.3, ease: "backIn" }
    );
  }
}
