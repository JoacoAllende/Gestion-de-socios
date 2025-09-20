import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class DailyBoxService {

  API_URI: string;
  headers: HttpHeaders;

  constructor(private http: HttpClient, globalService: GlobalService) {
    this.API_URI = globalService.API_URI;
    this.headers = new HttpHeaders().set("Authorization", "Bearer " + localStorage.getItem("ACCESS_TOKEN"));
  }

  getDailyBox() {
    return this.http.get<any[]>(`${this.API_URI}/daily-box`, { headers: this.headers });
  }

  getMovementById(id: number) {
    return this.http.get<any>(`${this.API_URI}/daily-box/${id}`, { headers: this.headers });
  }

  createMovement(movement: any) {
    return this.http.post<any>(`${this.API_URI}/daily-box`, movement, { headers: this.headers });
  }

  updateMovement(id: number, movement: any) {
    return this.http.put<any>(`${this.API_URI}/daily-box/${id}`, movement, { headers: this.headers });
  }
}
