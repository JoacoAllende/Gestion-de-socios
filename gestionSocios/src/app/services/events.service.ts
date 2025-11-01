import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  API_URI: string;
  headers: HttpHeaders;

  constructor(private http: HttpClient, globalService: GlobalService) {
    this.API_URI = globalService.API_URI;
    this.headers = new HttpHeaders().set("Authorization", "Bearer " + localStorage.getItem("ACCESS_TOKEN"));
  }

  getEvents() {
    return this.http.get<any[]>(`${this.API_URI}/events`, { headers: this.headers });
  }

  getEventById(id: number) {
    return this.http.get<any>(`${this.API_URI}/events/${id}`, { headers: this.headers });
  }

  createEvent(event: any) {
    return this.http.post<any>(`${this.API_URI}/events`, event, { headers: this.headers });
  }

  updateEvent(id: number, event: any) {
    return this.http.put<any>(`${this.API_URI}/events/${id}`, event, { headers: this.headers });
  }

  getMovementsByEvent(eventId: number) {
    return this.http.get<any[]>(`${this.API_URI}/events/${eventId}/movements`, { headers: this.headers });
  }

  createMovement(eventId: number, movement: any) {
    return this.http.post<any>(`${this.API_URI}/events/${eventId}/movements`, movement, { headers: this.headers });
  }

  updateMovement(movementId: number, movement: any) {
    return this.http.put<any>(`${this.API_URI}/movements/${movementId}`, movement, { headers: this.headers });
  }

  deleteMovement(movementId: number) {
    return this.http.delete<any>(`${this.API_URI}/movements/${movementId}`, { headers: this.headers });
  }

  getDetailsByMovement(movementId: number) {
    return this.http.get<any[]>(`${this.API_URI}/movements/${movementId}/details`, { headers: this.headers });
  }

  createDetail(movementId: number, detail: any) {
    return this.http.post<any>(`${this.API_URI}/movements/${movementId}/details`, detail, { headers: this.headers });
  }

  updateDetail(detailId: number, detail: any) {
    return this.http.put<any>(`${this.API_URI}/details/${detailId}`, detail, { headers: this.headers });
  }

  deleteDetail(detailId: number) {
    return this.http.delete<any>(`${this.API_URI}/details/${detailId}`, { headers: this.headers });
  }
}