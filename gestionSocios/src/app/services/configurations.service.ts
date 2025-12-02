import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  API_URI: string;
  headers: HttpHeaders;

  constructor(private http: HttpClient, globalService: GlobalService) {
    this.API_URI = globalService.API_URI;
    this.headers = new HttpHeaders().set("Authorization", "Bearer " + localStorage.getItem("ACCESS_TOKEN"));
  }

  getActivityValues(): Observable<any> {
    return this.http.get(`${this.API_URI}/configuration/activity-values`, { headers: this.headers });
  }

  getDiscounts(): Observable<any> {
    return this.http.get(`${this.API_URI}/configuration/discounts`, { headers: this.headers });
  }

  getBaseMemberValue(): Observable<any> {
    return this.http.get(`${this.API_URI}/configuration/base-member-value`, { headers: this.headers });
  }

  updateActivityValue(id: number, valor: number): Observable<any> {
    return this.http.put(`${this.API_URI}/configuration/activity-value/${id}`, { valor }, { headers: this.headers });
  }

  updateDiscount(tipo: string, valor: number): Observable<any> {
    return this.http.put(`${this.API_URI}/configuration/discount/${tipo}`, { valor }, { headers: this.headers });
  }

  updateBaseMemberValue(valor: number): Observable<any> {
    return this.http.put(`${this.API_URI}/configuration/base-member-value`, { valor }, { headers: this.headers });
  }
}