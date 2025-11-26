import { animate } from "motion";
import { BlurFilter, Container, Sprite, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { ScoreMultiplier } from "../game-engine/GameEngine";

export class ScorePopup extends Container {
  /** The dark semi-transparent background covering current screen */
  private bg: Sprite;
  /** Container for the popup UI components */
  private panel: Container;

  private scoreImage: Sprite;

  private multiplier: ScoreMultiplier | null = null;

  private multiplierSprite: Record<ScoreMultiplier, string> = {
    [ScoreMultiplier.Double]: "tron-double.png",
    [ScoreMultiplier.Triple]: "tron-triple.png",
    [ScoreMultiplier.Mega]: "tron-mega.png",
  };

  constructor() {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.scoreImage = new Sprite({
      texture: Texture.from(
        this.multiplierSprite[this.multiplier ?? ScoreMultiplier.Double]
      ),
      anchor: 0.5,
      scale: 0.5,
    });
    this.scoreImage.y = 0;

    this.panel.addChild(this.scoreImage);
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
    const currentEngine = engine();
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
    const currentEngine = engine();
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

  public setMultiplier(mult: ScoreMultiplier) {
    this.multiplier = mult;
  }
}
