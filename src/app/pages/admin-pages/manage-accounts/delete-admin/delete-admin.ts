import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
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
    BottonNav
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
      confirmPassword: ['', Validators.required]
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

    if (password !== confirmPassword) {
      this.snackBar.open('Las contraseñas no coinciden.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    // Simulación:
    setTimeout(() => {
      this.isLoading = false;
      // Si es correcto:
      this.currentStep = 2;
    }, 1000);
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

  deleteSelectedAdmin(username:string) {
    const userToDelete = this.selectedUser();
    if (!userToDelete) return;

    if(confirm(`¿Estás seguro de eliminar al administrador @${userToDelete.username}? Esta acción es irreversible.`)) {
      this.isLoading = true;
      
      this.adminService.deleteAdmin(userToDelete.username).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Administrador eliminado con éxito.', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/manage-accounts']); 
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('Error al eliminar el administrador. Inténtalo de nuevo.', 'Cerrar', { duration: 3000 });
        }
      }
      );
    }
  }

  goBack() {
    if (this.currentStep === 2) {
      this.currentStep = 1;
      this.selectedUser.set(null);
    } else {
      window.history.back();
    }
  }
}
