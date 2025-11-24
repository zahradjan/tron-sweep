import { animate } from "motion";
import { Container, Sprite } from "pixi.js";

export enum CellType {
  Basic = "basic",
  User = "user",
  Clue = "clue",
  Flynn = "flynn",
}

const cellSpritesMap = {
  [CellType.Basic]: "tron-disc-100.png",
  [CellType.User]: "tron-disc-200.png",
  [CellType.Clue]: "tron-disc-500.png",
  [CellType.Flynn]: "tron-disc-1000.png",
};

interface CellValue {
  type: CellType;
  price: number;
  sprite?: string;
}

export class Cell extends Container {
  private coverSprite?: Sprite;
  private valueSprite?: Sprite;
  private value: CellValue;
  private cellSize: number;
  private isRevealed: boolean = false;

  private static readonly CELL_VALUES: Record<CellType, CellValue> = {
    [CellType.Basic]: {
      type: CellType.Basic,
      price: 100,
      sprite: cellSpritesMap[CellType.Basic],
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

  constructor(cellSize: number) {
    super();

    this.cellSize = cellSize;

    this.value = this.getRandomValue();
    this.valueSprite = Sprite.from(cellSpritesMap[this.value.type]);
    this.valueSprite.anchor.set(0.5);
    this.valueSprite.width = this.cellSize - 35;
    this.valueSprite.height = this.cellSize - 35;
    this.valueSprite.x = this.cellSize / 2;
    this.valueSprite.y = this.cellSize / 2;
    this.addChild(this.valueSprite);
    this.coverSprite = Sprite.from("tron-sweep-logo.png");
    this.coverSprite.anchor.set(0.5);
    this.coverSprite.width = this.cellSize;
    this.coverSprite.height = this.cellSize;
    this.coverSprite.x = this.cellSize / 2;
    this.coverSprite.y = this.cellSize / 2;
    this.addChild(this.coverSprite);
  }

  private getRandomValue(): CellValue {
    const types = Object.values(CellType);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return Cell.CELL_VALUES[randomType];
  }

  public async reveal() {
    if (this.isRevealed) return;

    this.isRevealed = true;

    // Remove cover
    if (this.coverSprite) {
      await Promise.all([
        animate(
          this.coverSprite,
          { alpha: 0 },
          { duration: 0.3, ease: "easeOut" }
        ).finished,
      ]);
      this.removeChild(this.coverSprite);
      this.coverSprite = undefined;
    }
  }

  public getValue(): number {
    return this.value.price;
  }

  public getType(): CellType {
    return this.value.type;
  }

  public getIsRevealed(): boolean {
    return this.isRevealed;
  }
}
