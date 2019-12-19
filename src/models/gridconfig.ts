import { ColumnConfig } from './columnconfig';

type fieldname = string;

export class GridConfig {
  private _columns: Map<fieldname, ColumnConfig> = new Map();
  get columns(): Map<fieldname, ColumnConfig> {
    return this._columns;
  }

  private _keyField: string;
  set keyField(value: string) {
    this._keyField = value;
  }
  get keyField(): string {
    return this._keyField;
  }

  private _recordsPerPage: number;
  set recordsPerPage(value: number) {
    this._recordsPerPage = value;
  }

  constructor(keyField?: string, columns?: Array<ColumnConfig>) {
    this._keyField = keyField || "id";
  }

  addColumn(field: fieldname, value: ColumnConfig) {
    this._columns.set(field, value);
  }

  getFieldnames(): IterableIterator<string> {
    return this._columns.keys();
  }

  getFieldConfig(name: fieldname) {
    return this._columns.get(name);
  }

  clear() {
    this._columns.clear();
  }
}
