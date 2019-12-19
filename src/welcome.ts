import { Test } from './models/test';
import { GridConfig } from './models/gridconfig';
import { DataGrid } from './datagrid/datagrid';
import { computedFrom, autoinject, BindingEngine, bindable } from 'aurelia-framework';
import { ColumnConfig } from 'models/columnconfig';
import { SortOrder } from 'common/gridenums';

@autoinject
export class Welcome {
  public heading: string = 'Welcome to the Aurelia Navigation App!';
  public firstName: string = 'John';
  public lastName: string = 'Doe';
  private previousValue: string = this.fullName;
  records: Array<Test> = new Array();

  config = new GridConfig('id');
  
  constructor(bindingEngine: BindingEngine) {
    for(let i=1; i<= 100; ++i) {
      this.records.push({id: i, name: 'person' + i, surname: 'psurname ' + i, age: Math.ceil(Math.random() * 90)});
    } 

    this.config.clear();
    this.config.addColumn('id', new ColumnConfig(false, 'Id', false, false, true));
    this.config.addColumn('name', new ColumnConfig(true, 'Name', false, true, true));
    this.config.addColumn('surname', new ColumnConfig(true, 'Surname', false, true, true));
    this.config.addColumn('age', new ColumnConfig(true, 'Age', false, true, true));
  }

  // Getters can't be directly observed, so they must be dirty checked.
  // However, if you tell Aurelia the dependencies, it no longer needs to dirty check the property.
  @computedFrom('firstName', 'lastName')
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public submit() {
    this.previousValue = this.fullName;
    alert(`Welcome, ${this.fullName}!`);
  }

  public canDeactivate(): boolean | undefined {
    if (this.fullName !== this.previousValue) {
      return confirm('Are you sure you want to leave?');
    }
  }
}

export class UpperValueConverter {
  public toView(value: string): string {
    return value && value.toUpperCase();
  }
}
