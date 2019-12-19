import { GridConfig } from './gridconfig';
import { BindingEngine, ICollectionObserverSplice, autoinject, bindable, observable } from 'aurelia-framework';
import * as _ from 'lodash';
import { DataCell } from './datacell';

type fieldname = string;

interface RowChangedHandler<T> {
  (changedItems: Array<ICollectionObserverSplice<Map<number, T>>>): void;
}

export class DataRow<T> {

  private _inEditMode: boolean = false;
  private _isEditable: boolean;

  @observable data: T;

  private _config: GridConfig;
  public get config(): GridConfig {
    return this._config;
  }
  public set config(value: GridConfig) {
    this._config = value;
  }

  private _fields: Map<fieldname, DataCell<T>> = new Map();
  get fields() {
    return this._fields;
  }

  get columnCount(): number {
    return this._fields.size;
  }

  private _changedHandler: RowChangedHandler<T>;
  set changedHandler(handler: RowChangedHandler<T>) {
    this._changedHandler = handler;
  }


  constructor(private _bindingEngine: BindingEngine) {
    let subscription = this._bindingEngine.collectionObserver(this._fields)
      .subscribe(this.rowChanged.bind(this));
  }

  addField(name: string, isEditable?: boolean) {
    const cell = new DataCell<any>();
    cell.isEditable = isEditable || false;

    this._fields.set(name, cell);
  }

  rowChanged(splices: Array<ICollectionObserverSplice<Map<number, T>>>) {
    if(!_.isNil(this._changedHandler))
      this._changedHandler(splices);
  }
 }
