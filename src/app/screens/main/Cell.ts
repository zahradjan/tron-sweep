import { animate } from "motion";
import { Container, Graphics, Sprite } from "pixi.js";

export enum CellType {
  Diamond = "diamond",
  Silver = "silver",
  Bronze = "bronze",
}

const colorMap = {
  [CellType.Diamond]: 0x9ac5db,
  [CellType.Silver]: 0xc0c0c0,
  [CellType.Bronze]: 0xcd7f32,
};

interface CellValue {
  type: CellType;
  price: number;
  sprite?: string;
}

export class Cell extends Container {
  private coverSprite?: Sprite;
  //TODO: will be sprite when images are generated
  private valueSprite?: Graphics;
  private value: CellValue;
  private cellSize: number;
  private isRevealed: boolean = false;

  private static readonly CELL_VALUES: Record<CellType, CellValue> = {
    [CellType.Diamond]: {
      type: CellType.Diamond,
      price: 1000,
      sprite: "diamond",
    },
    [CellType.Silver]: { type: CellType.Silver, price: 200, sprite: "silver" },
    [CellType.Bronze]: { type: CellType.Bronze, price: 50, sprite: "bronze" },
  };

  constructor(cellSize: number) {
    super();

    this.cellSize = cellSize;

    this.value = this.getRandomValue();
    this.valueSprite = new Graphics();
    this.valueSprite.rect(0, 0, this.cellSize, this.cellSize);

    this.valueSprite.fill({ color: colorMap[this.value.type] });
    this.addChild(this.valueSprite);
    this.coverSprite = Sprite.from("tron-sweep-logo.png");
    this.coverSprite.width = this.cellSize;
    this.coverSprite.height = this.cellSize;
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
