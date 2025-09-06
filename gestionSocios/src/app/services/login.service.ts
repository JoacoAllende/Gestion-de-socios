import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  API_URI;
  authSubject = new BehaviorSubject(false);
  private token: string = '';

  constructor(private http: HttpClient, private globalService: GlobalService) {
    this.API_URI = globalService.API_URI;
  }

  loginUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.API_URI}/login`, user)
      .pipe(tap(
        (res: any) => {
          if (res) {
            this.saveToken(res.accessToken, res.expireIn);
          }
        }
      ))
  }

  logout(): void {
    this.token = '';
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("EXPIRES_IN");
    localStorage.setItem('activateUser', JSON.stringify(false));
    this.globalService.activo = false;
  }

  private saveToken(token: string, expiresIn: string): void {
    localStorage.setItem("ACCESS_TOKEN", token);
    localStorage.setItem("EXPIRES_IN", expiresIn);
    localStorage.setItem('activateUser', JSON.stringify(true));
    this.token = token;
  }

  public isTokenExpired(): boolean {
    const expiresIn = localStorage.getItem("EXPIRES_IN");
    if (!expiresIn) {
      return true;
    }

    const expirationDate = new Date(expiresIn);
    const currentDate = new Date();

    return expirationDate <= currentDate;
  }

}
