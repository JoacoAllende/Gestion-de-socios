import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

interface CustomRendererParams extends ICellRendererParams {
  cellRendererParams?: {
    mode?: 'dual' | 'single';
  };
  mode?: 'dual' | 'single';
}

@Component({
  selector: 'app-checkbox-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox-cell.component.html'
})
export class CheckboxCellComponent implements ICellRendererAngularComp {
  public params!: CustomRendererParams;
  public mode: 'dual' | 'single' = 'dual';

  agInit(params: CustomRendererParams): void {
    this.params = params;
    this.mode = params.mode || params.cellRendererParams?.mode || 'dual';
  }

  refresh(params: CustomRendererParams): boolean {
    this.params = params;
    this.mode = params.mode || params.cellRendererParams?.mode || 'dual';
    return true;
  }

  isSelected(option: 'yes' | 'no'): boolean {
    const row = this.params.data;
    const monthKey = this.params.colDef?.field as string;
    if (!monthKey) return false;

    const meses = row._selectedMonths ?? {};
    return meses[monthKey] === (option === 'yes');
  }

  toggleSelection(event: any, option: 'yes' | 'no') {
    if (this.mode === 'single') return;
    const row = this.params.data;
    const monthKey = this.params.colDef?.field as string;
    if (!monthKey) return;

    if (!row._selectedMonths) row._selectedMonths = {};

    if (event.target.checked) {
      row._selectedMonths[monthKey] = option === 'yes';
    } else {
      delete row._selectedMonths[monthKey];
    }
  }

  toggleSingleSelection(event: any) {
    if (this.mode !== 'single') return;

    const row = this.params.data;
    const monthKey = this.params.colDef?.field as string;
    if (!monthKey) return;

    if (!row._selectedMonths) row._selectedMonths = {};

    if (event.target.checked) {
      row._selectedMonths[monthKey] = true;
    } else {
      delete row._selectedMonths[monthKey];
    }
  }
}
