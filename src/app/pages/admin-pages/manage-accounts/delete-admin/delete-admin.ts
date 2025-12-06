import { CommonModule, Location as AngularLocation } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { BottonNav } from '../../../../components/botton-nav/botton-nav';
import { Header } from '../../../../components/header/header';
import { Router } from '@angular/router';
import { Observable, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { UserSearch } from '../../../../interfaces/UserSearch';
import { Search } from '../../../../services/search/search';
import { Admin } from '../../../../services/admin/admin';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmMatDialog } from '../../../../components/mat-dialog/mat-dialog/mat-dialog';
import { SecurityService } from '../../../../services/securityService/security-service';

@Component({
  selector: 'app-delete-admin',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    TranslateModule,
    Header,
    BottonNav,
  ],
  templateUrl: './delete-admin.html',
  styleUrl: './delete-admin.css',
})
export class DeleteAdmin {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private searchService = inject(Search); // Reutilizamos tu servicio de búsqueda
  private adminService = inject(Admin); // Tu servicio para eliminar/verificar
  private dialog = inject(MatDialog);
  private location = inject(AngularLocation);
  private securityService = inject(SecurityService);

  // Estado
  currentStep = 1;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  // Paso 1: Formulario de Verificación
  verifyForm: FormGroup;

  // Paso 2: Búsqueda
  searchControl = new FormControl('');
  userSearchResults$!: Observable<UserSearch[]>;
  selectedUser = signal<UserSearch | null>(null);

  constructor() {
    this.verifyForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Configuración del autocompletado (Igual que tu SearchBar)
    this.userSearchResults$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        const query = value || '';
        // Solo buscamos si empieza con @ o tiene texto
        const cleanQuery = query.startsWith('@') ? query.substring(1) : query;

        if (cleanQuery.length > 1) {
          return this.searchService.searchUsers(cleanQuery);
        }
        return of([]);
      })
    );
  }

  // --- PASO 1: LÓGICA ---

  verifyIdentity() {
    if (this.verifyForm.invalid) return;

    const { password, confirmPassword } = this.verifyForm.value;

    // 1. Validación local de coincidencia
    if (password !== confirmPassword) {
      this.snackBar.open('Las contraseñas no coinciden.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    // 2. VALIDACIÓN REAL CON EL BACKEND
    this.securityService.validateCurrentPassword(password).subscribe({
      next: (isValid) => {
        this.isLoading = false;
        if (isValid) {
          // Si el backend dice que es correcta, avanzamos
          this.currentStep = 2;
        }
      },
      error: (err) => {
        this.isLoading = false;
        // Si el backend devuelve error (403 Forbidden), mostramos mensaje
        this.snackBar.open('La contraseña ingresada es incorrecta.', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  // --- PASO 2: LÓGICA ---

  displayUser(user: UserSearch): string {
    return user ? `@${user.username}` : '';
  }

  onUserSelected(event: MatAutocompleteSelectedEvent): void {
    const user: UserSearch = event.option.value;
    this.selectedUser.set(user); // Guardamos el usuario seleccionado
  }

  clearSelection() {
    this.selectedUser.set(null);
    this.searchControl.setValue('');
  }

  deleteSelectedAdmin(username: string) {
    const userToDelete = this.selectedUser();
    if (!userToDelete) return;

    // Recuperamos la contraseña ingresada en el Paso 1
    const adminPassword = this.verifyForm.get('password')?.value;

    const dialogRef = this.dialog.open(ConfirmMatDialog, {
      data: {
        title: 'Revocar Permisos de Administrador',
        message: `¿Estás seguro de quitar el rol ADMIN a @${userToDelete.username}? Pasará a ser un usuario normal.`,
        confirmButtonText: 'Confirmar Revocación',
        confirmButtonColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.executeRevoke(userToDelete.username, adminPassword);
      }
    });
  }

  private executeRevoke(targetUsername: string, adminPassword: string) {
    this.isLoading = true;

    this.adminService.revokeAdmin({ targetUsername, adminPassword }).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open(`Rol de administrador revocado a @${targetUsername}.`, 'Cerrar', {
          duration: 4000,
        });
        this.router.navigate(['/admin-panel']); // O la ruta de gestión de cuentas
      },
      error: (err) => {
        this.isLoading = false;
        let msg = 'Ocurrió un error al procesar la solicitud.';

        // Mapeo de errores del backend
        if (err.status === 403) msg = 'Tu contraseña de administrador es incorrecta.';
        if (err.status === 404) msg = 'El usuario no existe.';
        if (err.status === 409) msg = err.error.message || 'Conflicto al realizar la acción.';

        this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });

        // Si la contraseña estaba mal (403), quizás quieras devolverlo al paso 1
        if (err.status === 403) {
          this.currentStep = 1;
          this.verifyForm.get('password')?.reset();
          this.verifyForm.get('confirmPassword')?.reset();
        }
      },
    });
  }

  goBack() {
    if (this.currentStep === 2) {
      this.currentStep = 1;
      this.selectedUser.set(null);
    } else {
      this.location.back();
    }
  }
}
