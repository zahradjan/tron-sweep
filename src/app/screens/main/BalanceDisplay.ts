import { Container } from "pixi.js";
import { RoundedBox } from "../../ui/RoundedBox";
import { Label } from "../../ui/Label";
import { Colors } from "../../utils/colors";
import { animate } from "motion";
import { creationEngine } from "../../getCreationEngine";

export class BalanceDisplay extends Container {
  private panel: Container;

  private balanceLabel: Label;
  private balanceValue: Label;

  private sweepCost: Label;
  private winLabel: Label;
  private winValue: Label;
  private panelBase: RoundedBox;

  constructor() {
    super();

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({ height: 150, width: 700, shadow: false });
    this.panel.addChild(this.panelBase);

    // Static label
    this.balanceLabel = new Label({
      text: "Balance:",
    });
    this.balanceLabel.x = -this.panelBase.width / 2 + 100;
    this.panel.addChild(this.balanceLabel);

    // Value label (number only)
    this.balanceValue = new Label({
      text: "0",
    });
    this.balanceValue.x = this.balanceLabel.x + this.balanceLabel.width;
    this.panel.addChild(this.balanceValue);

    this.sweepCost = new Label({
      text: "Sweep Cost: 0",
    });
    this.sweepCost.x = 25;
    this.panel.addChild(this.sweepCost);

    this.winLabel = new Label({
      text: "Win:",
    });

    this.winLabel.x = this.panelBase.width / 2 - 175;
    this.panel.addChild(this.winLabel);

    this.winValue = new Label({
      text: "0",
    });
    this.winValue.x = this.winLabel.x + this.winLabel.width + 20;
    this.panel.addChild(this.winValue);
  }

  public resize(width: number, height: number) {
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
    this.balanceValue.x = this.balanceLabel.x + this.balanceLabel.width;
    this.winValue.x = this.winLabel.x + this.winLabel.width + 20;
  }

  public getBalance() {
    return this.balanceValue;
  }
  public async setBalance(
    balance: number,
    isAnimated: boolean = true,
    playSound: boolean = false
  ) {
    const current = parseInt(this.balanceValue.text.replace(/\D/g, "")) || 0;
    if (current === balance) {
      this.balanceValue.text = `${balance}`;
      return;
    }

    if (!isAnimated) {
      this.balanceValue.text = `${balance}`;
      return;
    }
    if (playSound) {
      creationEngine().audio.sfx.play(
        "main/sounds/coins-drop-sound-effect.mp3",
        {
          end: 2.8,
        }
      );
    }
    await Promise.all([
      animate(
        this.balanceValue.scale,
        { x: 2, y: 2 },
        {
          duration: 0.4,
          ease: "anticipate",
        }
      ).finished,
      animate(
        this.balanceValue,
        { y: this.balanceValue.y - 50 },
        {
          duration: 0.4,
          ease: "anticipate",
        }
      ).finished,
      await animate(current, balance, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => {
          this.balanceValue.text = `${Math.round(latest)}`;
        },
      }).finished,
      animate(
        this.balanceValue,
        { y: this.balanceValue.y + 50 },
        {
          duration: 0.4,
          ease: "anticipate",
        }
      ).finished,
      animate(
        this.balanceValue.scale,
        { x: 1, y: 1 },
        {
          duration: 0.4,
          ease: "anticipate",
        }
      ).finished,
    ]);
    this.balanceValue.text = `${balance}`;
  }

  public getWinValue() {
    return this.winValue;
  }
  public async setWinValue(winValue: number, isAnimated: boolean = true) {
    const current = parseInt(this.winValue.text.replace(/\D/g, "")) || 0;
    if (current === winValue) {
      this.winValue.text = `${winValue}`;
      return;
    }

    if (!isAnimated) {
      this.winValue.text = `${winValue}`;
      return;
    }

    creationEngine().audio.sfx.play("main/sounds/coins-drop-sound-effect.mp3", {
      end: 2.8,
    });

    this.winValue.style.fill = Colors.Orange;
    await Promise.all([
      animate(
        this.winValue.scale,
        { x: 2, y: 2 },
        {
          duration: 0.4,
          ease: "anticipate",
        }
      ).finished,
      animate(
        this.winValue,
        { y: this.winValue.y - 50 },
        {
          duration: 0.4,
          ease: "anticipate",
        }
      ).finished,
      await animate(current, winValue, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => {
          this.winValue.text = `${Math.round(latest)}`;
        },
      }).finished,
      animate(
        this.winValue,
        { y: this.winValue.y + 50 },
        {
          duration: 0.4,
          ease: "anticipate",
        }
      ).finished,
      animate(
        this.winValue.scale,
        { x: 1, y: 1 },
        {
          duration: 0.4,
          ease: "anticipate",
        }
      ).finished,
    ]);
    this.winValue.style.fill = Colors.Cyan;
    this.winValue.text = `${winValue}`;
  }

  public getSweepCost() {
    return this.sweepCost;
  }
  public setSweepCost(sweepCost: number) {
    this.sweepCost.text = `Sweep Cost: ${sweepCost}`;
  }
}
