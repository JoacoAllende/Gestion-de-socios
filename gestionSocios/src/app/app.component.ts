import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicMenuComponent } from './components/dynamic-menu/dynamic-menu.component';
import { ToastComponent } from './components/commons/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DynamicMenuComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
}
