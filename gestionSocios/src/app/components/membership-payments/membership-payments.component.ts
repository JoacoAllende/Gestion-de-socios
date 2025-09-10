import { Component, OnInit } from '@angular/core';
import { ColDef, ColGroupDef, GridApi, GridReadyEvent, ICellRendererParams, CellRendererSelectorResult, CellClickedEvent } from 'ag-grid-community';
import { AgTableComponent } from '../commons/ag-table/ag-table.component';
import { CheckboxCellComponent } from '../commons/ag-table/checkbox-cell/checkbox-cell.component';
import { ButtonComponent } from '../commons/button/button.component';
import { MembershipService } from '../../services/membership.service';
import { PaymentsService } from '../../services/payments.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

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
  gridStyle = {
    width: '100%',
    height: 'calc(100% - 2rem - 50px)'
  };

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
          cellClass: 'ag-cell-clickable',
          onCellClicked: (event: CellClickedEvent) => {
            this.router.navigate([`/socio/${event.data.nro_socio}`]);
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
        {
          field: 'monto',
          headerName: 'Monto',
          pinned: 'left',
          sortable: true,
          width: 120,
          cellRendererSelector: (params): CellRendererSelectorResult | undefined => {
            if (params.node?.rowPinned) {
              return {
                component: (p: any) => `$ ${p.value?.toLocaleString('es-AR') || 0}`,
              };
            }
            return params.value;
          },
        },
      ]
    },
    { headerName: 'Pagos', children: [] }
  ];


  constructor(private membershipService: MembershipService, private paymentsService: PaymentsService, private toast: ToastService, private router: Router) {
    this.procesarPagos = this.procesarPagos.bind(this);
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
    this.membershipService.getMemberships().subscribe({
      next: (data) => {
        this.rowData = data.map(membership => {
          membership._selectedMonths = {};
          this.meses.forEach(mes => {
            membership[mes] = membership[mes];
          });
          return membership;
        });
      },
      error: (err) => {
        this.toast.show(err.error?.message, 'error');
      }
    });

  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.addEventListener('firstDataRendered', () => this.updateVisibleTotals());
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

  public haySeleccion(): boolean {
    return this.rowData.some(row =>
      Object.values(row._selectedMonths ?? {}).some(v => v === true || v === false)
    );
  }

  public procesarPagos() {
    const seleccionados = this.rowData
      .map(row => {
        const meses = row._selectedMonths ?? {};
        const mesesFiltrados = Object.fromEntries(
          Object.entries(meses).filter(([_, value]) => value === true || value === false)
        );
        return { socioId: row.nro_socio, meses: mesesFiltrados };
      })
      .filter(r => Object.keys(r.meses).length > 0);
    if (seleccionados.length === 0) return;

    this.paymentsService.updatePayments(seleccionados).subscribe((res: any) => {
      this.toast.show(res.status, 'success')
      this.membershipService.getMemberships().subscribe({
        next: (data) => {
          this.rowData = data;
          this.gridApi?.refreshCells();
          setTimeout(() => {
            this.updateVisibleTotals();
          });
        },
        error: (err) => {
          this.toast.show(err.error?.message, 'error');
        }
      });

    });
  }
}
