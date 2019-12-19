import { SortOrder } from './../common/gridenums';
import * as _ from 'lodash';

export class ColumnConfig {
  heading?: string;
  canOrder?: boolean;
  visible: boolean;
  editable: boolean;
  resizeable: boolean;

  order: SortOrder = SortOrder.NONE;

  constructor(visible?: boolean, heading?: string, editable?: boolean, canOrder?: boolean, resizeable?: boolean) {
    this.heading = heading;

    if(!_.isNil(visible))
      this.visible = visible;
    else {
      if(heading)
        this.visible = true;
      else 
       this.visible = false;
    }

    this.editable = editable || false;
    this.canOrder = canOrder || false;
    this.resizeable = resizeable || false;
  }
}
