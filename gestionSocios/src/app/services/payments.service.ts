import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  API_URI: string;
  headers: HttpHeaders;

  constructor(private http: HttpClient, globalService: GlobalService) {
    this.API_URI = globalService.API_URI;
    this.headers = new HttpHeaders().set("Authorization", "Bearer " + localStorage.getItem("ACCESS_TOKEN"));
  }

  updatePayments(anio: number, paymentsData: any) {
    const payload = { pagos: paymentsData };
    return this.http.put(`${this.API_URI}/payments/${anio}`, payload, { headers: this.headers });
  }

  initializeYear(anio: number) {
    return this.http.post<any>(`${this.API_URI}/payments/initialize-year/${anio}`, {}, { headers: this.headers });
  }

  recalculatePayments(anio: number, mes_desde: number) {
    return this.http.put<any>(`${this.API_URI}/payments/recalculate`, { anio, mes_desde }, { headers: this.headers });
  }
}
