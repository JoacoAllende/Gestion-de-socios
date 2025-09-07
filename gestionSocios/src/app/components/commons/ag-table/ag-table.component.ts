import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  AllCommunityModule,
  ColDef, ColGroupDef, GridApi, GridReadyEvent, ModuleRegistry
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-ag-table',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './ag-table.component.html',
  styleUrls: ['./ag-table.component.scss']
})
export class AgTableComponent {
  public gridApi!: GridApi;

  @Input() rowData: any[] = [];
  @Input() colDefs: (ColDef | ColGroupDef)[] = [];
  @Input() defaultColDef: ColDef = { flex: 1, minWidth: 100, resizable: true };
  @Input() pinnedBottomRowData: any[] = [];
  @Input() gridStyle: { [klass: string]: any } = {
    width: '100%',
    height: 'calc(100% - 2rem)'
  };

  @Output() gridReadyEvent = new EventEmitter<GridReadyEvent>();


  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridReadyEvent.emit(params);
  }
}
