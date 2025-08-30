import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

export interface MenuItem {
  label: string;
  action?: () => void;
  children?: MenuItem[];
}

@Component({
  selector: 'app-dynamic-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './dynamic-menu.component.html',
  styleUrls: ['./dynamic-menu.component.scss']
})
export class DynamicMenuComponent {
  items: MenuItem[];

  constructor(private router: Router) {
    this.items = [
      { 
        label: 'Socios', 
        action: () => this.router.navigate(['/socio'])
      },
      { 
        label: 'Pagos', 
        action: () => this.router.navigate(['/pagos'])
      }
    ];
  }

  getSubMenu(item: MenuItem): MenuItem[] {
    return item.children || [];
  }

  onClick(item: MenuItem) {
    if (item.action) {
      item.action();
    }
  }
}
