import { FancyButton } from "@pixi/ui";
import { engine } from "../getEngine";

import { Label } from "./Label";
import { Colors } from "../utils/colors";
import { animate } from "motion";
import { Container } from "pixi.js";

const defaultButtonOptions = {
  text: "",
  width: 350,
  height: 112,
  fontSize: 28,
};

type ButtonOptions = typeof defaultButtonOptions;

/**
 * The big rectangle button, with a label, idle and pressed states
 */
export class Button extends FancyButton {
  constructor(options: Partial<ButtonOptions> = {}) {
    const opts = { ...defaultButtonOptions, ...options };

    super({
      defaultView: "tron-button.png",
      nineSliceSprite: [280, 180, 280, 140],
      anchor: 0.5,
      text: new Label({
        text: opts.text,
        style: {
          fill: Colors.Cyan,
          align: "center",
          fontSize: opts.fontSize,
          whiteSpace: "normal",
          trim: true,
          wordWrap: false,
        },
      }),
      defaultTextAnchor: 0.5,
      scale: 0.9,
      animations: {
        hover: {
          props: {
            scale: { x: 1.03, y: 1.03 },
            y: 0,
          },
          duration: 100,
        },
        pressed: {
          props: {
            scale: { x: 0.97, y: 0.97 },
            y: 10,
          },
          duration: 100,
        },
      },
    });

    this.width = opts.width;
    this.height = opts.height;

    this.onDown.connect(this.handleDown.bind(this));
    this.onHover.connect(this.handleHover.bind(this));
  }

  public disable() {
    this.button.enabled = false;
    animate(
      this as unknown as Container,
      {
        alpha: 0.5,
      },
      {
        duration: 0.4,
        ease: "easeInOut",
      }
    );
  }
  public enable() {
    this.button.enabled = true;
    animate(
      this as unknown as Container,
      {
        alpha: 1,
      },
      {
        duration: 0.4,
        ease: "easeInOut",
      }
    );
  }
  private handleHover() {
    engine().audio.sfx.play("main/sounds/sfx-hover.wav");
  }

  private handleDown() {
    engine().audio.sfx.play("main/sounds/sfx-press.wav");
  }
}
