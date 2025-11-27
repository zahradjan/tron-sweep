import { animate } from "motion";
import { Container, Sprite } from "pixi.js";
import { randomFloat } from "../../../engine/utils/random";

export enum CellType {
  Program = "program",
  User = "user",
  Clue = "clue",
  Flynn = "flynn",
}

const cellSpritesMap = {
  [CellType.Program]: "tron-disc-100.png",
  [CellType.User]: "tron-disc-200.png",
  [CellType.Clue]: "tron-disc-500.png",
  [CellType.Flynn]: "tron-disc-1000.png",
};

export const CELL_VALUES: Record<CellType, CellValue> = {
  [CellType.Program]: {
    type: CellType.Program,
    price: 100,
    sprite: cellSpritesMap[CellType.Program],
  },
  [CellType.User]: {
    type: CellType.User,
    price: 200,
    sprite: cellSpritesMap[CellType.User],
  },
  [CellType.Clue]: {
    type: CellType.Clue,
    price: 500,
    sprite: cellSpritesMap[CellType.Clue],
  },
  [CellType.Flynn]: {
    type: CellType.Flynn,
    price: 1000,
    sprite: cellSpritesMap[CellType.Flynn],
  },
};

export interface CellValue {
  type: CellType;
  price: number;
  sprite?: string;
}

export class Cell extends Container {
  private coverSprite: Sprite;
  private valueSprite: Sprite;
  private cellValue: CellValue;
  private cellSize: number;
  private isRevealed: boolean = false;
  private isWinning: boolean = false;

  constructor(cellSize: number, cellValue: CellValue) {
    super();

    this.cellSize = cellSize;
    this.cellValue = cellValue;

    this.coverSprite = Sprite.from("tron-disc.png");

    this.coverSprite.anchor.set(0.5, 0.5);

    this.coverSprite.width = this.cellSize - 35;
    this.coverSprite.height = this.cellSize - 35;

    this.coverSprite.x = this.cellSize / 2;
    this.coverSprite.y = this.cellSize / 2;

    this.addChild(this.coverSprite);

    this.valueSprite = Sprite.from(cellSpritesMap[this.cellValue.type]);
    this.valueSprite.anchor.set(0.5);

    this.valueSprite.x = this.cellSize / 2;
    this.valueSprite.y = this.cellSize / 2;
    this.valueSprite.scale.set(0, 0);
    this.addChild(this.valueSprite);
  }

  public getRandomValue(): CellValue {
    const types = Object.values(CellType);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return CELL_VALUES[randomType];
  }

  // wont be used but have here as tutorial on how to make repeat animation
  private discFloat() {
    animate(
      this.coverSprite,
      {
        y: [
          this.cellSize / 2,
          this.cellSize / 2 - randomFloat(0, 10),
          this.cellSize / 2,
          this.cellSize / 2 - randomFloat(0, 10),
          this.cellSize / 2,
        ],
      },
      {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }
    );
  }

  public async reveal() {
    if (this.isRevealed) return;

    this.isRevealed = true;

    await this.revealValueSprite();
  }

  public getValue(): number {
    return this.cellValue.price;
  }

  public getType(): CellType {
    return this.cellValue.type;
  }

  public getIsRevealed(): boolean {
    return this.isRevealed;
  }

  public async setIsWinning(isWinning: boolean) {
    if (this.valueSprite) {
      const originalScaleX = this.valueSprite.scale.x;
      const originalScaleY = this.valueSprite.scale.y;
      if (isWinning) {
        await animate(
          this.valueSprite.scale,
          { x: originalScaleX * 1.2, y: originalScaleY * 1.2 },
          { duration: 0.2, ease: "easeOut" }
        ).finished;
        await animate(
          this.valueSprite.scale,
          { x: originalScaleX, y: originalScaleY },
          { duration: 0.15, ease: "easeIn" }
        ).finished;
      } else {
        animate(
          this.valueSprite,
          { alpha: 0.3 },
          { duration: 0.2, ease: "easeOut" }
        );
      }
    }
  }

  public getIsWinning(): boolean {
    return this.isWinning;
  }

  private async revealValueSprite() {
    const trail = Sprite.from("tron-bike-trail-blue.png");
    trail.anchor.set(0, 0.5);
    trail.blendMode = "max";
    trail.scale.set(0, 1);

    trail.y = this.cellSize / 2;
    trail.height = this.cellSize;
    this.addChild(trail);
    const fullScaleX = this.cellSize / trail.texture.width;

    this.coverSprite.anchor.set(0.5, 0.5);

    // Trail grow
    await animate(
      trail.scale,
      { x: fullScaleX },
      { duration: 0.2, ease: "circIn" }
    ).finished;

    trail.anchor.set(1, 0.5);
    trail.x = this.cellSize;

    await Promise.all([
      animate(trail.scale, { x: 0 }, { duration: 0.2, ease: "circOut" })
        .finished,
      animate(
        this.coverSprite,
        { alpha: 0 },
        { duration: 0.1, ease: "circOut" }
      ).finished,
      animate(
        this.valueSprite.scale,
        {
          x: (this.cellSize - 35) / this.valueSprite.texture.width,
          y: (this.cellSize - 35) / this.valueSprite.texture.height,
        },
        { duration: 0.2, ease: "anticipate" }
      ).finished,
    ]);

    this.removeChild(trail);
    this.removeChild(this.coverSprite);
  }
}
