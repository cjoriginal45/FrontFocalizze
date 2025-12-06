import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Header } from '../../../components/header/header';
import { BottonNav } from '../../../components/botton-nav/botton-nav';
import { Admin } from '../../../services/admin/admin';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Search } from '../../../services/search/search';
import {
  MatAutocompleteSelectedEvent,
  MatAutocomplete,
  MatOption,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { UserSearch } from '../../../interfaces/UserSearch';
import { debounceTime, distinctUntilChanged, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-create-admin',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    Header,
    BottonNav,
    MatAutocomplete,
    MatOption,
  ],
  templateUrl: './create-admin.html',
  styleUrl: './create-admin.css',
})
export class CreateAdmin implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(Admin);
  private snackBar = inject(MatSnackBar);
  private location = inject(Location);
  private router = inject(Router);
  private searchService = inject(Search);

  isLoading = false;

  // Observable para los resultados del autocompletado
  userSearchResults$!: Observable<UserSearch[]>;

  // Formulario con validadores
  adminForm = this.fb.group(
    {
      targetUsername: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  ngOnInit(): void {
    // Configuración del autocompletado
    this.userSearchResults$ = this.adminForm.get('targetUsername')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        const query = value || '';
        // Buscamos si tiene al menos 2 letras (con o sin @)
        if (query.length > 1) {
          const cleanQuery = query.startsWith('@') ? query.substring(1) : query;
          return this.searchService.searchUsers(cleanQuery);
        }
        return of([]);
      })
    );
  }

  // Cuando el usuario selecciona una opción de la lista
  onUserSelected(event: MatAutocompleteSelectedEvent): void {
    const user: UserSearch = event.option.value;

    // Solo actualizamos el valor del input, NO navegamos
    this.adminForm.patchValue({
      targetUsername: user.username, // Guardamos el username limpio
    });
  }

  // Validador personalizado para coincidencia de contraseñas
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    if (this.adminForm.invalid) return;

    this.isLoading = true;
    const { targetUsername, password } = this.adminForm.getRawValue();

    // Quitamos el '@' si el usuario lo ingresó
    const cleanUsername = targetUsername!.startsWith('@')
      ? targetUsername!.substring(1)
      : targetUsername!;

    this.adminService
      .promoteUser({
        targetUsername: cleanUsername,
        adminPassword: password!,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open(`¡@${cleanUsername} ahora es Administrador!`, 'OK', {
            duration: 4000,
            panelClass: ['success-snackbar'],
          });
          this.adminForm.reset();
          // Opcional: navegar atrás
          // this.goBack();
        },
        error: (err) => {
          this.isLoading = false;
          let msg = 'Ocurrió un error al procesar la solicitud.';

          if (err.status === 403) msg = 'Contraseña de administrador incorrecta.';
          if (err.status === 404) msg = 'El usuario especificado no existe.';
          if (err.status === 409) msg = 'Este usuario ya es administrador.'; // Si el backend lanza IllegalState

          this.snackBar.open(msg, 'Cerrar', {
            duration: 4000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }
}
