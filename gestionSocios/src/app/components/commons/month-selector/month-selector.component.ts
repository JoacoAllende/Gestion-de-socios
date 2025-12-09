import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-month-selector',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './month-selector.component.html',
  styleUrl: './month-selector.component.scss'
})
export class MonthSelectorComponent {
  @Input() mes?: number;
  @Input() anio: number = new Date().getFullYear();
  @Input() showMonth: boolean = true;
  @Output() change = new EventEmitter<{ mes?: number; anio: number }>();

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  ngOnInit() {
    if (this.showMonth && this.mes === undefined) {
      this.mes = new Date().getMonth() + 1;
    }
  }

  getMonthName(mes?: number): string {
    if (mes === undefined) return '';
    return this.meses[mes - 1] || '';
  }

  prevMonth = () => {
    if (!this.showMonth || this.mes === undefined) return;
    
    if (this.mes === 1) {
      this.mes = 12;
      this.anio--;
    } else {
      this.mes--;
    }
    this.emitChange();
  }

  nextMonth = () => {
    if (!this.showMonth || this.mes === undefined) return;
    
    if (this.mes === 12) {
      this.mes = 1;
      this.anio++;
    } else {
      this.mes++;
    }
    this.emitChange();
  }

  prevYear = () => {
    this.anio--;
    this.emitChange();
  }

  nextYear = () => {
    this.anio++;
    this.emitChange();
  }

  private emitChange() {
    this.change.emit({ mes: this.mes, anio: this.anio });
  }
}
