import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RegisterRequest } from '../../interfaces/RegisterRequest';
import { RegisterResponse } from '../../interfaces/RegisterResponse';


@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private apiUrl = `${environment.apiBaseUrl}/register`;

  constructor(private http: HttpClient) {}

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.apiUrl, registerRequest);
  }
}
