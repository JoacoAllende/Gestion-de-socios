import { Component } from '@angular/core';
import { CellClickedEvent, ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { EventsService } from '../../services/events.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { AgTableComponent } from '../commons/ag-table/ag-table.component';
import { ButtonComponent } from '../commons/button/button.component';

@Component({
  selector: 'app-movement-details',
  imports: [AgTableComponent, ButtonComponent],
  templateUrl: './movement-details.component.html',
  styleUrl: './movement-details.component.scss'
})
export class MovementDetailsComponent {
  public gridApi!: GridApi;
  movementId!: number;
  eventId!: number;
  movementConcept: string = '';

  rowData: any[] = [];
  gridStyle = {
    width: '100%',
    height: 'calc(100% - 2rem - 100px)'
  };

  defaultColDef: ColDef = { flex: 1, resizable: true };

  colDefs: (ColDef | ColGroupDef)[] = [
    {
      field: 'tipo',
      headerName: 'Tipo',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      cellStyle: (params): any => {
        return params.value === 'INGRESO'
          ? { color: 'green', fontWeight: 'bold' }
          : { color: 'red', fontWeight: 'bold' };
      },
      minWidth: 120
    },
    {
      field: 'concepto',
      headerName: 'Concepto',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellClass: 'ag-cell-clickable',
      minWidth: 300,
      onCellClicked: (event: CellClickedEvent) => {
        this.router.navigate([`/movimiento/${this.movementId}/detalle/${event.data.id}`]);
      }
    },
    {
      field: 'monto',
      headerName: 'Monto',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) => `$ ${params.value?.toLocaleString('es-AR') || 0}`,
      minWidth: 150
    },
    {
      field: 'medio_pago',
      headerName: 'Medio',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      minWidth: 120
    },
    {
      field: 'pagado',
      headerName: 'Pagado',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) => params.value ? 'Sí' : 'No',
      cellStyle: (params): any => {
        return params.value
          ? { color: 'green', fontWeight: 'normal' }
          : { color: 'orange', fontWeight: 'bold' };
      },
      minWidth: 100
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
      field: 'fecha_pago',
      headerName: 'F. Pago',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      minWidth: 120
    },
    {
      headerName: '',
      field: 'acciones',
      sortable: false,
      filter: false,
      cellRenderer: () => '<span style="cursor: pointer;">🗑️</span>',
      cellClass: 'ag-cell-clickable',
      maxWidth: 80,
      onCellClicked: (event: CellClickedEvent) => {
        this.confirmDeleteDetail(event.data);
      }
    }
  ];

  constructor(
    private eventsService: EventsService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.movementId = Number(this.route.snapshot.paramMap.get('movementId'));
    this.loadDetails();
  }

  loadDetails() {
    this.eventsService.getDetailsByMovement(this.movementId).subscribe({
      next: (data) => {
        this.rowData = data;
        if (data.length > 0) {
          this.movementConcept = data[0].concepto;
          this.eventId = data[0].evento_id;
        }
      },
      error: (err) => {
        this.toast.show(err.error?.message, 'error');
      }
    });
  }

  confirmDeleteDetail(detail: any) {
    const mensaje = `¿Eliminar el detalle "${detail.concepto}" por $${detail.monto?.toLocaleString('es-AR')}? Esto recalculará el monto total del movimiento.`;

    if (!confirm(mensaje)) return;

    this.eventsService.deleteDetail(detail.id).subscribe({
      next: (res) => {
        this.toast.show(res.status, 'success');
        this.loadDetails();
      },
      error: (err) => {
        this.toast.show(err.error?.sqlMessage || err.error?.message, 'error');
      }
    });
  }

  public createDetail = () => {
    this.router.navigate([`/movimiento/${this.movementId}/detalle`]);
  }

  public goBack = () => {
    this.router.navigate([`/evento/${this.eventId}/movimientos`]);
  }
}
