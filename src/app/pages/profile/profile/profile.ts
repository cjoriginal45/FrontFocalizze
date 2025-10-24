import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  // Propiedad para almacenar el nombre de usuario obtenido de la URL.
  // We'll store the username obtained from the URL in this property.
  username: string | null = null;

  // Inyectamos ActivatedRoute para acceder a la información de la ruta actual.
  // We inject ActivatedRoute to access information about the current route.
  constructor(private route: ActivatedRoute) { }

  // ngOnInit es el lugar perfecto para leer los parámetros de la ruta una vez.
  // ngOnInit is the perfect place to read route parameters once.
  ngOnInit(): void {
    // Nos suscribimos a los cambios de los parámetros en la URL.
    // 'snapshot' es suficiente si el componente siempre se destruye y se recrea al cambiar de perfil.
    // 'paramMap' es más robusto si se puede navegar de un perfil a otro sin salir del componente.
    this.route.paramMap.subscribe(params => {
      this.username = params.get('username');
      console.log('Mostrando perfil para el usuario:', this.username);
    });
  }
}
