import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateThreadModal } from '../../components/create-thread-modal/create-thread-modal';

@Injectable({
  providedIn: 'root'
})
export class ThreadModal {
  constructor(private dialog: MatDialog) { }

  openCreateThreadModal(): void {
    this.dialog.open(CreateThreadModal, {
      width: '90%',       
      maxWidth: '600px',    
      panelClass: 'create-thread-modal-panel', 
      autoFocus: false,     
    });
  }
}
