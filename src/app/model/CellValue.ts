import { CellType } from "./CellType";

export interface CellValue {
  type: CellType;
  price: number;
  sprite?: string;
}
