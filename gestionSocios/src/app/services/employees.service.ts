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

  getEmployees(anio: number) {
    return this.http.get<any[]>(`${this.API_URI}/employees/${anio}`, { headers: this.headers });
  }

  getEmployeeById(id: number) {
    return this.http.get<any[]>(`${this.API_URI}/employee/${id}`, { headers: this.headers });
  }

  createEmployee(anio: number, employeeData: any) {
    return this.http.post<any>(`${this.API_URI}/employee/${anio}`, employeeData, { headers: this.headers });
  }

  updateEmployee(id: number, anio: number, employeeData: any) {
    return this.http.put<any>(`${this.API_URI}/employee/${id}/${anio}`, employeeData, { headers: this.headers });
  }

  updatePayments(paymentsData: any) {
    const payload = { salaries: paymentsData };
    return this.http.put(`${this.API_URI}/employee-salary`, payload, { headers: this.headers });
  }
}
