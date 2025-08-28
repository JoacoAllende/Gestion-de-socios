import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {


  activo : Boolean = false;
  // API_URI = 'https://api.torneoatleticoayacucho.com';
  API_URI = 'http://localhost:3000';

  constructor() { }
}