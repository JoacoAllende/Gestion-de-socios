import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-month-selector',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './month-selector.component.html',
  styleUrl: './month-selector.component.scss'
})
export class MonthSelectorComponent {
  @Input() mes: number = new Date().getMonth() + 1;
  @Input() anio: number = new Date().getFullYear();
  @Output() change = new EventEmitter<{ mes: number; anio: number }>();

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  getMonthName(mes: number): string {
    return this.meses[mes - 1] || '';
  }

  prevMonth = () => {
    if (this.mes === 1) {
      this.mes = 12;
      this.anio--;
    } else {
      this.mes--;
    }
    this.emitChange();
  }

  nextMonth = () => {
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