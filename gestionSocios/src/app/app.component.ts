import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicMenuComponent } from './components/dynamic-menu/dynamic-menu.component';
import { ToastComponent } from './components/commons/toast/toast.component';
import { SpinnerComponent } from './components/commons/spinner/spinner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DynamicMenuComponent, ToastComponent, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
}
