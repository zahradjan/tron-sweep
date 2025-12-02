import { animate } from "motion";
import { BlurFilter, Container, Sprite, Texture } from "pixi.js";

import { creationEngine } from "../getCreationEngine";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";
import { Colors } from "../utils/colors";

/** Popup that shows a legal disclaimer */
export class DisclaimerPopup extends Container {
  private bg: Sprite;
  private panel: Container;
  private panelBase: RoundedBox;
  private disclaimerLabelTitle: Label;
  private disclaimerLabel: Label;

  constructor() {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({ height: 400, width: 1400 });
    this.panel.addChild(this.panelBase);

    this.disclaimerLabelTitle = new Label({
      text: "Disclaimer",
      style: {
        fill: Colors.Cyan,
        fontSize: 56,
      },
    });
    this.disclaimerLabelTitle.y = -125;
    this.panel.addChild(this.disclaimerLabelTitle);

    this.disclaimerLabel = new Label({
      text:
        "Tron Sweep is a fan-made, non-commercial work inspired by the TRON franchise.\n" +
        "All TRON-related assets, names, imagery, music, and sounds are the property of their respective owners, including Disney.\n" +
        "This game is not affiliated with, endorsed by, or associated with Disney or any official TRON property.\n" +
        "For educational and demonstration purposes only.",
      style: {
        fill: Colors.Cyan,
        fontSize: 26,
        wordWrap: true,
        wordWrapWidth: 1400,
      },
    });
    this.disclaimerLabel.y = 0;
    this.panel.addChild(this.disclaimerLabel);
  }

  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
    const margin = 40;
    const maxPanelWidth = Math.max(320, Math.min(1400, width - margin * 2));
    const maxPanelHeight = Math.max(200, Math.min(600, height - margin * 2));

    this.panelBase.width = maxPanelWidth;
    this.panelBase.height = maxPanelHeight;

    this.disclaimerLabel.style.wordWrapWidth = maxPanelWidth - 60;

    this.disclaimerLabel.x = 0;
    this.disclaimerLabel.y = 0;
    this.disclaimerLabelTitle.anchor.set(0.5, 0);
    this.disclaimerLabelTitle.x = 0;
    this.disclaimerLabelTitle.y =
      this.panelBase.y - this.panelBase.height / 2 + 60;
  }

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

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

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
