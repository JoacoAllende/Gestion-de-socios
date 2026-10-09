import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';

export type SponsorType = 'camisetas' | 'colectivo';

@Injectable({
  providedIn: 'root'
})
export class SponsorsService {

  API_URI: string;
  headers: HttpHeaders;

  constructor(private http: HttpClient, globalService: GlobalService) {
    this.API_URI = globalService.API_URI;
    this.headers = new HttpHeaders().set("Authorization", "Bearer " + localStorage.getItem("ACCESS_TOKEN"));
  }

  getSponsors(tipo: SponsorType, anio: number) {
    return this.http.get<any[]>(`${this.API_URI}/agreements/${tipo}/${anio}`, { headers: this.headers });
  }

  getSponsorById(id: number) {
    return this.http.get<any>(`${this.API_URI}/agreement/${id}`, { headers: this.headers });
  }

  createSponsor(tipo: SponsorType, anio: number, sponsorData: any) {
    return this.http.post<any>(`${this.API_URI}/agreement/${tipo}/${anio}`, sponsorData, { headers: this.headers });
  }

  updateSponsor(id: number, anio: number, sponsorData: any) {
    return this.http.put<any>(`${this.API_URI}/agreement/${id}/${anio}`, sponsorData, { headers: this.headers });
  }

  updatePayments(anio: number, paymentsData: any) {
    const payload = { pagos: paymentsData };
    return this.http.put(`${this.API_URI}/agreements/payments/${anio}`, payload, { headers: this.headers });
  }

  initializeYear(anio: number) {
    return this.http.post<any>(`${this.API_URI}/agreements/initialize-year/${anio}`, {}, { headers: this.headers });
  }
}
