import { Component } from '@angular/core';
import { CellClickedEvent, ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { EventsService } from '../../services/events.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { AgTableComponent } from '../commons/ag-table/ag-table.component';
import { ButtonComponent } from '../commons/button/button.component';

@Component({
  selector: 'app-events',
  imports: [AgTableComponent, ButtonComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent {
  public gridApi!: GridApi;

  rowData: any[] = [];
  gridStyle = {
    width: '100%',
    height: 'calc(100% - 2rem - 50px)'
  };

  defaultColDef: ColDef = { flex: 1, resizable: true };

  colDefs: (ColDef | ColGroupDef)[] = [
    {
      field: 'descripcion',
      headerName: 'Descripción',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellClass: 'ag-cell-clickable',
      minWidth: 400,
      onCellClicked: (event: CellClickedEvent) => {
        this.router.navigate([`/event/${event.data.id}`]);
      }
    },
    {
      field: 'fecha',
      headerName: 'Fecha',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      minWidth: 120
    },
    {
      field: 'total_movimientos',
      headerName: 'Total',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) =>
        `$ ${params.value?.toLocaleString('es-AR') || 0}`,
      minWidth: 150
    },
    {
      field: 'cantidad_movimientos',
      headerName: 'Movimientos',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      minWidth: 130
    },
    {
      field: 'finalizado',
      headerName: 'Estado',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) => params.value ? 'Finalizado' : 'Activo',
      cellStyle: (params) => {
        return params.value 
          ? { color: 'gray', fontWeight: 'normal' } 
          : { color: 'green', fontWeight: 'bold' };
      },
      minWidth: 120
    },
    {
      field: 'observaciones',
      headerName: 'Observaciones',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      minWidth: 300
    }
  ];

  constructor(
    private eventsService: EventsService, 
    private router: Router, 
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.eventsService.getEvents().subscribe({
      next: (data) => {
        this.rowData = data;
      },
      error: (err) => {
        this.toast.show(err.error?.message, 'error');
      }
    });
  }

  public createEvent = () => {
    this.router.navigate(['/evento']);
  }

}