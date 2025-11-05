import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-mat-dialog',
  imports: [MatDialogModule, MatButtonModule],
  standalone: true,
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Confirmar</button>
    </mat-dialog-actions>
  `
})
export class ConfirmMatDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }) {}
}
