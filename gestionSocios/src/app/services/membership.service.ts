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

  getMemberships(anio: number) {
    return this.http.get<any[]>(`${this.API_URI}/memberships/${anio}`, { headers: this.headers });
  }

  getActiveMemberships() {
    return this.http.get<any[]>(`${this.API_URI}/memberships-active`, { headers: this.headers });
  }

  getDischargedMemberships() {
    return this.http.get<any[]>(`${this.API_URI}/memberships-discharged`, { headers: this.headers });
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

  createMembership(anio: number, membershipData: any) {
    return this.http.post<any>(`${this.API_URI}/membership/${anio}`, membershipData, { headers: this.headers });
  }

  getMembership(nro_socio: number) {
    return this.http.get<any>(`${this.API_URI}/membership/${nro_socio}`, { headers: this.headers });
  }

  updateMembership(nro_socio: number, anio: number, membershipData: any) {
    return this.http.put<any>(`${this.API_URI}/membership/${nro_socio}/${anio}`, membershipData, { headers: this.headers });
  }

  getMembershipStateByDni(dni: number) {
    return this.http.get<any[]>(`${this.API_URI}/membership-state/${dni}`, { headers: this.headers });
  }

}
