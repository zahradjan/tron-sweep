import { BlurFilter, Container, Sprite, Texture } from "pixi.js";
import { Label } from "../ui/Label";
import { creationEngine } from "../getCreationEngine";
import { animate } from "motion";
import { RoundedBox } from "../ui/RoundedBox";
import { StartGamePopup } from "./StartGamePopup";
import { Button } from "../ui/Button";

export class TutorialPopup extends Container {
  private bg: Sprite;
  private panel: Container;
  private panelBase: RoundedBox;
  private tutorialLabel: Label;
  private okButton: Button;
  private logo: Sprite;
  private doubleBadge: Sprite;
  private tripleBadge: Sprite;
  private megaBadge: Sprite;

  constructor() {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({ height: 900, width: 1400 });
    this.panel.addChild(this.panelBase);

    this.logo = new Sprite({
      texture: Texture.from("tron-sweep-logo-main.png"),
      anchor: 0.5,
      scale: 0.2,
    });
    this.logo.y = -350;
    this.panel.addChild(this.logo);

    this.tutorialLabel = new Label({
      text: `Tron Sweep is a match-5 style game.
Reveal cells and try to find five or more of the same type to win!
Combination badges: Double (10 or more), Triple (15 or more), Mega (20 or more).
The bigger your combination, the higher the badge and the greater your reward!`,
      style: {
        fontSize: 26,
        wordWrap: true,
        breakWords: true,
        align: "center",
      },
    });
    this.tutorialLabel.y = -100;
    this.panel.addChild(this.tutorialLabel);

    this.doubleBadge = new Sprite({
      texture: Texture.from("tron-double.png"),
      anchor: 0.5,
      scale: 0.2,
    });
    this.doubleBadge.y = 150;
    this.doubleBadge.x = -250;

    this.panel.addChild(this.doubleBadge);

    this.tripleBadge = new Sprite({
      texture: Texture.from("tron-triple.png"),
      anchor: 0.5,
      scale: 0.2,
    });
    this.tripleBadge.y = 150;

    this.panel.addChild(this.tripleBadge);

    this.megaBadge = new Sprite({
      texture: Texture.from("tron-mega.png"),
      anchor: 0.5,
      scale: 0.23,
    });
    this.megaBadge.y = 150;
    this.megaBadge.x = 250;

    this.panel.addChild(this.megaBadge);

    this.okButton = new Button({ text: "OK" });
    this.okButton.y = 350;
    this.okButton.onPress.connect(() => {
      creationEngine().navigation.presentPopup(StartGamePopup);
    });
    this.panel.addChild(this.okButton);
  }

  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
    const margin = 40;
    const maxPanelWidth = Math.max(320, Math.min(1400, width - margin * 2));
    const maxPanelHeight = Math.max(750, Math.min(1000, height - margin * 2));

    this.panelBase.width = maxPanelWidth;
    this.panelBase.height = maxPanelHeight;

    this.tutorialLabel.style.wordWrapWidth = maxPanelWidth - 60;

    const badgeY = 150;
    const badgeSpacing = maxPanelWidth / 3;
    const centerX = 0;

    this.doubleBadge.x = centerX - badgeSpacing;
    this.tripleBadge.x = centerX;
    this.megaBadge.x = centerX + badgeSpacing;

    this.doubleBadge.y = badgeY;
    this.tripleBadge.y = badgeY;
    this.megaBadge.y = badgeY;
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
