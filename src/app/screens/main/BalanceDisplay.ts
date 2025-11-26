import { Container } from "pixi.js";
import { RoundedBox } from "../../ui/RoundedBox";
import { Label } from "../../ui/Label";
import { Colors } from "../../utils/colors";
import { animate } from "motion";

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
      style: {
        fontSize: 22,
        fill: Colors.Cyan,
      },
    });
    this.balanceLabel.x = -this.panelBase.width / 2 + 100;
    this.panel.addChild(this.balanceLabel);

    // Value label (number only)
    this.balanceValue = new Label({
      text: "0",
      style: {
        fontSize: 22,
        fill: Colors.Cyan,
      },
    });
    this.balanceValue.x = this.balanceLabel.x + this.balanceLabel.width;
    this.panel.addChild(this.balanceValue);

    this.sweepCost = new Label({
      text: "Sweep Cost: 0",
      style: {
        fontSize: 22,
        fill: Colors.Cyan,
      },
    });
    this.sweepCost.x = 25;
    this.panel.addChild(this.sweepCost);

    this.winLabel = new Label({
      text: "Win:",
      style: {
        fontSize: 22,
        fill: Colors.Cyan,
      },
    });

    this.winLabel.x = this.panelBase.width / 2 - 175;
    this.panel.addChild(this.winLabel);

    this.winValue = new Label({
      text: "0",
      style: {
        fontSize: 22,
        fill: Colors.Cyan,
      },
    });
    this.winValue.x = this.winLabel.x + this.winLabel.width + 20;
    this.panel.addChild(this.winValue);
  }

  public resize(width: number, height: number) {
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
    this.balanceValue.x = this.balanceLabel.x + this.balanceLabel.width;
    this.winValue.x = this.winLabel.x + this.winLabel.width;
  }

  public getBalance() {
    return this.balanceValue;
  }
  public async setBalance(balance: number) {
    const current = parseInt(this.balanceValue.text.replace(/\D/g, "")) || 0;
    if (current === balance) {
      this.balanceValue.text = `${balance}`;
      return;
    }
    await animate(current, balance, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (latest) => {
        this.balanceValue.text = `${Math.round(latest)}`;
      },
    }).finished;
    this.balanceValue.text = `${balance}`;
  }

  public getWinValue() {
    return this.winLabel;
  }
  public async setWinValue(winValue: number) {
    const current = parseInt(this.balanceValue.text.replace(/\D/g, "")) || 0;
    if (current === winValue) {
      this.balanceValue.text = `${winValue}`;
      return;
    }
    await animate(current, winValue, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (latest) => {
        this.winValue.text = `${Math.round(latest)}`;
      },
    }).finished;
    this.winValue.text = `${winValue}`;
    this.winValue.text = `${winValue}`;
  }

  public getSweepCost() {
    return this.sweepCost;
  }
  public setSweepCost(sweepCost: number) {
    this.sweepCost.text = `Sweep Cost: ${sweepCost}`;
  }
}
