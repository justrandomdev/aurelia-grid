import { SortOrder } from '../common/gridenums';

export class ColumnOptions {
  filterText: string;
  sortOrder: SortOrder = SortOrder.NONE;
}
