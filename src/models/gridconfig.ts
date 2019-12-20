import { bindable } from 'aurelia-framework';
import { ColumnConfig } from './columnconfig';
import * as _ from 'lodash';

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

  private _showPager: boolean;
  get showPager(): boolean {
    return this._showPager;
  }
  set showPager(value: boolean) {
    this._showPager = value;
  }

  @bindable
  recordsPerPage: number;

  constructor(keyField?: string, columns?: Array<ColumnConfig>) {
    this._keyField = keyField || "id";
    this._showPager = false;
    this.recordsPerPage = 10;
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
