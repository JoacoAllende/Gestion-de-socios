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

  createMembership(membershipData: any) {
    return this.http.post(`${this.API_URI}/membership`, membershipData, { headers: this.headers });
  }

  getMembership(id: number) {
    return this.http.get<any>(`${this.API_URI}/membership/${id}`, { headers: this.headers });
  }

  updateMembership(id: number, membershipData: any) {
    return this.http.put(`${this.API_URI}/membership/${id}`, membershipData, { headers: this.headers });
  }

}
