import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [MatIconModule, RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  passwordInputType: string = 'password';
  passwordIcon: string = 'visibility';

  confirmPasswordInputType: string = 'password';
  confirmPasswordIcon: string = 'visibility';

  constructor() {}

  togglePasswordVisibility(): void {
    if (this.passwordInputType === 'password') {
      this.passwordInputType = 'text';
      this.passwordIcon = 'visibility_off';
    } else {
      this.passwordInputType = 'password';
      this.passwordIcon = 'visibility';
    }
  }

  toggleConfirmPasswordVisibility(): void {
    if (this.confirmPasswordInputType === 'password') {
      this.confirmPasswordInputType = 'text';
      this.confirmPasswordIcon = 'visibility_off';
    } else {
      this.confirmPasswordInputType = 'password';
      this.confirmPasswordIcon = 'visibility';
    }
  }
}
