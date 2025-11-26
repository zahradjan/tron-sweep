import { Container, Graphics } from "pixi.js";
import { Colors } from "../../utils/colors";
import { Cell } from "./Cell";

export interface GridOptions {
  rows: number;
  cols: number;
  cellSize: number;
  borderColor?: number;
  fillColor?: number;
  gap?: number;
}

export class Grid extends Container {
  private cells: Cell[] = [];
  private options: Required<GridOptions>;
  private gridBorderLines: Graphics;

  constructor(options: GridOptions) {
    super();

    this.options = {
      borderColor: Colors.Cyan,
      fillColor: Colors.Tarawera,
      gap: 2,
      ...options,
    };
    this.gridBorderLines = new Graphics();
    this.addChild(this.gridBorderLines);

    this.createGrid();
    this.drawGridBorderLines();
  }

  private createGrid() {
    const { rows, cols, cellSize, gap } = this.options;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = new Cell(cellSize);

        // Position cell
        cell.x = col * (cellSize + gap) + gap / 2;
        cell.y = row * (cellSize + gap) + gap / 2;

        this.cells.push(cell);
        this.addChild(cell);
      }
    }
  }

  private drawGridBorderLines() {
    const { rows, cols, cellSize, borderColor, gap } = this.options;
    const totalWidth = cols * (cellSize + gap);
    const totalHeight = rows * (cellSize + gap);

    this.gridBorderLines.clear();

    // Draw vertical lines
    for (let col = 0; col <= cols; col++) {
      const x = col * (cellSize + gap);
      this.gridBorderLines.moveTo(x, 0);
      this.gridBorderLines.lineTo(x, totalHeight);
    }

    // Draw horizontal lines
    for (let row = 0; row <= rows; row++) {
      const y = row * (cellSize + gap);
      this.gridBorderLines.moveTo(0, y);
      this.gridBorderLines.lineTo(totalWidth, y);
    }

    this.gridBorderLines.stroke({ color: borderColor, width: 2 });
  }

  public reset() {
    for (const cell of this.cells) {
      this.removeChild(cell);
    }
    this.cells = [];

    this.createGrid();
  }

  public getCells(): Cell[] {
    return this.cells;
  }

  public getRevealedCells(): Cell[] {
    return this.cells.filter((cell) => cell.getIsRevealed());
  }
}
