import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  API_URI: string;
  headers: HttpHeaders;

  constructor(private http: HttpClient, globalService: GlobalService) {
    this.API_URI = globalService.API_URI;
    this.headers = new HttpHeaders().set("Authorization", "Bearer " + localStorage.getItem("ACCESS_TOKEN"));
  }

  getIncomeByMembershipCard(mes: number, anio: number) {
    return this.http.get(`${this.API_URI}/income-by-card/${mes}/${anio}`, { headers: this.headers });
  }
}