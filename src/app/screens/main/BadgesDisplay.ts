import { Container, Sprite, Texture } from "pixi.js";
import { Label } from "../../ui/Label";
import { animate } from "motion";
import { creationEngine } from "../../getCreationEngine";
import { HighScoreBadge } from "../../model/HighScoreBadge";
import { DEFAULT_BADGE_COUNTS } from "../../../game-engine/GameEngine";

export class BadgesDisplay extends Container {
  private panel: Container;

  private doubleBadge: Sprite;
  private tripleBadge: Sprite;
  private megaBadge: Sprite;
  private badgeCounts: Record<HighScoreBadge, number> = {
    ...DEFAULT_BADGE_COUNTS,
  };
  private badgeData: Array<{
    type: HighScoreBadge;
    sprite: Sprite;
    label: Label;
  }>;
  private doubleBadgeCounterLabel: Label;
  private tripleBadgeCounterLabel: Label;
  private megaBadgeCounterLabel: Label;

  constructor() {
    super();

    this.panel = new Container();
    this.addChild(this.panel);

    this.doubleBadge = new Sprite({
      texture: Texture.from("tron-double.png"),
      anchor: 0.5,
      scale: 0.1,
    });
    this.doubleBadge.y = 0;
    this.doubleBadge.x = -400;

    this.doubleBadgeCounterLabel = new Label({
      text: `x${0}`,
    });
    this.doubleBadgeCounterLabel.y = this.doubleBadge.y + 60;
    this.doubleBadgeCounterLabel.x = this.doubleBadge.x;
    this.panel.addChild(this.doubleBadgeCounterLabel);

    this.panel.addChild(this.doubleBadge);

    this.tripleBadge = new Sprite({
      texture: Texture.from("tron-triple.png"),
      anchor: 0.5,
      scale: 0.1,
    });
    this.tripleBadge.y = 0;
    this.tripleBadge.x = -300;

    this.panel.addChild(this.tripleBadge);

    this.tripleBadgeCounterLabel = new Label({
      text: "",
    });
    this.tripleBadgeCounterLabel.y = this.tripleBadge.y + 60;
    this.tripleBadgeCounterLabel.x = this.tripleBadge.x;
    this.panel.addChild(this.tripleBadgeCounterLabel);

    this.megaBadge = new Sprite({
      texture: Texture.from("tron-mega.png"),
      anchor: 0.5,
      scale: 0.1,
    });
    this.megaBadge.y = 0;
    this.megaBadge.x = -200;
    this.panel.addChild(this.megaBadge);
    this.megaBadgeCounterLabel = new Label({
      text: `x${0}`,
    });
    this.megaBadgeCounterLabel.y = this.megaBadge.y + 60;
    this.megaBadgeCounterLabel.x = this.megaBadge.x;
    this.panel.addChild(this.megaBadgeCounterLabel);

    this.panel.x = this.panel.width;

    this.doubleBadge.visible = false;
    this.doubleBadgeCounterLabel.visible = false;
    this.tripleBadge.visible = false;
    this.tripleBadgeCounterLabel.visible = false;
    this.megaBadge.visible = false;
    this.megaBadgeCounterLabel.visible = false;

    this.badgeData = [
      {
        type: HighScoreBadge.Double,
        sprite: this.doubleBadge,
        label: this.doubleBadgeCounterLabel,
      },
      {
        type: HighScoreBadge.Triple,
        sprite: this.tripleBadge,
        label: this.tripleBadgeCounterLabel,
      },
      {
        type: HighScoreBadge.Mega,
        sprite: this.megaBadge,
        label: this.megaBadgeCounterLabel,
      },
    ];
  }

  public resize(width: number, height: number) {
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  public async setBadges(updatedBadgeCounts: Record<HighScoreBadge, number>) {
    for (const { type, sprite, label } of this.badgeData) {
      const count = updatedBadgeCounts[type] ?? 0;
      this.badgeCounts[type] = count;
      const visible = count > 0;

      if (visible) {
        label.visible = true;

        if (!sprite.visible) {
          sprite.visible = true;
          sprite.scale.set(0, 0);
          label.scale.set(0, 0);
          creationEngine().audio.sfx.play("main/sounds/purchase-success.mp3");
          animate(
            sprite.scale,
            { y: 0.1, x: 0.1 },
            { duration: 0.3, ease: "backOut" }
          );
          animate(
            label.scale,
            { y: 1, x: 1 },
            { duration: 0.3, ease: "backOut" }
          );
        }

        label.text = `x${count}`;
      }
    }
  }
}
