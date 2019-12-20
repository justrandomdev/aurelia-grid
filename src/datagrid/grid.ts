import { PageData } from './../models/pagedata';
import { DataCell } from './../models/datacell';
import { ColumnConfig } from 'models/columnconfig';
import { DragHandleTracking } from './../models/draghandletracking';
import { Util } from './../common/util';
import { GridConfig } from '../models/gridconfig';
import { DataSet } from './dataset';
import { bindable, BindingEngine, autoinject, computedFrom } from 'aurelia-framework';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { SortOrder } from 'common/gridenums';
import * as _ from 'lodash';

@autoinject
export class Grid {
  //@bindable data: DataGrid<any, any>;
  @bindable
  dataSet: DataSet<any, any>;

  @bindable 
  data: Array<any>;

  @bindable 
  config: GridConfig;

  @bindable 
  cssClass: string;

  tracking: DragHandleTracking;

  private _pageData: PageData;
  get pageData(): PageData {
    return this._pageData;
  }

  get footerColspan() {
    return this.dataSet.visibleColumns - 1;
  }

  @computedFrom('pageData.selectedPage','pageData.recordsPerPage')
  get pageRows():Map<any, any> {
    const startIdx = this._pageData.selectedPage == 1 ? 0 : (this._pageData.selectedPage-1) * this._pageData.recordsPerPage;
    const arr = Array.from(this.dataSet.rows).slice(startIdx, startIdx + this._pageData.recordsPerPage);
    return new Map(arr);
  }

  //icons
  upArrow = faArrowUp;
  downArrow = faArrowDown;

  get getUuid(): string {
    return Util.getUuid();
  }

  constructor(private bindingEngine: BindingEngine) {
  }

  bind() {
    this.dataSet = new DataSet<number, any>(this.bindingEngine);
    this.dataSet.config = this.config;
    this.dataSet.addRows(this.data);

    this._pageData = new PageData(this.dataSet);
    this._pageData.recordsPerPage = this.config.recordsPerPage;
  }

  dragHandleMouseDown(event: MouseEvent, index: number) {
    const elem = event.target as Element;
    const elemUuid = elem.id;

    this.tracking = new DragHandleTracking();
    this.tracking.curElem = elem.parentElement;
    this.tracking.nextElem = this.tracking.curElem.nextElementSibling;
    this.tracking.pageX = event.pageX;
    this.tracking.curWidth = (this.tracking.curElem as any).offsetWidth;

    if(this.tracking.nextElem)
      this.tracking.nextWidth = (this.tracking.nextElem as any).offsetWidth;
  }

  dragHandleMouseMove(event: MouseEvent) {
    if(!this.tracking) return;

    if(this.tracking.curElem){
      let diffX = event.pageX - this.tracking.pageX;

      if(this.tracking.nextElem) {
        (this.tracking.nextElem as any).style.width = (this.tracking.nextWidth - (diffX))+'px';
      }

      (this.tracking.curElem as any).style.width = (this.tracking.curWidth + diffX) + 'px';
    }
  }

  dragHandleMouseUp(event: MouseEvent) {
    if(!this.tracking) return;

    this.tracking = undefined;
  }

  columnHeaderClick(event:MouseEvent, elem) {
    const target = event.target as HTMLElement;
    if(target.tagName !== 'TH') return;

    const columnConfig = (elem.config as ColumnConfig);
    if(columnConfig.canOrder) {
      if(columnConfig.order === SortOrder.NONE) {
        this.resetColumnOrder(elem.fieldName);

        columnConfig.order = SortOrder.ASC;
        this.data = _.orderBy(this.data, elem.fieldName, columnConfig.order as any);
        this.dataSet.rows.clear();
        this.dataSet.addRows(this.data);
      }
      else if(columnConfig.order === SortOrder.ASC) {
        this.resetColumnOrder(elem.fieldName);

        columnConfig.order = SortOrder.DESC;
        this.data = _.orderBy(this.data, elem.fieldName, columnConfig.order as any);
        this.dataSet.rows.clear();
        this.dataSet.addRows(this.data);
      }
      else if(columnConfig.order === SortOrder.DESC) {
        this.resetColumnOrder(elem.fieldName);

        columnConfig.order = SortOrder.ASC;
        this.data = _.orderBy(this.data, elem.fieldName, columnConfig.order as any);
        this.dataSet.rows.clear();
        this.dataSet.addRows(this.data);
      }

      this._pageData.selectedPage = new Number(1) as number;
    }
  }

  cellRightClick(event:MouseEvent, elem) {
    console.log(elem);
    const cell = elem.cell as DataCell<any>;
    cell.inEditMode = !cell.inEditMode;
  }

  firstPage() {
    this.pageData.selectedPage = 1;
  }

  prevPage() {
    if(this.pageData.selectedPage > 1)
      this.pageData.selectedPage--;
  }

  nextPage() {
    if(this.pageData.selectedPage < this.pageData.numPages)
      this.pageData.selectedPage++;
  }

  lastPage() {
    this.pageData.selectedPage = this.pageData.numPages;
  }

  private resetColumnOrder(fieldname: string) {
    this.config.columns.forEach((item, key) => {
      item.order = SortOrder.NONE;
    });
  }


}
