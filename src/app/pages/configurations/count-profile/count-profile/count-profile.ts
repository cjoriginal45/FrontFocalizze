import { Component, ElementRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCard, MatCardModule } from '@angular/material/card';
import { Header } from "../../../../components/header/header";
import { BottonNav } from "../../../../components/botton-nav/botton-nav"; 
import { UserProfileDownload } from '../../../../interfaces/UserProfileDownload';
// Importa las librerías para PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Auth } from '../../../../services/auth/auth';
import { ProfileService } from '../../../../services/profile/profile';

@Component({
  selector: 'app-count-profile',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    Header,
    BottonNav
],
  templateUrl: './count-profile.html',
  styleUrl: './count-profile.css',
})
export class CountProfile implements OnInit{
  private authService = inject(Auth);
  private profileService = inject(ProfileService);

  // Usamos una señal para manejar el estado asíncrono del usuario
  user: WritableSignal<UserProfileDownload | null> = signal(null);
  isLoading = signal(true);

  username: string = this.authService.getCurrentUser()?.username || '';

  @ViewChild('profileCard', { read: ElementRef, static: false }) profileCardRef!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    const currentAuthUser = this.authService.getCurrentUser();
    
    if (currentAuthUser) {
      this.isLoading.set(true); // Asegurarse de mostrar el loader
      this.profileService.getProfileForDownload(currentAuthUser.username).subscribe({
        next: (profileData) => {
          this.user.set(profileData);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error("Error al obtener los datos del perfil", err);
          this.isLoading.set(false);
        }
      });
    } else {
      console.error("No se encontró un usuario autenticado.");
      this.isLoading.set(false);
    }
  }

  
  public downloadProfileAsPDF(): void {
    // Verificamos que la referencia exista antes de usarla.
    if (!this.profileCardRef || !this.profileCardRef.nativeElement) {
      console.error("El elemento para generar el PDF no se ha encontrado en el DOM.");
      return;
    }

    const elementToCapture = this.profileCardRef.nativeElement;

    const actionSection = elementToCapture.querySelector('.action-section') as HTMLElement;
    if (actionSection) {
      actionSection.classList.add('hide-for-pdf');
    }

    html2canvas(elementToCapture, { 
      scale: 2,
      useCORS: true 
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(this.username+'-perfil-focalizze.pdf');

    }).finally(() => {
      if (actionSection) {
        actionSection.classList.remove('hide-for-pdf');
      }
    });
  }
}