import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() text: string = '';
  @Input() onClick: () => void = () => { };
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  handleClick(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (!this.disabled && this.onClick) {
      this.onClick();
    }
  }
}
