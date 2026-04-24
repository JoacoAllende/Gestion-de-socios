import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {


  activo : Boolean = false;
  API_URI = environment.apiUrl;

  constructor() { }
}
