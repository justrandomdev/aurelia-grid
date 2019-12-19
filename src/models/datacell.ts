import * as _ from 'lodash';

export class DataCell<T> {
  _inEditMode: boolean = false;
  set inEditMode(value: boolean) {
    this._inEditMode = value;
  }
  get inEditMode(): boolean {
    return this._inEditMode;
  }
  
  private _isEditable: boolean = false;
  set isEditable(value: boolean) {
    this._isEditable = value;
  }

 }
