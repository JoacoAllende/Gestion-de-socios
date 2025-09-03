import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class MembershipService {

  API_URI: string;
  headers: HttpHeaders;

  constructor(private http: HttpClient, globalService: GlobalService) {
    this.API_URI = globalService.API_URI;
    this.headers = new HttpHeaders().set("Authorization", "Bearer " + localStorage.getItem("ACCESS_TOKEN"));
  }

  getMemberships() {
    return this.http.get<any[]>(`${this.API_URI}/memberships`, { headers: this.headers });
  }

  getFutbolCategories() {
    return this.http.get<any[]>(`${this.API_URI}/memberships-categories/futbol`, { headers: this.headers });
  }

  getBasquetCategories() {
    return this.http.get<any[]>(`${this.API_URI}/memberships-categories/basquet`, { headers: this.headers });
  }

  getPaletaCategories() {
    return this.http.get<any[]>(`${this.API_URI}/memberships-categories/paleta`, { headers: this.headers });
  }


  getMembershipCard() {
    return this.http.get<any[]>(`${this.API_URI}/memberships-card`, { headers: this.headers });
  }

  createMembership(membershipData: any) {
    return this.http.post(`${this.API_URI}/membership`, membershipData, { headers: this.headers });
  }

  getMembership(nro_socio: number) {
    return this.http.get<any>(`${this.API_URI}/membership/${nro_socio}`, { headers: this.headers });
  }

  updateMembership(nro_socio: number, membershipData: any) {
    return this.http.put(`${this.API_URI}/membership/${nro_socio}`, membershipData, { headers: this.headers });
  }

}
