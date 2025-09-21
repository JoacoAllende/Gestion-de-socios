import { Component } from '@angular/core';
import { CellClickedEvent, CellRendererSelectorResult, ColDef, ColGroupDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { EmployeesService } from '../../services/employees.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { AgTableComponent } from '../commons/ag-table/ag-table.component';
import { ButtonComponent } from '../commons/button/button.component';
import { CheckboxCellComponent } from '../commons/ag-table/checkbox-cell/checkbox-cell.component';

@Component({
  selector: 'app-employees',
  imports: [AgTableComponent, ButtonComponent],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent {
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
      headerName: 'Empleado',
      children: [
        {
          field: 'nombre',
          headerName: 'Nombre',
          pinned: 'left',
          sortable: true,
          filter: 'agTextColumnFilter',
          floatingFilter: true,
          cellClass: 'ag-cell-clickable',
          onCellClicked: (event: CellClickedEvent) => {
            const baseRoute = event.data.activo ? 'empleado' : 'empleado-alta';
            this.router.navigate([`/${baseRoute}/${event.data.id}`]);
          }
        },
        {
          field: 'monto',
          headerName: 'Monto',
          pinned: 'left',
          sortable: true,
          width: 120,
          tooltipValueGetter: (params) => {
            return params.data.detalles
          },
          cellClass: (params) => params.data?.detalles ? 'has-tooltip' : '',
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


  constructor(private employeesService: EmployeesService, private toast: ToastService, private router: Router) {
    this.procesarPagos = this.procesarPagos.bind(this);
    const pagosGroup = this.colDefs.find(c => (c as ColGroupDef).headerName === 'Pagos') as ColGroupDef;
    pagosGroup.children = this.meses.map<ColDef>(mes => ({
      field: mes,
      headerName: mes.charAt(0).toUpperCase() + mes.slice(1),
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      cellRendererParams: { mode: 'single' },
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
    this.employeesService.getEmployees().subscribe({
      next: (data) => {
        this.rowData = data.map(employee => {
          employee._selectedMonths = {};
          this.meses.forEach(mes => {
            employee[mes] = employee[mes];
          });
          return employee;
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

  public createEmployee = () => {
    this.router.navigate(['/empleado']);
  }

  public procesarPagos() {
    const seleccionados = this.rowData
      .map(row => {
        const meses = row._selectedMonths ?? {};
        const mesesFiltrados = Object.fromEntries(
          Object.entries(meses).filter(([_, value]) => value === true || value === false)
        );
        return { employeeId: row.id, meses: mesesFiltrados };
      })
      .filter(r => Object.keys(r.meses).length > 0);
    if (seleccionados.length === 0) return;

    this.employeesService.updatePayments(seleccionados).subscribe((res: any) => {
      this.toast.show(res.status, 'success')
      this.employeesService.getEmployees().subscribe({
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
