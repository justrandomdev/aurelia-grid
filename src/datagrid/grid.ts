import { DataRow } from './../models/datarow';
import { SortOrder } from './../common/gridenums';
import { ColumnOptions } from './../models/columnoptions';
import { PageData } from './../models/pagedata';
import { DataCell } from './../models/datacell';
import { ColumnConfig } from 'models/columnconfig';
import { DragHandleTracking } from './../models/draghandletracking';
import { Util } from './../common/util';
import { GridConfig } from '../models/gridconfig';
import { DataSet } from './dataset';
import { bindable, BindingEngine, autoinject, computedFrom, ICollectionObserverSplice } from 'aurelia-framework';
import { faArrowUp, faArrowDown, faSearch } from '@fortawesome/free-solid-svg-icons'
import * as _ from 'lodash';
import { debug } from 'util';

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

  unfilteredData: Array<any>;

  //columnFilters: Map<string, string> = new Map();
  //columnSort: Map<string, SortOrder> = new Map();
  columnOptions: Map<string,ColumnOptions> = new Map();

  private _pageData: PageData;
  get pageData(): PageData {
    return this._pageData;
  }

  get footerColspan() {
    return this.dataSet.visibleColumns - 1;
  }

  @computedFrom('pageData.selectedPage','pageData.recordsPerPage')
  get pageRows():Map<any, any> {
    const startIdx = this._pageData.selectedPage == 1 ? 0 : (this._pageData.selectedPage-1) * parseInt(this._pageData.recordsPerPage);
    const arr = Array.from(this.dataSet.rows).slice(startIdx, startIdx + parseInt(this._pageData.recordsPerPage));
    return new Map(arr);
  }

  //icons
  upArrow = faArrowUp;
  downArrow = faArrowDown;
  search = faSearch;

  get getUuid(): string {
    return Util.getUuid();
  }

  constructor(private bindingEngine: BindingEngine) {
    let subscription = this.bindingEngine.collectionObserver(this.columnOptions)
      .subscribe(this.columnOptionsChanged.bind(this));

  }

  bind() {
    this.dataSet = new DataSet<number, any>(this.bindingEngine);
    this.dataSet.config = this.config;
    this.dataSet.addRows(this.data);

    this._pageData = new PageData(this.dataSet);
    this._pageData.recordsPerPage = this.config.recordsPerPage.toString();

    //Init column filters
    this.config.columns.forEach((v, fieldname) => {
      const options = new ColumnOptions();
      options.sortOrder = SortOrder.NONE;
      options.filterText = "";
      this.columnOptions.set(fieldname, options);
    });
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

    const columnOption = this.columnOptions.get(elem.fieldname);
    const newOption = new ColumnOptions();
    newOption.filterText = columnOption.filterText;

    if(columnOption.sortOrder === SortOrder.NONE) {
      this.resetColumnOrder();
      newOption.sortOrder = SortOrder.ASC;
    }
    else if(columnOption.sortOrder === SortOrder.ASC) {
      this.resetColumnOrder();
      newOption.sortOrder = SortOrder.DESC;
    }
    else if(columnOption.sortOrder === SortOrder.DESC) {
      this.resetColumnOrder();
      newOption.sortOrder = SortOrder.ASC;
    }

    this.columnOptions.set(elem.fieldname, newOption);
  }

  cellRightClick(event:MouseEvent, elem) {
    const cell = elem.cell as DataCell<any>;
    cell.inEditMode = !cell.inEditMode;
  }

  cellChanged(event, elem, id) {
    //Update unfiltered data
    let found = false;
    
    if(!_.isNil(this.unfilteredData)) {
      for(let i=0; i < this.unfilteredData.length && !found; ++i) {
        let item = this.unfilteredData[i];

        if(item[this.config.keyField] === id) {
          found = true;

          if(_.isString(item[elem.fieldname]) || _.isObject(item[elem.fieldname]))
            item[elem.fieldname] = event.target.value;
          else {
            if(_.isInteger(item[elem.fieldname]))
              item[elem.fieldname] = parseInt(event.target.value);
            else 
              item[elem.fieldname] = parseFloat(event.target.value);
          }
        }
      }
    }
  }

  getRowKeyValue(row: DataRow<any>) {
    return row.data[this.config.keyField];
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

  filter(event, elem) {
    const oldOptions = this.columnOptions.get(elem.key)
    const newOptions = new ColumnOptions();

    newOptions.sortOrder = oldOptions.sortOrder;
    newOptions.filterText = event.target.value;

    this.columnOptions.set(elem.key, newOptions);
    
    //Aurelia adds event.preventDefault() so the return true is required.
    return true;
  }

  columnOptionsChanged(splices: Array<ICollectionObserverSplice<Map<string, string>>>) {
    for (var i = 0; i < splices.length; i++) {
      //Theres a typedef issue here, hence the any
      const splice = splices[i] as any;

      if(splice.type == "update") {
        const updated = splice.object.get(splice.key) as ColumnOptions;
        const old = splice.oldValue as ColumnOptions;

        if(old.sortOrder !== updated.sortOrder) {
          this.data = _.orderBy(this.data, splice.key, updated.sortOrder as any);

          if(_.isNil(!this.unfilteredData))
            this.unfilteredData = _.orderBy(this.unfilteredData, splice.key, updated.sortOrder as any);

          this._pageData.selectedPage = new Number(1) as number;
        }
        else {
          if(old.filterText !== updated.filterText) {
            if(_.isNil(this.unfilteredData)) {
              //backup
              this.unfilteredData = _.cloneDeep(this.data);
            }
            else {
              //start fresh
              this.data = _.cloneDeep(this.unfilteredData);
            }
  
            //Build up filters
            let blankFilterCount = 0;
            let sortOrder = SortOrder.NONE;
            let sortKey = "";
            this.columnOptions.forEach((value,key) => { 
              if(value.filterText.length > 0) {
                this.data = _.filter(this.data, item => item[key].toString().includes(value.filterText));  
              }
              else {
                blankFilterCount++;
              }

              if(value.sortOrder !== SortOrder.NONE) {
                sortOrder = value.sortOrder;
                sortKey = key;
              }
            });

            //Preserve sort order
            if(sortOrder !== SortOrder.NONE) {
              this.data = _.orderBy(this.data, sortKey, sortOrder as any);
            }

            if(blankFilterCount === this.columnOptions.size) {
              this.unfilteredData = undefined;
            }
  
            this._pageData.selectedPage = new Number(this._pageData.selectedPage) as number;
          }
        }

        this.dataSet.rows.clear();
        this.dataSet.addRows(this.data);
      }
    }
  }

  private resetColumnOrder() {
    this.columnOptions.forEach((item, _) => {
      item.sortOrder = SortOrder.NONE;
    });
  }


}
