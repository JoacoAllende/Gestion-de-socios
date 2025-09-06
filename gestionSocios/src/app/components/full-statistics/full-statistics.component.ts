import { Component, OnInit } from '@angular/core';
import { ColDef, ColGroupDef, GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import { AgTableComponent } from '../commons/ag-table/ag-table.component';
import { MembershipService } from '../../services/membership.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-full-statistics',
  standalone: true,
  imports: [AgTableComponent],
  templateUrl: './full-statistics.component.html',
  styleUrls: ['./full-statistics.component.scss']
})
export class FullStatisticsComponent implements OnInit {
  public gridApi!: GridApi;

  rowData: any[] = [];
  pinnedBottomRowData: any[] = [];

  meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

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
    { headerName: 'Pagos', children: [] }
  ];

  constructor(private membershipService: MembershipService, private router: Router) {
    const pagosGroup = this.colDefs.find(
      c => (c as ColGroupDef).headerName === 'Pagos'
    ) as ColGroupDef;
    pagosGroup.children = this.meses.map<ColDef>(mes => ({
      field: mes,
      headerName: mes.charAt(0).toUpperCase() + mes.slice(1),
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      cellRenderer: (params: ICellRendererParams) => {
        if (params.node?.rowPinned) {
          return `$ ${params.value?.toLocaleString('es-AR') || 0}`;
        }
        if (params.value == null) {
          return '❌';
        }
        if (params.value === -1) {
          return `$ ${(0).toLocaleString('es-AR')}`;
        }
        if (params.value > 0) {
          return params.value;
        }
        return params.value;
      }
    }));

  }

  ngOnInit() {
    this.membershipService.getMemberships().subscribe(data => {
      this.rowData = data.map(membership => {
        membership._selectedMonths = {};
        this.meses.forEach(mes => {
          membership[mes] = membership[mes];
        });
        return membership;
      });
    });
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.updateVisibleTotals();
    this.gridApi.addEventListener('filterChanged', () => this.updateVisibleTotals());
    this.gridApi.addEventListener('sortChanged', () => this.updateVisibleTotals());
  }

  updateVisibleTotals() {
    if (!this.gridApi) return;
    const totals: any = {};
    this.gridApi.forEachNodeAfterFilterAndSort(node => {
      if (!node.data) return;
      Object.keys(node.data).forEach(key => {
        if (['nombre', 'nro_socio', 'dni'].includes(key)) return;
        let v = node.data[key];
        if (v === -1) v = 0;
        if (typeof v === 'number') totals[key] = (totals[key] || 0) + v;
      });
    });
    totals['nombre'] = 'Totales';
    this.pinnedBottomRowData = [totals];
  }

  exportCsv() {
    if (this.gridApi) this.gridApi.exportDataAsCsv({ allColumns: true });
  }

  public createMembership = () => {
    this.router.navigate(['/socio']);
  }

  private boolRenderer(params: ICellRendererParams) {
    if (params.node?.rowPinned) return params.value;
    return params.value ? '✅' : '❌';
  }
}
