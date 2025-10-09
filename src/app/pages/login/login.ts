import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-login',
  imports: [MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  passwordInputType: string = 'password';
  showPasswordIcon: string = 'visibility';

  constructor() {}

  togglePasswordVisibility(): void {
    if (this.passwordInputType === 'password') {
      this.passwordInputType = 'text';
      this.showPasswordIcon = 'visibility_off';
    } else {
      this.passwordInputType = 'password';
      this.showPasswordIcon = 'visibility';
    }
  }
}
