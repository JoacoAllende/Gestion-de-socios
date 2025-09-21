import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  API_URI: string;
  headers: HttpHeaders;

  constructor(private http: HttpClient, globalService: GlobalService) {
    this.API_URI = globalService.API_URI;
    this.headers = new HttpHeaders().set("Authorization", "Bearer " + localStorage.getItem("ACCESS_TOKEN"));
  }

  getEmployees() {
    return this.http.get<any[]>(`${this.API_URI}/employees`, { headers: this.headers });
  }

  createEmployee(employeeData: any) {
    return this.http.post<any>(`${this.API_URI}/employee`, employeeData, { headers: this.headers });
  }
}
