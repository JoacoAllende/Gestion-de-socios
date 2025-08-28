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

  isSelected(): boolean {
    const mes = this.params.colDef?.field;
    if (!mes) return false;
    return this.params.data._selectedMonths?.[mes] ?? false;
  }

  toggleSelection(event: Event): void {
    const mes = this.params.colDef?.field;
    if (!mes) return;

    const row = this.params.data;
    row._selectedMonths ??= {};
    row._selectedMonths[mes] = (event.target as HTMLInputElement).checked;

    row._checkedByUser ??= {};
    if (!this.params.value?.pagado) {
      row._checkedByUser[mes] = (event.target as HTMLInputElement).checked;
    }

    this.params.api.refreshCells({ rowNodes: [this.params.node], columns: [mes] });
  }
}
