import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private API_URI: string;
  private token: string = '';
  authSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private globalService: GlobalService) {
    this.API_URI = globalService.API_URI;
  }

  loginUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.API_URI}/login`, user).pipe(
      tap((res: any) => {
        if (res?.accessToken && res?.expiresIn) {
          this.saveToken(res.accessToken, res.expiresIn);
        }
      })
    );
  }

  logout(): void {
    this.token = '';
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("EXPIRES_IN");
    localStorage.setItem('activateUser', JSON.stringify(false));
    this.globalService.activo = false;
    this.authSubject.next(false);
  }

  private saveToken(token: string, expiresIn: number): void {
    const now = new Date();
    const expirationDate = new Date(now.getTime() + expiresIn * 1000);
    localStorage.setItem("ACCESS_TOKEN", token);
    localStorage.setItem("EXPIRES_IN", expirationDate.toISOString());
    localStorage.setItem('activateUser', JSON.stringify(true));
    this.token = token;
    this.authSubject.next(true);
  }

  public isTokenExpired(): boolean {
    const expiresIn = localStorage.getItem("EXPIRES_IN");
    if (!expiresIn) return true;
    const expirationDate = new Date(expiresIn);
    const currentDate = new Date();
    return expirationDate <= currentDate;
  }

  public getToken(): string | null {
    if (this.isTokenExpired()) {
      this.logout();
      return null;
    }
    return localStorage.getItem("ACCESS_TOKEN");
  }
}
