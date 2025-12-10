import { Component, OnInit } from '@angular/core';
import { ColDef, ColGroupDef, GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import { AgTableComponent } from '../commons/ag-table/ag-table.component';
import { MonthSelectorComponent } from '../commons/month-selector/month-selector.component';
import { MembershipService } from '../../services/membership.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-full-statistics',
  standalone: true,
  imports: [AgTableComponent, MonthSelectorComponent],
  templateUrl: './full-statistics.component.html',
  styleUrls: ['./full-statistics.component.scss']
})
export class FullStatisticsComponent implements OnInit {
  public gridApi!: GridApi;
  anio: number = new Date().getFullYear();

  rowData: any[] = [];
  pinnedBottomRowData: any[] = [];
  gridStyle = {
    width: '100%',
    height: 'calc(100% - 2rem - 70px)'
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
          field: 'ultimo_pago',
          headerName: 'Último Pago',
          pinned: 'left',
          width: 120,
          sortable: true,
          filter: 'agTextColumnFilter',
          floatingFilter: true,
          cellRenderer: (params: ICellRendererParams) => {
            if (params.node?.rowPinned) return '';
            if (!params.value) return '⚠️ Sin pagos';
            
            const [anio, mes] = params.value.split('-').map(Number);
            const mesesNombre = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                                 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const atraso = this.calcularMesesAtraso(params.value);
            
            if (atraso <= 0) {
              return `✅ ${mesesNombre[mes - 1]} ${anio}`;
            } else if (atraso <= 2) {
              return `⚠️ ${mesesNombre[mes - 1]} ${anio}`;
            } else {
              return `❌ ${mesesNombre[mes - 1]} ${anio}`;
            }
          }
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
        {
          field: 'ficha_socio',
          headerName: 'Ficha',
          sortable: true,
          filter: 'agTextColumnFilter',
          floatingFilter: true
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

  constructor(
    private membershipService: MembershipService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
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
    const anioParam = this.route.snapshot.paramMap.get('anio');
    this.anio = anioParam ? Number(anioParam) : new Date().getFullYear();

    this.loadData();
  }

  loadData() {
    this.membershipService.getMemberships(this.anio).subscribe({
      next: (data) => {
        this.rowData = data.map(membership => {
          membership._selectedMonths = {};
          this.meses.forEach(mes => {
            membership[mes] = membership[mes];
          });
          return membership;
        });

        setTimeout(() => {
          this.updateVisibleTotals();
        }, 100);
      },
      error: (err) => {
        this.toast.show(err.error?.message, 'error');
      }
    });
  }

  onYearChange = (event: { anio: number }) => {
    this.anio = event.anio;
    this.router.navigate(['/estadisticas', this.anio]);
    this.loadData();
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
    let rowCount = 0;
    this.gridApi.forEachNodeAfterFilterAndSort(node => {
      if (!node.data) return;
      rowCount++;
      Object.keys(node.data).forEach(key => {
        if (['nombre', 'nro_socio', 'dni', 'ultimo_pago'].includes(key)) return;
        let v = node.data[key];
        if (v === -1) v = 0;
        if (typeof v === 'number') totals[key] = (totals[key] || 0) + v;
      });
    });
    totals['nombre'] = `Totales (${rowCount})`;
    this.pinnedBottomRowData = [totals];
  }

  calcularMesesAtraso(ultimoPago: string): number {
    const [anio, mes] = ultimoPago.split('-').map(Number);
    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1;
    const anioActual = ahora.getFullYear();
    
    return (anioActual - anio) * 12 + (mesActual - mes);
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
