import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { Header } from '../../../../components/header/header';
import { BottonNav } from '../../../../components/botton-nav/botton-nav';
import { Admin } from '../../../../services/admin/admin';
import { Search } from '../../../../services/search/search';
import { SecurityService } from '../../../../services/securityService/security-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Observable, of, switchMap } from 'rxjs';
import { UserSearch } from '../../../../interfaces/UserSearch';

@Component({
  selector: 'app-ban-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatIconModule,
    MatRadioModule,
    Header,
    BottonNav,
  ],
  templateUrl: './ban-user.html',
  styleUrl: './ban-user.css',
})
export class BanUser implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(Admin);
  private searchService = inject(Search);
  private securityService = inject(SecurityService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private location = inject(Location);

  // Estados
  currentStep = 1;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  // Formularios
  banDataForm: FormGroup;
  passwordForm: FormGroup;

  // Autocompletado
  userSearchResults$!: Observable<UserSearch[]>;

  constructor() {
    // Paso 1: Datos del Baneo
    this.banDataForm = this.fb.group({
      targetUsername: ['', [Validators.required, Validators.minLength(3)]],
      reason: ['', [Validators.required, Validators.minLength(5)]],
      duration: ['WEEK', [Validators.required]], // Valor por defecto: Una semana
    });

    // Paso 2: Confirmación de Identidad (Admin)
    this.passwordForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Configurar búsqueda de usuario
    this.userSearchResults$ = this.banDataForm.get('targetUsername')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        const query = value || '';
        const cleanQuery = query.startsWith('@') ? query.substring(1) : query;
        if (cleanQuery.length > 1) {
          return this.searchService.searchUsers(cleanQuery);
        }
        return of([]);
      })
    );
  }

  // --- Lógica Paso 1 ---

  onUserSelected(event: MatAutocompleteSelectedEvent): void {
    const user: UserSearch = event.option.value;
    this.banDataForm.patchValue({ targetUsername: user.username });
  }

  goToStep2(): void {
    if (this.banDataForm.invalid) return;
    this.currentStep = 2;
  }

  // --- Lógica Paso 2 ---

  confirmBan(): void {
    if (this.passwordForm.invalid) return;

    const { password, confirmPassword } = this.passwordForm.value;

    if (password !== confirmPassword) {
      this.snackBar.open('Las contraseñas no coinciden.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    // 1. Validar contraseña con backend
    this.securityService.validateCurrentPassword(password).subscribe({
      next: (isValid) => {
        // Si el backend devuelve 200 OK y true
        if (isValid) {
          this.executeBan(password);
        } else {
          // Caso raro (si el backend devuelve 200 pero false)
          this.isLoading = false;
          this.snackBar.open('Contraseña incorrecta.', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        }
      },
      error: (err) => {
        this.isLoading = false;

        // --- AQUÍ ESTÁ LA CORRECCIÓN ---
        if (err.status === 403 || err.status === 401) {
          // Si el error es de permisos/autenticación, es que la contraseña está mal
          this.snackBar.open('La contraseña ingresada es incorrecta.', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        } else {
          // Si es cualquier otro error (500, 0, 404), es problema de conexión/servidor
          this.snackBar.open('Ocurrió un error de conexión.', 'Cerrar', { duration: 3000 });
        }
      },
    });
  }

  private executeBan(adminPassword: string): void {
    const banData = this.banDataForm.getRawValue();

    // Limpiar username
    const cleanUsername = banData.targetUsername.startsWith('@')
      ? banData.targetUsername.substring(1)
      : banData.targetUsername;

    const request = {
      targetUsername: cleanUsername,
      reason: banData.reason,
      duration: banData.duration,
      adminPassword: adminPassword,
    };

    this.adminService.banUser(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open(`Usuario @${cleanUsername} baneado correctamente.`, 'OK', {
          duration: 4000,
        });
        this.router.navigate(['/admin-panel']);
      },
      error: (err) => {
        this.isLoading = false;
        let msg = 'Error al realizar el baneo.';
        if (err.status === 403) msg = 'Contraseña de administrador incorrecta.';
        if (err.status === 404) msg = 'El usuario no existe.';
        if (err.status === 409) msg = err.error.message || 'No se puede banear a este usuario.';

        this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
      },
    });
  }

  goBack(): void {
    if (this.currentStep === 2) {
      this.currentStep = 1;
      this.passwordForm.reset();
    } else {
      this.location.back();
    }
  }
}
