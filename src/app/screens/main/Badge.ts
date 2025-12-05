import { Container, Sprite, Texture } from "pixi.js";
import { HighScoreBadge } from "../../model/HighScoreBadge";
import { Label } from "../../ui/Label";
import { animate } from "motion";
const BADGE_CONFIG = {
  [HighScoreBadge.Double]: { texture: "tron-double.png", label: "x0" },
  [HighScoreBadge.Triple]: { texture: "tron-triple.png", label: "" },
  [HighScoreBadge.Mega]: { texture: "tron-mega.png", label: "x0" },
};

export class Badge extends Container {
  private type: HighScoreBadge;
  private sprite: Sprite;
  private badgeLabel: Label;

  constructor(type: HighScoreBadge, x: number, y: number) {
    super();
    this.type = type;
    const badgeConfig = BADGE_CONFIG[type];
    this.sprite = new Sprite({
      texture: Texture.from(badgeConfig.texture),
      anchor: 0.5,
      scale: 0.1,
    });
    this.sprite.x = 0;
    this.sprite.y = 0;

    this.badgeLabel = new Label({ text: badgeConfig.label });
    this.badgeLabel.x = 0;
    this.badgeLabel.y = 60;

    this.addChild(this.sprite);
    this.addChild(this.badgeLabel);

    this.x = x;
    this.y = y;
  }

  setCount(count: number) {
    this.badgeLabel.text = `x${count}`;
  }

  public show() {
    this.visible = true;
    this.sprite.scale.set(0, 0);
    this.badgeLabel.scale.set(0, 0);
    animate(
      this.sprite.scale,
      { x: 0.1, y: 0.1 },
      { duration: 0.3, ease: "backOut" }
    );
    animate(
      this.badgeLabel.scale,
      { x: 1, y: 1 },
      { duration: 0.3, ease: "backOut" }
    );
  }

  public getType() {
    return this.type;
  }
}
