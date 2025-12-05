import { animate } from "motion";
import { BlurFilter, Container, Sprite, Texture } from "pixi.js";

import { creationEngine } from "../getCreationEngine";
import { Label } from "../ui/Label";
import { HighScoreBadge } from "../model/HighScoreBadge";

export class ScorePopup extends Container {
  /** Container for the popup UI components */
  private panel: Container;

  private highScoreBadgeImage: Sprite | null = null;

  private highScoreBadge: HighScoreBadge | null = null;

  private multipleSameHighScoreBadgeLabel?: Label;

  private highScoreBadgeSprite: Record<HighScoreBadge, string> = {
    [HighScoreBadge.Double]: "tron-double.png",
    [HighScoreBadge.Triple]: "tron-triple.png",
    [HighScoreBadge.Mega]: "tron-mega.png",
  };

  constructor(props?: { badge: HighScoreBadge; count: number }) {
    super();

    this.panel = new Container();
    this.addChild(this.panel);
    console.log("props", props);
    if (props) {
      this.setHighScoreBadge(props.badge, props.count);
    }
  }

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
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
    creationEngine().audio.sfx.play("main/sounds/purchase-success.mp3");
    this.panel.scale.set(0);
    await animate(
      this.panel.scale,
      { y: 1, x: 1 },
      { duration: 0.3, ease: "backIn" }
    );
  }

  /** Dismiss the popup, animated */
  public async hide() {
    const currentEngine = creationEngine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [];
    }
    await animate(
      this.panel.scale,
      { y: 0, x: 0 },
      { duration: 0.3, ease: "backIn" }
    );
  }

  public setHighScoreBadge(badge: HighScoreBadge, count: number) {
    // Get the badge and count from the object

    this.highScoreBadge = badge;

    this.highScoreBadgeImage = new Sprite({
      texture: Texture.from(
        this.highScoreBadgeSprite[this.highScoreBadge ?? HighScoreBadge.Double]
      ),
      anchor: 0.5,
      scale: 0.5,
    });
    this.highScoreBadgeImage.y = 0;

    this.panel.addChild(this.highScoreBadgeImage);

    if (count > 1) {
      this.multipleSameHighScoreBadgeLabel = new Label({
        text: `x${count}`,
        style: {
          fontSize: 45,
          align: "center",
        },
      });
      this.multipleSameHighScoreBadgeLabel.anchor.set(0.5, 0);
      this.multipleSameHighScoreBadgeLabel.x = this.highScoreBadgeImage.x;
      this.multipleSameHighScoreBadgeLabel.y =
        this.highScoreBadgeImage.y + this.highScoreBadgeImage.height / 2 - 50;
      this.panel.addChild(this.multipleSameHighScoreBadgeLabel);
    }
  }
}
