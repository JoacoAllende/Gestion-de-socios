import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicMenuComponent } from './components/dynamic-menu/dynamic-menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DynamicMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
}
