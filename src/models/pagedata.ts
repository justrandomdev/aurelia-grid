import { bindable, computedFrom } from 'aurelia-framework';
import { DataSet } from './../datagrid/dataset';


export class PageData {

  private _dataSet: DataSet<any, any>;
  get dataSet(): DataSet<any, any> {
    return this._dataSet;
  }

  @bindable
  recordsPerPage: number;

  private _selectedPage: number;

  get selectedPage(): number {
    return this._selectedPage;
  }
  set selectedPage(value: number) {
    this._selectedPage = value;
  }

  get numRecords(): number {
    return this._dataSet.numRecords;
  }

  @computedFrom('selectedPage')
  get isFirstPage(): boolean {
    return this.selectedPage == 1;
  }

  @computedFrom('selectedPage')
  get hasPreviousPage(): boolean  {
    return this.selectedPage > 1;
  }

  @computedFrom('selectedPage', 'numPages')
  get isLastPage(): boolean {
    return this.selectedPage == this.numPages;
  }

  @computedFrom('selectedPage')
  get hasNextPage(): boolean  {
    return this.selectedPage < this.numPages;
  }

  @computedFrom('dataSet.numRecords','recordsPerPage')
  get numPages(): number {
    return Math.ceil(this._dataSet.numRecords / this.recordsPerPage);
  }

  constructor(dataSet: DataSet<any, any>) {
    this._dataSet = dataSet;
    this._selectedPage = 1;
  }


}
