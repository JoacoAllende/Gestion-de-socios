import { Component } from '@angular/core';
import { CellClickedEvent, ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { EventsService } from '../../services/events.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { AgTableComponent } from '../commons/ag-table/ag-table.component';
import { ButtonComponent } from '../commons/button/button.component';

@Component({
  selector: 'app-event-movements',
  imports: [AgTableComponent, ButtonComponent],
  templateUrl: './event-movements.component.html',
  styleUrl: './event-movements.component.scss'
})
export class EventMovementsComponent {
  public gridApi!: GridApi;
  eventId!: number;
  eventDescription: string = '';

  rowData: any[] = [];
  gridStyle = {
    width: '100%',
    height: 'calc(100% - 2rem - 100px)'
  };

  defaultColDef: ColDef = { flex: 1, resizable: true };

  getRowStyle = (params: any) => {
    const montoCubierto = params.data.total_ingresos + params.data.egresos_pagados;

    if (params.data.total_egresos > 0 && montoCubierto < params.data.monto) {
      return { backgroundColor: '#ffe6e6' };
    }
    return undefined;
  };

  colDefs: (ColDef | ColGroupDef)[] = [
    {
      field: 'concepto',
      headerName: 'Concepto',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellClass: 'ag-cell-clickable',
      minWidth: 400,
      onCellClicked: (event: CellClickedEvent) => {
        this.router.navigate([`/evento/${this.eventId}/movimiento/${event.data.id}`]);
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
      field: 'total_ingresos',
      headerName: 'Ingresos',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) => `$ ${params.value?.toLocaleString('es-AR') || 0}`,
      minWidth: 150
    },
    {
      field: 'total_egresos',
      headerName: 'Egresos',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) => `$ ${params.value?.toLocaleString('es-AR') || 0}`,
      minWidth: 150
    },
    {
      field: 'cantidad_detalles',
      headerName: 'Detalles',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      cellClass: 'ag-cell-clickable',
      minWidth: 100,
      onCellClicked: (event: CellClickedEvent) => {
        this.router.navigate([`/movimiento/${event.data.id}/detalles`]);
      }
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
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));

    // Obtener info del evento
    this.eventsService.getEventById(this.eventId).subscribe({
      next: (event) => {
        this.eventDescription = event.descripcion;
      },
      error: (err) => {
        this.toast.show(err.error?.message, 'error');
      }
    });

    // Obtener movimientos
    this.eventsService.getMovementsByEvent(this.eventId).subscribe({
      next: (data) => {
        this.rowData = data;
      },
      error: (err) => {
        this.toast.show(err.error?.message, 'error');
      }
    });
  }

  public createMovement = () => {
    this.router.navigate([`/evento/${this.eventId}/movimiento`]);
  }

  public goBack = () => {
    this.router.navigate([`/eventos`]);
  }
}