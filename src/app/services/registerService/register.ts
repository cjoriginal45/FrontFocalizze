import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  userId: number;
  username: string;
  displayName: string;
  email: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class Register {
  private apiUrl = `${environment.apiBaseUrl}/register`;

  constructor(private http: HttpClient) {}

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.apiUrl, registerRequest);
  }
}
