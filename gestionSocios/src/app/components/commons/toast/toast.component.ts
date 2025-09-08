import { Component, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { ToastMessage, ToastService } from '../../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  message: ToastMessage | null = null;
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe(msg => {
      this.message = msg;
      if (msg) {
        timer(3000).subscribe(() => this.message = null);
      }
    });
  }
}
