import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() text: string = '';
  @Input() onClick: () => void = () => {};
  @Input() disabled: boolean = false;

  handleClick(): void {
    if (!this.disabled && this.onClick) {
      this.onClick();
    }
  }
}
