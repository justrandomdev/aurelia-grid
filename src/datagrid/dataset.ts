import { ColumnConfig } from 'models/columnconfig';
import { BindingEngine, autoinject, bindable, ICollectionObserverSplice } from 'aurelia-framework';
import { GridConfig } from '../models/gridconfig';
import { DataRow } from '../models/datarow';
import * as _ from 'lodash';


interface ColumnConfigChangedHandler {
  (changedItems: Array<ICollectionObserverSplice<Map<string, ColumnConfig>>>): void;
}


@autoinject
export class DataSet<K, T> {
  private _rows: Map<K, DataRow<T>> = new Map();
  public get rows(): Map<K, DataRow<T>> {
    return this._rows;
  }

  private _columnConfigSubscription;

  private _config: GridConfig;
  public get config(): GridConfig {
    return this._config;
  }
  public set config(value: GridConfig) {
    this._config = value;

    this._columnConfigSubscription = this._bindingEngine.collectionObserver(this._config.columns)
      .subscribe(this.columnConfigChanged.bind(this));
  }

  get numRecords(): number {
    return this._rows.size;
  }

  private _numColumns: number;
  get numColumns(): number {
    return this._numColumns;
  }

  private _columnConfigchangedHandler: ColumnConfigChangedHandler;
  set changedHandler(handler: ColumnConfigChangedHandler) {
    this._columnConfigchangedHandler = handler;
  }

  private _visibleColumns: number;
  get visibleColumns(): number {
    if(!this._visibleColumns) {
      let count = 0;

      this._config.columns.forEach((v, k) => {
        if(v.visible)
          ++count;
      });

      this._visibleColumns = count;
    }

    return this._visibleColumns;
  }



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

        //Add column filter
        //if(!this._columnFilters.has(prop))
        //  this._columnFilters.set(prop, "")

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

  columnConfigChanged(splices: Array<ICollectionObserverSplice<Map<string, ColumnConfig>>>) {
    this._visibleColumns = undefined;
    if(!_.isNil(this._columnConfigchangedHandler))
      this._columnConfigchangedHandler(splices);
  }

  
}
