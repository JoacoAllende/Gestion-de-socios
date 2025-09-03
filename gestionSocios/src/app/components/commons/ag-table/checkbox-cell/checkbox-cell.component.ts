import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-checkbox-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox-cell.component.html'
})
export class CheckboxCellComponent implements ICellRendererAngularComp {
  public params!: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
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
    const row = this.params.data;
    const monthKey = this.params.colDef?.field as string;
    if (!monthKey) return;

    if (!row._selectedMonths) row._selectedMonths = {};

    if (event.target.checked) {
      row._selectedMonths[monthKey] = option === 'yes';
    } else {
      delete row._selectedMonths[monthKey];
    }

    if (option === 'yes' && row._selectedMonths[monthKey] === true) {
      row._selectedMonths[monthKey] = true;
    } else if (option === 'no' && row._selectedMonths[monthKey] === false) {
      row._selectedMonths[monthKey] = false;
    }
  }
}
