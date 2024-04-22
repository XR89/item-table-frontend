import { CellProps, TableOptions } from "react-table";

export type Item = {
  rowId: string;
  id?: string;
  name: string;
  category: string;
  price: number;
  isNew?: boolean;
};

export interface EditableCellProps extends CellProps<Item, any> {
  type: string;
  updateItemData: (rowIndex: number, columnId: string, value: any) => void;
  isEditable: boolean;
}

export interface CustomTableOptions extends TableOptions<Item> {
  updateItemData: (rowIndex: number, columnId: string, value: any) => void;
}
