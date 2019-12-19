import { DataCell } from './../models/datacell';
import { ColumnConfig } from 'models/columnconfig';
import { DragHandleTracking } from './../models/draghandletracking';
import { Util } from './../common/util';
import { GridConfig } from '../models/gridconfig';
import { DataGrid } from './datagrid';
import { bindable, BindingEngine, autoinject } from 'aurelia-framework';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { SortOrder } from 'common/gridenums';
import * as _ from 'lodash';

@autoinject
export class Grid {
  //@bindable data: DataGrid<any, any>;
  dataSet: DataGrid<any, any>;

  @bindable 
  data: Array<any>;

  @bindable 
  config: GridConfig;

  @bindable 
  cssClass: string;

  tracking: DragHandleTracking;

  //icons
  upArrow = faArrowUp;
  downArrow = faArrowDown;

  get getUuid(): string {
    return Util.getUuid();
  }

  constructor(private bindingEngine: BindingEngine) {
  }

  bind() {
    this.dataSet = new DataGrid<number, any>(this.bindingEngine);
    this.dataSet.config = this.config;
    this.dataSet.addRows(this.data);
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

        columnConfig.order = SortOrder.NONE;
        this.dataSet.rows.clear();
        this.dataSet.addRows(this.data);
      }
    }
  }

  cellRightClick(event:MouseEvent, elem) {
    console.log(elem);
    const cell = elem.cell as DataCell<any>;
    cell.inEditMode = !cell.inEditMode;
  }

  private resetColumnOrder(fieldname: string) {
    this.config.columns.forEach((item, key) => {
      item.order = SortOrder.NONE;
    });
  }


}
