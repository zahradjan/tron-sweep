import { Container } from "pixi.js";
import { HighScoreBadge } from "../../model/HighScoreBadge";
import { DEFAULT_BADGE_COUNTS } from "../../../game-engine/GameEngine";
import { Badge } from "./Badge";

export class BadgesDisplay extends Container {
  private panel: Container;

  private badgeCounts: Record<HighScoreBadge, number> = {
    ...DEFAULT_BADGE_COUNTS,
  };
  private badges: Badge[];

  constructor() {
    super();

    this.panel = new Container();
    this.addChild(this.panel);

    this.badges = [
      new Badge(HighScoreBadge.Double, -400, 0),
      new Badge(HighScoreBadge.Triple, -300, 0),
      new Badge(HighScoreBadge.Mega, -200, 0),
    ];

    this.badges.forEach((badge) => {
      badge.visible = false;
      this.panel.addChild(badge);
    });
  }

  public resize(width: number, height: number) {
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  public setBadges(updatedBadgeCounts: Record<HighScoreBadge, number>) {
    for (const badge of this.badges) {
      const type = badge.getType();
      const count = updatedBadgeCounts[type] ?? 0;
      this.badgeCounts[type] = count;
      if (count > 0) {
        if (!badge.visible) {
          badge.show();
        }
        badge.setCount(count);
      }
    }
  }
}
