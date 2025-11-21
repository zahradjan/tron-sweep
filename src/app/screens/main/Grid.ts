import { Container, Graphics } from "pixi.js";
import { Colors } from "../../utils/colors";

export interface GridOptions {
  rows: number;
  cols: number;
  cellSize: number;
  borderColor?: number;
  fillColor?: number;
}

export class Grid extends Container {
  private cells: Graphics[][] = [];
  private options: Required<GridOptions>;

  constructor(options: GridOptions) {
    super();

    this.options = {
      borderColor: Colors.Cyan,
      fillColor: Colors.Tarawera,
      ...options,
    };
    this.createGrid();
  }

  private createGrid() {
    const { rows, cols, cellSize, borderColor, fillColor } = this.options;

    for (let row = 0; row < rows; row++) {
      this.cells[row] = [];

      for (let col = 0; col < cols; col++) {
        const cell = new Graphics();

        // Draw cell background
        cell.rect(0, 0, cellSize, cellSize);
        cell.fill({ color: fillColor, alpha: 0 });
        cell.stroke({ color: borderColor, width: 2 });

        // Position cell
        cell.x = col * cellSize;
        cell.y = row * cellSize;

        // Make interactive
        cell.eventMode = "static";
        cell.cursor = "pointer";

        // Add hover effect
        cell.on("pointerover", () => {
          cell.clear();
          cell.rect(0, 0, cellSize, cellSize);
          cell.fill({ color: Colors.DarkBlue, alpha: 0.5 });
          cell.stroke({ color: borderColor, width: 2 });
        });

        cell.on("pointerout", () => {
          cell.clear();
          cell.rect(0, 0, cellSize, cellSize);
          cell.fill({ color: fillColor, alpha: 0 });
          cell.stroke({ color: borderColor, width: 2 });
        });

        // cell.on("pointertap", () => this.onCellClick(row, col));

        this.cells[row][col] = cell;
        this.addChild(cell);
      }
    }
  }
}
