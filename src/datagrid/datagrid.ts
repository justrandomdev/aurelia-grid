import { BindingEngine, autoinject, bindable } from 'aurelia-framework';
import { GridConfig } from '../models/gridconfig';
import { DataRow } from '../models/datarow';
import * as _ from 'lodash';

@autoinject
export class DataGrid<K, T> {
  private _rows: Map<K, DataRow<T>> = new Map();
  public get rows(): Map<K, DataRow<T>> {
    return this._rows;
  }

  private _config: GridConfig;
  public get config(): GridConfig {
    return this._config;
  }
  public set config(value: GridConfig) {
    this._config = value;
  }

  private _numRecords: number;
  get numRecords(): number {
    return this._numRecords;
  }

  private _numPages: number;
  get numPages(): number {
    return Math.ceil(this._numRecords / this.config.recordsPerPage);
  }

  private _selectedPage: number;
  get selectedPage(): number {
    return this._selectedPage;
  }

  private _numColumns: number;

  constructor(private _bindingEngine: BindingEngine) {
  }

  addRows(records: Array<T>) {
    _.map(records, el => {
      const row = new DataRow<T>(this._bindingEngine);
      row.config = this.config;
      row.data = el as T;
      let id;

      for(const prop in el) {
        const fieldConfig = this.config.getFieldConfig(prop);

        if(_.isNil(fieldConfig))
          throw new Error("Field config not found for field: " + prop);

        //find id
        if(prop === this.config.keyField)
          id = el[prop];

        row.addField(prop, fieldConfig.editable);
      }

      if(_.isNil(id))
        throw new Error("Id field not found in record. Id fieldname is " + this.config.keyField);

      if(!this._numColumns)
        this._numColumns = row.columnCount;

      this._rows.set(id, row);
    });

  }

  clearRows() {
    this._rows.clear();
  }
}
