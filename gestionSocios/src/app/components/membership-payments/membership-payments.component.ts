import { Component, OnInit } from '@angular/core';
import { ColDef, ColGroupDef, GridApi, GridReadyEvent, ICellRendererParams, CellRendererSelectorResult, CellClickedEvent } from 'ag-grid-community';
import { AgTableComponent } from '../commons/ag-table/ag-table.component';
import { CheckboxCellComponent } from '../commons/ag-table/checkbox-cell/checkbox-cell.component';
import { ButtonComponent } from '../commons/button/button.component';
import { MembershipService } from '../../services/membership.service';
import { Router } from '@angular/router';
import { PaymentsService } from '../../services/payments.service';

@Component({
  selector: 'app-membership-payments',
  standalone: true,
  imports: [AgTableComponent, ButtonComponent],
  templateUrl: './membership-payments.component.html',
  styleUrls: ['./membership-payments.component.scss']
})
export class MembershipPaymentsComponent implements OnInit {
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
          field: 'socioId',
          headerName: 'Nro Socio',
          pinned: 'left',
          width: 50,
          sortable: true,
          filter: 'agNumberColumnFilter',
          floatingFilter: true,
          cellClass: 'ag-cell-clickable',
          onCellClicked: (event: CellClickedEvent) => {
            this.router.navigate([`/socio/${event.data.socioId}`]);
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
      headerName: 'Activo',
      children: [
        {
          field: 'descuento_familiar',
          headerName: 'Familiar',
          sortable: true,
          filter: true,
          floatingFilter: true,
          cellRenderer: this.boolRenderer,
        },
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
      headerName: 'Categoria',
      children: [
        { field: 'categoria', headerName: 'Categoría', filter: 'agTextColumnFilter', floatingFilter: true }
      ]
    },
    { headerName: 'Pagos', children: [] }
  ];


  constructor(private membershipService: MembershipService, private paymentsService: PaymentsService, private router: Router) {
    this.cargarPagosTransferencia = this.cargarPagosTransferencia.bind(this);
    this.cargarPagosEfectivo = this.cargarPagosEfectivo.bind(this);
    const pagosGroup = this.colDefs.find(c => (c as ColGroupDef).headerName === 'Pagos') as ColGroupDef;
    pagosGroup.children = this.meses.map<ColDef>(mes => ({
      field: mes,
      headerName: mes.charAt(0).toUpperCase() + mes.slice(1),
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      cellRendererSelector: (params): CellRendererSelectorResult | undefined => {
        if (params.node?.rowPinned) {
          return {
            component: (p: any) => `$ ${p.value?.toLocaleString('es-AR') || 0}`,
          };
        }
        return { component: CheckboxCellComponent };
      },
      valueFormatter: (p) => (typeof p.value === 'number' ? p.value : p.value ?? '')
    }));
  }


  ngOnInit() {
    this.membershipService.getMemberships().subscribe(data => {
      this.rowData = data.map(membership => {
        membership._selectedMonths = {};
        this.meses.forEach(mes => {
          let valor = membership[mes];
          membership[mes] = valor;
          membership._selectedMonths[mes] = valor && valor > 0 ? null : false;
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
        if (['nombre', 'socioId', 'dni'].includes(key)) return;
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

  public haySeleccion() {
    return this.rowData.some(r => Object.values(r._selectedMonths ?? {}).some(v => v));
  }


  private procesarPagos(efectivo: boolean) {
    const seleccionados = this.rowData
      .map(row => {
        const meses = row._selectedMonths ?? {};
        const mesesFiltrados = Object.fromEntries(
          Object.entries(meses).filter(([_, value]) => value)
        );
        return { socioId: row.socioId, meses: mesesFiltrados };
      })
      .filter(r => Object.keys(r.meses).length > 0);

    if (seleccionados.length === 0) return;

    this.paymentsService.updatePayments(seleccionados, efectivo).subscribe(() => {
      this.membershipService.getMemberships().subscribe(data => {
        this.rowData = data;
        this.gridApi?.refreshCells();
        this.updateVisibleTotals();
      });
    });
  }

  public cargarPagosEfectivo() { this.procesarPagos(true); }
  public cargarPagosTransferencia() { this.procesarPagos(false); }


  public createMembership = () => {
    this.router.navigate(['/socio']);
  }


  private boolRenderer(params: ICellRendererParams) {
    if (params.node?.rowPinned) return params.value;
    return params.value ? '✅' : '❌';
  }
}
