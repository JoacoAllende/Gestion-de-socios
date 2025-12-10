import { Component } from '@angular/core';
import { CellClickedEvent, ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { DailyBoxService } from '../../services/daily-box.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { AgTableComponent } from '../commons/ag-table/ag-table.component';
import { ButtonComponent } from '../commons/button/button.component';
import { MonthSelectorComponent } from '../commons/month-selector/month-selector.component';

@Component({
  selector: 'app-daily-box',
  imports: [AgTableComponent, ButtonComponent, MonthSelectorComponent],
  templateUrl: './daily-box.component.html',
  styleUrl: './daily-box.component.scss'
})
export class DailyBoxComponent {
  public gridApi!: GridApi;
  anio: number = new Date().getFullYear();

  rowData: any[] = [];
  gridStyle = {
    width: '100%',
    height: 'calc(100% - 2rem - 70px)'
  };

  defaultColDef: ColDef = { flex: 1, resizable: true };

  colDefs: (ColDef | ColGroupDef)[] = [
    {
      field: 'fecha',
      headerName: 'Fecha',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      minWidth: 50
    },
    {
      field: 'concepto',
      headerName: 'Concepto',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellClass: 'ag-cell-clickable',
      minWidth: 800,
      onCellClicked: (event: CellClickedEvent) => {
        this.router.navigate([`/movimiento-caja/${event.data.id}`]);
      }
    },
    {
      field: 'monto_ingreso',
      headerName: 'Ingreso efectivo',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) =>
        params.value ? `$ ${params.value.toLocaleString('es-AR')}` : '❌'
    },
    {
      field: 'monto_egreso',
      headerName: 'Egreso efectivo',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) =>
        params.value ? `$ ${params.value.toLocaleString('es-AR')}` : '❌'
    },
    {
      field: 'monto_transferencia',
      headerName: 'Banco',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) =>
        params.value ? `$ ${params.value.toLocaleString('es-AR')}` : '❌'
    },
    {
      field: 'saldo',
      headerName: 'Saldo',
      valueFormatter: (params) => `$ ${params.value?.toLocaleString('es-AR') || 0}`
    },
  ];

  constructor(
    private dailyBoxService: DailyBoxService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) { }

  ngOnInit() {
    const anioParam = this.route.snapshot.paramMap.get('anio');
    this.anio = anioParam ? Number(anioParam) : new Date().getFullYear();

    this.loadData();
  }

  loadData() {
    this.dailyBoxService.getDailyBox(this.anio).subscribe({
      next: (data) => {
        this.rowData = data.map(movement => movement);
      },
      error: (err) => {
        this.toast.show(err.error?.message, 'error');
      }
    });
  }

  onYearChange = (event: { anio: number }) => {
    this.anio = event.anio;
    this.router.navigate(['/caja', this.anio]);
    this.loadData();
  }

  public createMovement = () => {
    this.router.navigate(['/movimiento-caja']);
  }

}
