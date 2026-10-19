import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

interface CustomRendererParams extends ICellRendererParams {
  cellRendererParams?: {
    mode?: 'dual' | 'single';
    allowUnmark?: boolean | (() => boolean);
    unmarkValue?: boolean | string;
  };
  mode?: 'dual' | 'single';
  allowUnmark?: boolean | (() => boolean);
  unmarkValue?: boolean | string;
}

@Component({
  selector: 'app-checkbox-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox-cell.component.html',
  styleUrl: './checkbox-cell.component.scss'
})
export class CheckboxCellComponent implements ICellRendererAngularComp {
  public params!: CustomRendererParams;
  public mode: 'dual' | 'single' = 'dual';
  private unmarkSource: boolean | (() => boolean) = false;
  // Valor que marca un pago a desmarcar. En modo dual false ya significa "transferencia".
  private unmarkValue: boolean | string = false;

  get allowUnmark(): boolean {
    return typeof this.unmarkSource === 'function' ? this.unmarkSource() : this.unmarkSource;
  }

  agInit(params: CustomRendererParams): void {
    this.setParams(params);
  }

  refresh(params: CustomRendererParams): boolean {
    this.setParams(params);
    return true;
  }

  private setParams(params: CustomRendererParams) {
    this.params = params;
    this.mode = params.mode || params.cellRendererParams?.mode || 'dual';
    this.unmarkSource = params.allowUnmark ?? params.cellRendererParams?.allowUnmark ?? false;
    this.unmarkValue = params.unmarkValue ?? params.cellRendererParams?.unmarkValue ?? false;
  }

  isUnmarked(): boolean {
    const monthKey = this.params.colDef?.field as string;
    if (!monthKey) return false;
    return (this.params.data._selectedMonths ?? {})[monthKey] === this.unmarkValue;
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

  toggleUnmark(event: any) {
    const row = this.params.data;
    const monthKey = this.params.colDef?.field as string;
    if (!monthKey) return;

    if (!row._selectedMonths) row._selectedMonths = {};

    if (event.target.checked) {
      delete row._selectedMonths[monthKey];
    } else {
      row._selectedMonths[monthKey] = this.unmarkValue;
    }
  }
}
