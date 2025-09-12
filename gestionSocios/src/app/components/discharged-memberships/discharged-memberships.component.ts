import { Component, OnInit } from '@angular/core';
import { ColDef, ColGroupDef, GridApi, GridReadyEvent, ICellRendererParams, CellClickedEvent } from 'ag-grid-community';
import { AgTableComponent } from '../commons/ag-table/ag-table.component';
import { MembershipService } from '../../services/membership.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-discharged-membership',
  standalone: true,
  imports: [AgTableComponent],
  templateUrl: './discharged-memberships.component.html',
  styleUrls: ['./discharged-memberships.component.scss']
})
export class DischargedMembershipsComponent implements OnInit {
  public gridApi!: GridApi;

  rowData: any[] = [];

  defaultColDef: ColDef = { flex: 1, minWidth: 100, resizable: true };

  colDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Socio',
      children: [
        {
          field: 'nro_socio',
          headerName: 'Nro Socio',
          pinned: 'left',
          width: 50,
          sortable: true,
          filter: 'agNumberColumnFilter',
          floatingFilter: true,
          cellClass: 'ag-cell-clickable',
          onCellClicked: (event: CellClickedEvent) => {
            this.router.navigate([`/socio-alta/${event.data.nro_socio}`]);
          }
        },
        {
          field: 'nombre',
          headerName: 'Nombre',
          pinned: 'left',
          sortable: true,
          filter: 'agTextColumnFilter',
          floatingFilter: true
        },
      ]
    },
    {
      headerName: 'Datos',
      children: [
        {
          field: 'direccion',
          headerName: 'Dirección',
          sortable: true,
          filter: 'agTextColumnFilter',
          floatingFilter: true,
          minWidth: 300,
        },
        {
          field: 'dni',
          headerName: 'DNI',
          sortable: true,
          filter: 'agTextColumnFilter',
          floatingFilter: true
        },
        {
          field: 'fecha_nacimiento',
          headerName: 'Nacimiento',
          sortable: true,
        },
        {
          field: 'contacto',
          headerName: 'Contacto',
          sortable: true,
          filter: 'agTextColumnFilter',
          floatingFilter: true
        },
      ]
    },
    {
      headerName: 'Condición',
      children: [
        {
          field: 'cuota_activa',
          headerName: 'Activo',
          sortable: true,
          filter: true,
          floatingFilter: true,
          cellRenderer: this.boolRenderer,
        },
        {
          field: 'cuota_pasiva',
          headerName: 'Pasivo',
          sortable: true,
          filter: true,
          floatingFilter: true,
          cellRenderer: this.boolRenderer,
        },
        {
          field: 'descuento_familiar',
          headerName: 'Familiar',
          sortable: true,
          filter: true,
          floatingFilter: true,
          cellRenderer: this.boolRenderer,
        },
        {
          field: 'becado',
          headerName: 'Becado',
          sortable: true,
          filter: true,
          floatingFilter: true,
          cellRenderer: this.boolRenderer,
        },
      ]
    },
    {
      headerName: 'Actividad',
      children: [
        { field: 'futbol', headerName: 'Fútbol', filter: true, floatingFilter: true, cellRenderer: this.boolRenderer },
        { field: 'paleta', headerName: 'Paleta', filter: true, floatingFilter: true, cellRenderer: this.boolRenderer },
        { field: 'basquet', headerName: 'Básquet', filter: true, floatingFilter: true, cellRenderer: this.boolRenderer },
      ]
    },
    {
      headerName: 'Categorías',
      children: [
        { field: 'categoria_futbol', headerName: 'Fútbol', filter: 'agTextColumnFilter', floatingFilter: true },
        { field: 'categoria_paleta', headerName: 'Paleta', filter: 'agTextColumnFilter', floatingFilter: true },
        { field: 'categoria_basquet', headerName: 'Básquet', filter: 'agTextColumnFilter', floatingFilter: true }
      ]
    },
  ];

  constructor(private membershipService: MembershipService, private router: Router, private toast: ToastService) { }

  ngOnInit() {
    this.membershipService.getDischargedMemberships().subscribe({
      next: (data) => {
        this.rowData = data.map(membership => membership);
      },
      error: (err) => {
        this.toast.show(err.error?.message, 'error');
      }
    });

  }

  exportCsv() {
    if (this.gridApi) this.gridApi.exportDataAsCsv({ allColumns: true });
  }

  private boolRenderer(params: ICellRendererParams) {
    if (params.node?.rowPinned) return params.value;
    return params.value ? '✅' : '❌';
  }
}
